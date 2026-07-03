import type { Metadata } from "next";
import { Archivo_Black, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { TerminalSquare } from "lucide-react";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataWhisper",
  description: "Talk to your data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-neon-green">
          <header className="bg-stripes p-3 md:p-4 border-b-4 border-black flex justify-between items-center sticky top-0 z-50 shadow-[0px_8px_0px_rgba(0,0,0,0.1)]">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-90">
              <div className="bg-neon-green p-1.5 md:p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transform -rotate-6 hover:rotate-0 transition-all cursor-pointer">
                <TerminalSquare size={24} strokeWidth={3} className="text-black" />
              </div>
              <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none bg-white px-2 py-1 md:px-3 md:py-2 border-2 md:border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                DataWhisper
              </h1>
            </Link>
            <div className="flex items-center gap-4 md:gap-6">
              <nav className="hidden md:flex gap-4 font-mono font-bold text-sm uppercase bg-white px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Link href="/about" className="hover:bg-neon-green hover:text-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">About</Link>
                <Link href="/terms" className="hover:bg-neon-green hover:text-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">Terms</Link>
                <Link href="/privacy" className="hover:bg-neon-green hover:text-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">Privacy</Link>
              </nav>
              <div className="bg-black text-neon-green px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-mono uppercase font-bold transform rotate-2 border-2 md:border-4 border-black shadow-[2px_2px_0px_rgba(182,255,59,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_rgba(182,255,59,1)] hover:rotate-0 transition-all cursor-default">
                Talk To Your Data
              </div>
            </div>
          </header>

          {children}

          <footer className="border-t-4 border-black bg-white p-3 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 font-mono text-xs font-bold uppercase">
              <div>© 2026 DataWhisper</div>
              <div className="flex gap-4">
                <Link href="/about" className="hover:text-neon-green hover:bg-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">About</Link>
                <Link href="/terms" className="hover:text-neon-green hover:bg-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">Terms</Link>
                <Link href="/privacy" className="hover:text-neon-green hover:bg-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black">Privacy</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
