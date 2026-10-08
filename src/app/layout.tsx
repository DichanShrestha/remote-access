import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Smart Page — Your whole world, in one beautiful place",
  description: "A page that looks like you, answers like you, and turns passing visits into real connections.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" richColors theme="light" />
      </body>
    </html>
  );
}
