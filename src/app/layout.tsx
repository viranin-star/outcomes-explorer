import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outcomes Explorer — What will your degree actually earn?",
  description:
    "See real earnings trajectories, career entry probabilities, and outcomes transparency scores for graduate and professional programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-white text-slate-900`}>
        <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-semibold text-slate-900 tracking-tight">
              Outcomes Explorer
            </a>
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <a href="/compare" className="hover:text-slate-900 transition-colors">
                Compare
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
