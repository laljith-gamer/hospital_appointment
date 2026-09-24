-- Seed data for MediBook. All doctors, hospitals and details are fictional demo data.
-- Run after 001_schema.sql. Slots are generated relative to the date the seed runs,
-- spanning today and the next 13 days so the demo funnel always has availability.

insert into hospitals (name, address, city, phone) values
  ('Apollo Hospital', '12 Ring Road', 'Chennai', '+91-44-4000-1000'),
  ('Fortis Healthcare', '5 Bannerghatta Road', 'Bengaluru', '+91-80-4100-2000'),
  ('City General Hospital', '45 Station Road', 'Mumbai', '+91-22-3200-3000'),
  ('Sunrise Medical Center', '88 MG Road', 'Hyderabad', '+91-40-3300-4000'),
  ('Rainbow Children''s Hospital', '23 Lake View Street', 'Kochi', '+91-484-3500-5000');

insert into specialties (name, description) values
  ('Cardiology', 'Heart and blood vessel care'),
  ('Dermatology', 'Skin, hair and nail care'),
  ('Neurology', 'Brain and nervous system care'),
  ('Orthopedics', 'Bones, joints and muscles'),
  ('Pediatrics', 'Child healthcare'),
  ('General Medicine', 'Everyday health and wellness'),
  ('ENT', 'Ear, nose and throat care'),
  ('Ophthalmology', 'Eye care and vision'),
  ('Gynecology', 'Women''s health');

insert into doctors
  (name, specialty_id, hospital_id, qualification, experience_years, gender, bio, expertise, languages, consultation_fee, consultation_type, image_url, is_active)
