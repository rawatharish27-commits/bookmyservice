'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [viteUrl, setViteUrl] = useState<string>('')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const { protocol, hostname } = window.location

    // Try Vite directly on port 5173 (most reliable in sandbox)
    // The Caddy gateway may not be configured to proxy to Vite
    const viteDirectUrl = `${protocol}//${hostname}:5173`
    setViteUrl(viteDirectUrl)

    // Show fallback options after a delay if the app hasn't loaded
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true)
    }, 6000)

    return () => clearTimeout(fallbackTimer)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a1628' }}>
      {/* ── Loading overlay ── visible until the iframe signals onLoad ── */}
      {!iframeLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            background: '#0a1628',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 10,
            padding: '24px',
            textAlign: 'center',
          }}
        >
          {/* BYS Brand */}
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            BookYourService
          </div>

          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
            Loading your hyperlocal service marketplace&hellip;
          </p>

          {/* Spinner */}
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'bys-spin 0.8s linear infinite',
            }}
          />

          <style>{`@keyframes bys-spin { to { transform: rotate(360deg); } }`}</style>

          {/* Fallback links – shown after a timeout */}
          {showFallback && (
            <div
              style={{
                marginTop: '16px',
                color: '#64748b',
                fontSize: '0.9rem',
                textAlign: 'center',
                lineHeight: 1.8,
              }}
            >
              <p style={{ margin: '0 0 12px' }}>Taking too long? Try opening the app directly:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {viteUrl && (
                  <a
                    href={viteUrl}
                    style={{
                      color: '#3b82f6',
                      textDecoration: 'underline',
                      fontSize: '1rem',
                    }}
                  >
                    Open BookYourService (Vite :5173)
                  </a>
                )}
                <a
                  href={`${window?.location?.protocol || 'http:'}//${window?.location?.hostname || 'localhost'}:5173`}
                  style={{
                    color: '#0ea5e9',
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                  }}
                >
                  Try Vite Frontend directly (:5173)
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Full-page iframe ── loads the Vite frontend through the Caddy gateway ── */}
      {viteUrl && (
        <iframe
          src={viteUrl}
          onLoad={() => setIframeLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          title="BookYourService"
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  )
}
