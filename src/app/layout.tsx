import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookYourService - Find Trusted Home Service Professionals",
  description: "Book verified professionals for home services with our satisfaction guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
