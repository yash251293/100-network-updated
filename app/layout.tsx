"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Inter, Lora, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/header-wrapper"; // Existing import from new UI
import { isAuthenticated } from "@/lib/authClient"; // For auth logic
import { ThemeProvider } from "@/components/theme-provider"; // New UI's theme provider
import { Toaster } from "@/components/ui/toaster"; // New UI's toaster

const inter = Inter({ subsets: ["latin"] });
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"]
});
const abhayaLibre = Abhaya_Libre({
  subsets: ["latin"],
  variable: "--font-abhaya-libre",
  weight: ["400", "500", "600", "700", "800"]
});

// Metadata remains as is
export const metadata: Metadata = {
  title: "100 Networks",
  description: "Follow employers and find your dream job",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const handleAuthChange = () => {
        setIsUserAuthenticated(isAuthenticated());
      };
      handleAuthChange(); // Initial check
      window.addEventListener('authChange', handleAuthChange);
      return () => {
        window.removeEventListener('authChange', handleAuthChange);
      };
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <html lang="en" className="light" suppressHydrationWarning>
        {/* Using new UI's fonts for loading screen body */}
        <body className={`${inter.className} ${lora.variable} ${abhayaLibre.variable} h-full bg-background text-foreground overflow-hidden`}>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-xl font-semibold text-foreground animate-pulse">
              Loading...
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      {/* Using new UI's fonts for main body */}
      <body className={`${inter.className} ${lora.variable} ${abhayaLibre.variable} h-full bg-background text-foreground overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isUserAuthenticated && !pathname.startsWith('/auth') ? (
            // Authenticated layout using new UI's HeaderWrapper
            // The div structure here is a common pattern, adjust if new UI's HeaderWrapper implies a different structure
            <div className="flex h-screen flex-col overflow-hidden bg-background"> {/* Modified to flex-col based on original new UI structure */}
              <HeaderWrapper />
              {/* Assuming children will include sidebar + main content area or just main content based on page */}
              <main className="flex-1 overflow-auto px-4 py-3">{children}</main>
            </div>
          ) : (
            // Simpler layout for auth pages or unauthenticated users
            <main>{children}</main>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
