"use client";

import type React from "react";
import { useState, useEffect } from "react";
// usePathname import will be removed
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { isAuthenticated } from "@/lib/authClient";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // const pathname = usePathname(); // Declaration removed

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const authStatus = isAuthenticated();
      // console.log removed
      setIsUserAuthenticated(authStatus);
    }
  }, [isMounted]); // pathname removed from dependency array

  if (!isMounted) {
    // Return a minimal structure or loader during server rendering / initial client hydration
    // This helps prevent flash of unstyled content or incorrect layout.
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {/* You can put a global loader here if you wish */}
          {/* For now, rendering children directly might cause a flash,
              but for unauthenticated routes like login, it might be acceptable
              if they don't rely on isUserAuthenticated state for their direct layout.
              A safer bet is often to return null or a loading spinner.
              Let's return a simple loading text.
          */}
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isUserAuthenticated ? (
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // Layout for unauthenticated users (e.g., login, signup pages)
            // These pages typically define their own layout structure (e.g., centered content)
            // via their specific layout files like app/(auth)/layout.tsx
            <main>{children}</main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
