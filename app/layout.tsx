import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yugen — Executive Translation Suite",
  description: "Bi-directional English-Japanese translation and cultural localization suite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {mainLayoutWrapper(children)}
      </body>
    </html>
  );
}

function mainLayoutWrapper(children: React.ReactNode) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 p-4 font-bold tracking-wider">
        YUGEN 創
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}