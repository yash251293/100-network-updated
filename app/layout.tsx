// app/layout.tsx (Super-Simplified for Testing)
import type React from "react";
import "./globals.css"; // Keep globals for basic styling
// Removed Inter font, Sidebar, Header, ThemeProvider

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* No Sidebar, Header, or ThemeProvider */}
        {children}
      </body>
    </html>
  );
}
