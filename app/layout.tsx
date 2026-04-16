import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real-time ASCII Camera",
  description: "Matrix style real-time webcam to ASCII renderer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-[#00ff9f] antialiased">{children}</body>
    </html>
  );
}
