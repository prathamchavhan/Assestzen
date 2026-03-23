"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "next-themes";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>OptiMedia AI | Monochrome</title>
      </head>
      <body className={`${font.className} antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-500`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
