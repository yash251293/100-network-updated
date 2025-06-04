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
        <body className={`${inter.className} h-screen`}> {/* Ensure inter.className is preserved and body can be full height */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-xl font-semibold text-foreground animate-pulse">
              Loading...
            </div>
          </div>
          {/* Optional: Include <ThemeProvider> here as well if the loading screen should respect themes,
               but that adds complexity. For now, bg-background should work with the default theme.
               If ThemeProvider is essential for bg-background to work correctly, it might need to wrap this.
               However, the main ThemeProvider is outside this !isMounted block.
               Let's keep it simple and assume bg-background works or falls back gracefully.
          */}
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
              <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <main>{children}</main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
