// app/(auth)/layout.tsx
import type React from "react";

// Imports for Inter font, ThemeProvider, and globals.css are removed
// as they are expected to be handled by the root app/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This div provides the specific styling for the auth section (background, centering)
  // It will be rendered inside the <main> tag of the root app/layout.tsx
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 flex min-h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
}
