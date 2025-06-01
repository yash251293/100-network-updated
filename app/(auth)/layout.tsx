// app/(auth)/layout.tsx
import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

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
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 to-indigo-50`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
