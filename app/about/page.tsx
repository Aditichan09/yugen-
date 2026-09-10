import Navbar from '../components/Navbar';

const colors = {
  bg: '#0a0b0e',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderStrong: 'rgba(251, 191, 36, 0.3)',
  gold: '#fbbf24',
  textMain: '#f3f4f6',
  textMuted: '#9ca3af',
  white: '#ffffff',
};

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function AboutPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.textMain,
        fontFamily: fontStack,
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Navbar />

        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.gold,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          About The Creator
        </h1>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${colors.glassBorder}`,
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', color: colors.white, margin: 0 }}>Aditi Mandiya</h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: colors.gold,
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '12px',
                border: `1px solid ${colors.glassBorderStrong}`,
              }}
            >
              Founder & Developer
            </span>
          </div>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: '8px 0 0 0', lineHeight: 1.6 }}>
            Built to solve a real problem in cross-border business communication — where a
            technically correct translation can still get the tone wrong. Yugen combines
            full-stack engineering with AI contextual modeling to help executives navigate
            English-Japanese correspondence with the right level of formality and cultural
            nuance. Currently building this independently, with plans to grow the team as the
            platform scales.
          </p>
        </div>
      </div>
    </main>
  );
}