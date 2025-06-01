// app/(auth)/layout.tsx
import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"; // Corrected path based on root
import "../globals.css"; // Corrected path relative to app/(auth)/layout.tsx

const inter = Inter({ subsets: ["latin"] });

// Optional: Add metadata specific to auth pages if needed
// export const metadata = {
//   title: "Authentication - 100 Networks",
// };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}> {/* Kept suppressHydrationWarning from root */}
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 to-indigo-50`}> {/* Added example background */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Consistent with root, can be overridden if auth pages need a different default
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen flex-col items-center justify-center">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
