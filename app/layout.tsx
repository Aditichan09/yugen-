export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        {/* Main application content */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Footer with your new links */}
        <footer className="border-t border-slate-800 py-6 px-6 flex justify-between items-center text-sm text-slate-400">
          <p>© 2026 yugen. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="/about" className="hover:text-white transition-colors">About</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </footer>
      </body>
    </html>
  );
}