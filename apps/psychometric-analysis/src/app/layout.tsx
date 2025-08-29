import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Psychometric Analysis | Simple Ed",
  description: "Analyze exam items with Cronbach's alpha and other psychometric statistics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}