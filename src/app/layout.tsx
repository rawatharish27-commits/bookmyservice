import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookYourService - Trusted Home Service Professionals in India",
  description: "Book verified professionals for Plumbing, Electrical, and AC & HVAC home services across India. KYC verified providers, transparent pricing (₹199-₹499), and satisfaction guarantee. BookYourService Technologies Pvt. Ltd.",
  keywords: ["home services", "service marketplace India", "plumbing repair", "electrician booking", "AC repair service", "HVAC service", "BookYourService", "home maintenance India", "verified service providers"],
  authors: [{ name: "BookYourService Technologies Pvt. Ltd." }],
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://bookyourservice.co.in"),
  openGraph: {
    title: "BookYourService - Trusted Home Service Professionals",
    description: "Book verified professionals for Plumbing, Electrical, and AC & HVAC services. Transparent pricing starting ₹199.",
    siteName: "BookYourService",
    type: "website",
    url: "https://bookyourservice.co.in",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookYourService - Trusted Home Service Professionals",
    description: "Book verified professionals for Plumbing, Electrical, and AC & HVAC services. Starting ₹199.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
