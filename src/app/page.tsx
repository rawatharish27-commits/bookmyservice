export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#0a1628', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        BookYourService
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading your hyperlocal service marketplace...</p>
      <p style={{ color: '#475569', fontSize: '0.8rem' }}>Frontend: Vite + React (port 5173) | Backend: Hono API (port 3001)</p>
    </div>
  );
}
