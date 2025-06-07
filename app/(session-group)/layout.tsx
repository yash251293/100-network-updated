// app/(session-group)/layout.tsx
import type React from "react";

// This layout is for pages that are viewed by an authenticated user.
// The root app/layout.tsx already conditionally renders Sidebar and Header
// based on authentication state.
// Therefore, this layout should primarily focus on the structure of the content
// *within* the main area provided by the root layout.
// For many cases, it might just pass children through, or add minimal wrappers
// if all pages in this group share some common internal structure beyond Sidebar/Header.

export default function SessionGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If pages in this group need a specific container or padding INSIDE the main content area,
  // it can be added here. For now, just passing children through.
  return <>{children}</>;
}
