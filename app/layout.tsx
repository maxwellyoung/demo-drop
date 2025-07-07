import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { PlayerProvider } from "../components/PersistentMiniPlayer";
import KeyboardShortcutsProvider from "../components/KeyboardShortcutsProvider";
import GlobalUploadZone from "../components/GlobalUploadZone";
import Header from "../components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Drop",
  description: "Share your music demos, fast and elegant",
  manifest: "/manifest.json",
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
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-screen">
        <PlayerProvider>
          <KeyboardShortcutsProvider>
            <GlobalUploadZone>
              <Header />

              <main className="container-wide mb-24 pt-24 pb-12 md:pt-28 md:pb-20">
                {children}
              </main>

              <footer className="fixed bottom-6 right-6 z-10 md:bottom-10 md:right-10">
                <div className="text-xs text-neutral-500 bg-neutral-950/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-neutral-800/50">
                  <a
                    href="https://maxwellyoung.info"
                    className="hover:text-neutral-300 transition-colors duration-150"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    maxwellyoung.info
                  </a>
                </div>
              </footer>
            </GlobalUploadZone>
          </KeyboardShortcutsProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
