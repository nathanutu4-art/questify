import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, MedievalSharp } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const medieval = MedievalSharp({
  variable: "--font-medieval",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Misiku - RPG Task Management Platform",
  description: "Ubah rutinitas harianmu menjadi petualangan RPG yang menyenangkan dengan XP, Level, dan Trophy Room 3D.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${medieval.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0c10] text-[#f4ebd0] selection:bg-[#c29b38] selection:text-[#1a110a]">{children}</body>
    </html>
  );
}
