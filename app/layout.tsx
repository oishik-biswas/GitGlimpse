import type { Metadata } from "next";
import { Archivo_Black, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "GitGlimpse | AI Repository Intelligence",
  description:
    "Swap GitHub links for GitGlimpse links and get instant repository summaries, architecture analysis, and resume-ready insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F1F1F1] text-black">{children}</body>
    </html>
  );
}
