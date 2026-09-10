import Navbar from '../components/Navbar';

const colors = {
  bg: '#0a0b0e',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  gold: '#fbbf24',
  textMain: '#f3f4f6',
  textMuted: '#9ca3af',
  white: '#ffffff',
};

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function PrivacyPage() {
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

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.white, marginBottom: '4px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '13px', color: colors.textMuted }}>Last updated: August 2026</p>
        </div>

        <Section title="1. Introduction">
          Welcome to yugen ("we," "our," or "us"). We respect your privacy and are committed to
          protecting the confidential data you process through our enterprise English-Japanese
          localization suite.
        </Section>

        <Section title="2. Data Handling & Security">
          We understand that cross-border business communications often contain sensitive
          negotiation terms and proprietary details.
        </Section>

        <div style={{ marginBottom: '32px' }}>
          <ul style={{ paddingLeft: '20px', color: colors.textMuted, fontSize: '14px', lineHeight: 1.7 }}>
            <li style={{ marginBottom: '10px' }}>
              <strong style={{ color: colors.white }}>Text Processing:</strong> Text submitted for
              bi-directional translation and cultural risk scoring is securely transmitted to
              Google's Gemini API solely for real-time processing.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong style={{ color: colors.white }}>Current API Tier:</strong> We are currently
              using Google's free-tier Gemini API. Under Google's standard terms, this means
              Google may use submitted data in limited ways to improve their services. If you are
              sharing highly sensitive or confidential information, please be aware of this
              until we move to a paid, no-training-use API tier.
            </li>
            <li>
              <strong style={{ color: colors.white }}>Local Storage:</strong> Custom glossaries
              and preference settings are saved locally within your browser to ensure high
              performance and user control.
            </li>
          </ul>
        </div>

        <Section title="3. Contact Us">
          If you have any questions or security concerns regarding your data, you can reach out
          directly at: aditimandiya11@gmail.com
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fbbf24', marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>{children}</p>
    </div>
  );
}