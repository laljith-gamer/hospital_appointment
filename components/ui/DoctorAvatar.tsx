import { initials } from "./avatar";

export function DoctorAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-lg",
    lg: "h-24 w-24 text-2xl",
  } as const;

  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden
      className={`flex ${sizes[size]} shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary-dark`}
    >
      {initials(name)}
    </span>
  );
}
