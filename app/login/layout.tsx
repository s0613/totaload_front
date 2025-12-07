import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
      <Toaster />
    </div>
  );
}
