import Navbar from '../components/Navbar';

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0b0e',
        color: '#e2e8f0',
        padding: '24px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        lineHeight: 1.7,
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Navbar />

        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '40px' }}>
          Last updated: August 2026
        </p>

        <Section title="1. What this agreement is">
          By using yugen, you agree to these terms. If you don't agree with them, please don't
          use the app. We've tried to write these in plain language instead of dense legal
          jargon, so please read them.
        </Section>

        <Section title="2. What yugen does">
          Yugen helps you translate business text between English and Japanese, and gives you
          guidance on tone, politeness, and cultural context. It uses AI (Google's Gemini) to do
          this.
        </Section>

        <Section title="3. This is AI-generated, not a certified translation">
          Yugen's translations are created by an AI model. They are <strong>not</strong> reviewed
          by a professional human translator, and they are <strong>not</strong> a certified or
          legal translation. Please don't use yugen's output as the final word on legal
          contracts, official documents, or anything where a mistake could cause serious harm.
          For anything high-stakes, have a qualified human translator review it first.
        </Section>

        <Section title="4. You're responsible for what you submit">
          Please don't use yugen to translate anything illegal, harmful, or that you don't have
          the right to share (like someone else's confidential information without permission).
          You're responsible for the content you type into the app.
        </Section>

        <Section title="5. No guarantees">
          We do our best to keep yugen accurate and running smoothly, but we can't promise it
          will be perfect, error-free, or available 100% of the time. You use yugen at your own
          risk, and we can't be held responsible for business decisions made based on its output.
        </Section>

        <Section title="6. Changes to these terms">
          We may update these terms as yugen grows. If we make significant changes, we'll update
          the date at the top of this page.
        </Section>

        <Section title="7. Contact">
          Questions about these terms? Reach out at: aditimandiya11@gmail.com
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
      <p style={{ fontSize: '14px', color: '#cbd5e1' }}>{children}</p>
    </div>
  );
}