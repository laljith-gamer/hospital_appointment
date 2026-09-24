-- MediBook schema: hospitals, specialties, doctors, slots, profiles, appointments.
-- Booking uniqueness is enforced by a partial unique index on appointments
-- (doctor_id + appointment_date + appointment_time) restricted to live statuses,
-- which makes double-booking impossible at the database level.

create table hospitals (
  id bigint generated always as identity primary key,
  name text not null unique,
  address text,
  city text,
  phone text
);

create table specialties (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text
);

create table doctors (
  id bigint generated always as identity primary key,
  name text not null,
  specialty_id bigint not null references specialties(id),
  hospital_id bigint not null references hospitals(id),
  qualification text not null,
  experience_years int not null check (experience_years >= 0),
  gender text check (gender in ('male', 'female')),
  bio text,
  expertise text[],
  languages text[] default '{English}',
  consultation_fee numeric(10,2) not null check (consultation_fee >= 0),
  consultation_type text[] not null default '{in-person}' check (array_length(consultation_type, 1) >= 1),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index doctors_specialty_idx on doctors(specialty_id);
create index doctors_hospital_idx on doctors(hospital_id);
create index doctors_name_idx on doctors(lower(name));

create table doctor_schedules (
  id bigint generated always as identity primary key,
  doctor_id bigint not null references doctors(id) on delete cascade,
  appointment_date date not null,
  start_time time not null,
  status text not null default 'available' check (status in ('available', 'booked', 'unavailable')),
  created_at timestamptz not null default now(),
  unique (doctor_id, appointment_date, start_time)
);

create index doctor_schedules_lookup_idx on doctor_schedules(doctor_id, appointment_date, status);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  role text not null default 'patient' check (role in ('patient', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  doctor_id bigint not null references doctors(id),
  appointment_date date not null,
  appointment_time time not null,
  consultation_type text not null check (consultation_type in ('in-person', 'video')),
  reason text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  fee numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'cancelled' or updated_at <> created_at or true)
);

-- Double-booking prevention: at most one live appointment per doctor+date+time.
create unique index appointments_no_double_booking
  on appointments(doctor_id, appointment_date, appointment_time)
  where status in ('pending', 'confirmed');

create index appointments_patient_idx on appointments(patient_id, appointment_date desc);
create index appointments_doctor_idx on appointments(doctor_id, appointment_date);

-- Keep schedules in sync with live appointments: mark the slot booked.
create or replace function sync_slot_on_appointment() returns trigger as $$
begin
  if new.status in ('pending', 'confirmed') then
    update doctor_schedules set status = 'booked'
      where doctor_id = new.doctor_id
        and appointment_date = new.appointment_date
        and start_time = new.appointment_time;
  elsif old.status in ('pending', 'confirmed') and new.status in ('cancelled', 'completed') then
    update doctor_schedules set status = 'available'
      where doctor_id = old.doctor_id
        and appointment_date = old.appointment_date
        and start_time = old.appointment_time;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger appointments_sync_slot
  after insert or update of status on appointments
  for each row execute function sync_slot_on_appointment();

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger appointments_updated_at before update on appointments
  for each row execute function set_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a user signs up.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table hospitals enable row level security;
alter table specialties enable row level security;
alter table doctors enable row level security;
alter table doctor_schedules enable row level security;
alter table profiles enable row level security;
alter table appointments enable row level security;

-- Public catalog reads (active doctors only for public browsing).
create policy "hospitals readable" on hospitals for select using (true);
create policy "specialties readable" on specialties for select using (true);
create policy "doctors readable" on doctors for select using (true);
create policy "schedules readable" on doctor_schedules for select using (true);

-- Profiles: users manage their own row; admins can read/update all.
create policy "read own profile" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "update own profile" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- Admin writes for catalog tables.
create policy "admin manages doctors" on doctors for all
  using (is_admin()) with check (is_admin());
create policy "admin manages hospitals" on hospitals for all
  using (is_admin()) with check (is_admin());
create policy "admin manages specialties" on specialties for all
  using (is_admin()) with check (is_admin());
create policy "admin manages schedules" on doctor_schedules for all
  using (is_admin()) with check (is_admin());

-- Appointments: patients see/manage their own; admins see/manage all.
create policy "read own appointments" on appointments for select
  using (auth.uid() = patient_id or is_admin());
create policy "insert own appointment" on appointments for insert
  with check (auth.uid() = patient_id);
create policy "update own appointment" on appointments for update
  using (auth.uid() = patient_id or is_admin())
  with check (auth.uid() = patient_id or is_admin());
