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
  title: "BookYourService - Find Trusted Home Service Professionals",
  description: "Book verified professionals for cleaning, plumbing, electrical work, and more. Get quality service with our satisfaction guarantee.",
  keywords: ["home services", "service marketplace", "book services", "cleaning", "plumbing", "electrical", "painting", "BookYourService"],
  authors: [{ name: "BookYourService" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "BookYourService - Find Trusted Home Service Professionals",
    description: "Book verified professionals for home services with our satisfaction guarantee.",
    siteName: "BookYourService",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookYourService - Find Trusted Home Service Professionals",
    description: "Book verified professionals for home services with our satisfaction guarantee.",
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
