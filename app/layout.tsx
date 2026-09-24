import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSessionProfile } from "@/lib/session";

export const metadata: Metadata = {
  title: "MediBook — Find the right doctor. Book the right time.",
  description:
    "Search specialists, explore availability, and book hospital appointments in a few simple steps.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionProfile();
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
