import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from 'sonner';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geist = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const instrument = localFont({
  src: "./fonts/instrument-serif-latin.woff2",
  variable: "--font-instrument",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pageory.app"),
  title: {
    default: "Pageory — Turn Your Online Presence Into Opportunities",
    template: "%s | Pageory",
  },
  description: "Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Pageory",
    title: "Pageory — Turn Your Online Presence Into Opportunities",
    description: "Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.",
    url: "https://pageory.app",
    images: [
      {
        url: "/logo.png",
        width: 1254,
        height: 1254,
        alt: "Pageory",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Pageory — Turn Your Online Presence Into Opportunities",
    description: "Create a beautiful page for your work, with an AI chatbot that answers visitor questions and helps turn interest into inquiries, bookings, and brand deals.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              { "@context": "https://schema.org", "@type": "Organization", name: "Pageory", url: "https://pageory.app" },
              { "@context": "https://schema.org", "@type": "WebSite", name: "Pageory", url: "https://pageory.app" },
            ]).replace(/</g, "\\u003c"),
          }}
        />
        <Analytics />
        {children}
        <Toaster position="bottom-right" richColors theme="light" />
      </body>
    </html>
  );
}
