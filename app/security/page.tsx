import Navbar from '../components/Navbar';

export default function SecurityPage() {
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
          Security
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '40px' }}>
          Last updated: August 2026
        </p>

        <Section title="1. Encrypted connections">
          Every connection to yugen is encrypted using HTTPS (the padlock icon in your browser).
          This is handled automatically by our hosting provider, Vercel, on every page.
        </Section>

        <Section title="2. Where your data is processed">
          Translation requests are processed by Google's Gemini API. The app itself is hosted on
          Vercel's servers. We don't run our own separate servers that store your data outside of
          these two providers.
        </Section>

        <Section title="3. What we don't do">
          We don't sell your data to third parties. We don't share your translation content with
          anyone besides the AI service (Google Gemini) needed to generate the translation itself.
        </Section>

        <Section title="4. Where we are today, honestly">
          Yugen is currently a solo-built, early-stage product. We don't yet have formal security
          certifications (like SOC 2) that larger enterprise vendors carry. If your organization
          requires that level of compliance today, please reach out first so we can talk through
          your specific requirements before you rely on yugen for highly sensitive work.
        </Section>

        <Section title="5. Reporting a security concern">
          If you notice something that looks like a security issue, please email
          aditimandiya11@gmail.com directly rather than posting it publicly, so it can be looked
          at and fixed quickly.
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