values
  ('Dr. Ananya Sharma', (select id from specialties where name='Cardiology'), 1, 'MBBS, MD, DM (Cardiology)', 12, 'female',
   'Dr. Ananya Sharma treats conditions related to the heart and blood vessels, including blood pressure and heart-rhythm concerns. She is known for explaining results clearly and calmly.',
   '{"Hypertension","Heart rhythm concerns","Preventive heart checkups","Chest pain evaluation"}',
   '{"English","Hindi"}', 800, '{in-person,video}', null, true),
  ('Dr. Arjun Menon', (select id from specialties where name='Orthopedics'), 2, 'MBBS, MS (Orthopedics)', 9, 'male',
   'Dr. Arjun Menon focuses on bone and joint problems, sports injuries, and recovery after fractures.',
   '{"Fractures","Sports injuries","Joint pain","Back pain"}',
   '{"English","Malayalam"}', 700, '{in-person,video}', null, true),
  ('Dr. Priya Nair', (select id from specialties where name='Dermatology'), 1, 'MBBS, MD (Dermatology)', 7, 'female',
   'Dr. Priya Nair treats skin, hair and nail conditions with a focus on practical, long-term skin care.',
   '{"Acne","Eczema","Hair loss","Allergies"}',
   '{"English","Malayalam","Hindi"}', 600, '{in-person,video}', null, true),
  ('Dr. Rahul Kapoor', (select id from specialties where name='Neurology'), 3, 'MBBS, MD, DM (Neurology)', 14, 'male',
   'Dr. Rahul Kapoor cares for patients with headaches, epilepsy, and nerve-related conditions.',
   '{"Headaches","Epilepsy","Nerve pain","Stroke follow-up"}',
   '{"English","Hindi"}', 900, '{in-person}', null, true),
  ('Dr. Meera Iyer', (select id from specialties where name='Pediatrics'), 5, 'MBBS, MD (Pediatrics)', 10, 'female',
   'Dr. Meera Iyer provides everyday care for infants and children, from routine checkups to growth concerns.',
   '{"Well-child visits","Growth checks","Vaccination guidance","Childhood fever"}',
   '{"English","Tamil"}', 500, '{in-person,video}', null, true),
  ('Dr. Vikram Desai', (select id from specialties where name='General Medicine'), 4, 'MBBS, MD (Internal Medicine)', 6, 'male',
   'Dr. Vikram Desai handles general health concerns, seasonal illness and everyday chronic-condition follow-ups.',
   '{"Fever and infection","Diabetes follow-up","General checkups","Lifestyle advice"}',
   '{"English","Gujarati","Hindi"}', 400, '{in-person,video}', null, true),
  ('Dr. Sneha Kulkarni', (select id from specialties where name='ENT'), 3, 'MBBS, MS (ENT)', 8, 'female',
   'Dr. Sneha Kulkarni treats ear, nose and throat problems including sinus issues and hearing concerns.',
   '{"Sinusitis","Tonsillitis","Hearing concerns","Vertigo"}',
   '{"English","Marathi","Hindi"}', 550, '{in-person}', null, true),
  ('Dr. Karthik Subramanian', (select id from specialties where name='Ophthalmology'), 2, 'MBBS, MS (Ophthalmology)', 11, 'male',
   'Dr. Karthik Subramanian provides eye exams, vision correction guidance and cataract evaluation.',
   '{"Vision testing","Cataract evaluation","Dry eye","Diabetic eye check"}',
   '{"English","Tamil"}', 650, '{in-person,video}', null, true),
  ('Dr. Lakshmi Rao', (select id from specialties where name='Gynecology'), 4, 'MBBS, MS (OBG)', 15, 'female',
   'Dr. Lakshmi Rao supports women''s health through pregnancy care, routine screenings and general gynecology.',
   '{"Pregnancy care","Routine screening","Menstrual health","Menopause care"}',
   '{"English","Telugu","Hindi"}', 850, '{in-person,video}', null, true),
  ('Dr. Imran Sheikh', (select id from specialties where name='Cardiology'), 3, 'MBBS, MD, DM (Cardiology)', 18, 'male',
   'Dr. Imran Sheikh specializes in heart-disease prevention and long-term cardiac follow-up.',
   '{"Heart disease prevention","Cholesterol management","Heart failure follow-up"}',
   '{"English","Urdu","Hindi"}', 1000, '{in-person}', null, true),
  ('Dr. Kavya Reddy', (select id from specialties where name='Pediatrics'), 5, 'MBBS, DCH, MD (Pediatrics)', 5, 'female',
   'Dr. Kavya Reddy focuses on newborn care and childhood nutrition and development.',
   '{"Newborn care","Nutrition","Development checks"}',
   '{"English","Telugu"}', 450, '{in-person,video}', null, true),
  ('Dr. Nikhil Verma', (select id from specialties where name='Orthopedics'), 4, 'MBBS, MS (Orthopedics)', 16, 'male',
   'Dr. Nikhil Verma works with complex joint problems and post-operative rehabilitation.',
   '{"Knee and hip pain","Arthritis care","Rehabilitation"}',
   '{"English","Hindi"}', 900, '{in-person}', null, true),
  ('Dr. Farah Khan', (select id from specialties where name='Dermatology'), 2, 'MBBS, MD (Dermatology)', 4, 'female',
   'Dr. Farah Khan offers everyday skin care and treatment for common skin conditions.',
   '{"Acne","Pigmentation","Skin allergies"}',
   '{"English","Hindi"}', 500, '{in-person,video}', null, true),
  ('Dr. Sanjay Pillai', (select id from specialties where name='General Medicine'), 1, 'MBBS, MD (Internal Medicine)', 13, 'male',
   'Dr. Sanjay Pillai is a general physician with a focus on preventive health and chronic-condition management.',
   '{"Preventive health","Hypertension","Diabetes"}',
   '{"English","Malayalam","Tamil"}', 450, '{in-person,video}', null, true),
  ('Dr. Ritika Malhotra', (select id from specialties where name='ENT'), 2, 'MBBS, MS (ENT)', 7, 'female',
   'Dr. Ritika Malhotra treats throat and voice problems along with general ENT care.',
   '{"Voice problems","Throat infections","Ear care"}',
   '{"English","Hindi","Punjabi"}', 600, '{in-person,video}', null, true),
  ('Dr. Suresh Babu', (select id from specialties where name='Neurology'), 4, 'MBBS, MD, DM (Neurology)', 20, 'male',
   'Dr. Suresh Babu has two decades of experience caring for patients with movement and nerve disorders.',
   '{"Parkinson''s care","Neuropathy","Memory concerns"}',
   '{"English","Telugu"}', 1100, '{in-person}', null, false),
  ('Dr. Aisha Mathew', (select id from specialties where name='Ophthalmology'), 5, 'MBBS, MS (Ophthalmology)', 3, 'female',
   'Dr. Aisha Mathew provides routine eye exams and pediatric vision screening.',
   '{"Eye exams","Pediatric vision","Dry eye"}',
   '{"English","Malayalam"}', 500, '{in-person,video}', null, true),
  ('Dr. Deepa Menon', (select id from specialties where name='Gynecology'), 1, 'MBBS, MS (OBG)', 9, 'female',
   'Dr. Deepa Menon provides general gynecology and preconception counseling.',
   '{"Preconception counseling","Menstrual health","Routine screening"}',
   '{"English","Malayalam"}', 750, '{in-person,video}', null, true);

-- Generate slots for the next 14 days for every active doctor.
-- Morning 09:00-10:30, Afternoon 13:00-14:00, Evening 16:00-17:00, half-hour steps.
insert into doctor_schedules (doctor_id, appointment_date, start_time, status)
select doc.id,
       day.date::date,
       s.start_time,
       'available'
from doctors doc
cross join generate_series(current_date, current_date + interval '13 days', interval '1 day') as day(date)
cross join (values ('09:00'::time),('09:30'),('10:00'),('10:30'),('13:00'),('13:30'),('14:00'),('16:00'),('16:30'),('17:00')) as s(start_time)
where doc.is_active
on conflict do nothing;

-- Make a handful of slots look realistically busy (deterministic pseudo-random pick).
update doctor_schedules
set status = 'booked'
where id in (
  select id from doctor_schedules
  where status = 'available'
    and (extract(day from appointment_date) + id) % 5 = 0
  limit 120
);
