import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "BookMyService - Hyperlocal Service Marketplace",
  description: "Book verified professionals for home services with our satisfaction guarantee.",
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
