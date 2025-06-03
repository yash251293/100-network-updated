"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth/');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const handleAuthChange = () => {
        // console.log('[RootLayout] authChange event triggered or initial check'); // Optional: for temporary debugging
        setIsUserAuthenticated(isAuthenticated());
      };

      handleAuthChange(); // Initial check

      window.addEventListener('authChange', handleAuthChange);

      return () => {
        window.removeEventListener('authChange', handleAuthChange);
      };
    }
  }, [isMounted]); // Dependency array remains [isMounted]

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
          {isAuthPage ? (
            <main>{children}</main> // Simple layout for /auth/* pages
          ) : isUserAuthenticated ? (
            <div className="flex h-screen bg-background"> {/* Authenticated Layout */}
              <Sidebar />
              <div className="flex flex-col flex-1"> {/* overflow-hidden was removed here */}
                <Header /> {/* Full Header */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <main>{children}</main> // Fallback for other unauthenticated pages (if any) or initial state
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
