import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "BookMyService — Palwal's #1 Home Service Platform | AC Repair, Electrician, Plumber",
  description: "Book verified technicians for AC repair, RO service, electrician, plumber, TV repair & more in Palwal. Service within 2 hours. 3 months warranty. Fixed pricing from ₹99.",
  keywords: [
    "AC repair Palwal", "electrician Palwal", "plumber Palwal", "RO service Palwal",
    "home service Palwal", "appliance repair Palwal", "TV repair Palwal",
    "geyser repair Palwal", "water purifier Palwal", "washing machine repair Palwal",
    "water tank cleaning Palwal", "movers and packers Palwal",
    "BookMyService", "book my service", "home service booking",
    "verified technician", "same day service", "service warranty",
    "HUDA Sector Palwal", "Camp Colony Palwal", "Railway Road Palwal",
  ],
  authors: [{ name: "BookMyService" }],
  creator: "BookMyService",
  publisher: "BookMyService",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "BookMyService",
    title: "BookMyService — Palwal's #1 Home Service Platform",
    description: "AC Repair, RO Service, Electrician, Plumber & More — Service Within 2 Hours. 3 Months Warranty. Starting ₹99.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookMyService — Palwal's #1 Home Service Platform",
    description: "Book verified technicians for home services in Palwal. Service within 2 hours. 3 months warranty.",
  },
  other: {
    'cache-control': 'no-cache',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className="antialiased bg-background text-foreground m-0 p-0">
        {children}
      </body>
    </html>
  );
}
