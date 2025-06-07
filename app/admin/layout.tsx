// app/admin/layout.tsx
// This is a basic layout for admin pages.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container mx-auto py-4">
      {/* Optional: Add a common header or sidebar for admin section here */}
      {/* <nav>Admin Navigation</nav> */}
      {children}
    </section>
  );
}
