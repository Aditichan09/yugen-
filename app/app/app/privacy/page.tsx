export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16 md:px-20 lg:px-32">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: August 2026</p>
        </div>

        <section className="space-y-4 text-slate-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
          <p>
            Welcome to yugen. We respect your privacy and are committed to protecting the confidential data you process through our enterprise English-Japanese localization suite.
          </p>

          <h2 className="text-xl font-semibold text-white">2. Data Handling & Security</h2>
          <p>
            We understand that cross-border business communications often contain sensitive negotiation terms and proprietary details.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>Text Processing:</strong> Text submitted for bi-directional translation and cultural risk scoring is securely transmitted solely for real-time processing.</li>
            <li><strong>No Data Retention for Training:</strong> Your private correspondence, draft messages, and business documents are never saved or used to train public AI models.</li>
            <li><strong>Local Storage:</strong> Custom glossaries and preference settings are saved locally within your browser environment for high performance.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white">3. Contact Us</h2>
          <p>
            If you have any questions or security concerns regarding your data, you can reach out directly via our support channels.
          </p>
        </section>
      </div>
    </main>
  );
}