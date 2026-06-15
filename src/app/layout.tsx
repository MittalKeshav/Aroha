import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Aroha",
  description: "Stay Focused",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background antialiased min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
        <Providers>
          <Navigation />
          <main className="flex-1 md:ml-64 pt-24 md:pt-0 pb-24 md:pb-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
