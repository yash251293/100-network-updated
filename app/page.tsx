// app/page.tsx
export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', margin: '20px' }}>
      <h1>Minimal Home Page (Testing All Providers Removed)</h1>
      <p>If you see this, basic page rendering is working without SessionProvider, ThemeProvider, or HeaderWrapper from the main layout.</p>
      <p>This is a debugging step to confirm the absolute baseline rendering.</p>
    </div>
  );
}
