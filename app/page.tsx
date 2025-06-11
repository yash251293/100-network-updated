// app/page.tsx
export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Minimal Home Page</h1>
      <p>If you see this, the basic page rendering is working without complex client components.</p>
      <p>The original landing page content has been temporarily removed to help debug a React Context error that might be related to client component usage in the main layout or its direct children.</p>
      <p>Next steps are to verify if this minimal page loads, then gradually re-introduce components or check `app/layout.tsx` and its direct imports like `HeaderWrapper` or `Header` for correct `"use client";` usage if they use client-side hooks.</p>
    </div>
  );
}
