import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorHub",
  description: "Your all-in-one creator studio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}