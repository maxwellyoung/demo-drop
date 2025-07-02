import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Drop",
  description: "Share your music demos, fast and elegant",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="fixed top-6 left-6 z-20">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
            >
              Upload
            </Link>
            <span className="text-neutral-700">•</span>
            <Link
              href="/tracks"
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
            >
              All Tracks
            </Link>
          </div>
        </nav>

        <main className="container-wide py-12 md:py-20 animate-fade-in">
          {children}
        </main>
        <footer className="fixed bottom-6 right-6 z-10">
          <div className="text-xs text-neutral-500 bg-neutral-950/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-neutral-800/50">
            <a
              href="https://maxwellyoung.nz"
              className="hover:text-neutral-300 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              maxwellyoung.nz
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
