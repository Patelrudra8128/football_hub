import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveScoreBar from "@/components/LiveScoreBar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
  description: "Experience the ultimate World Cup soccer dashboard. Real-time score ticker, match action timelines, lineups, tactical field grids, group standings, and AI xG outcome predictions.",
  keywords: ["Football Score", "FIFA World Cup", "World Cup Live Scores", "Soccer AI predictions", "Lineups formation", "Group standings table", "Player profile stats"],
  openGraph: {
    title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
    description: "Get real-time World Cup statistics, match details timeline, squad lineups, group tables, and AI-powered match forecasts.",
    type: "website",
    locale: "en_US",
    siteName: "Football Score",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
    description: "Real-time World Cup standings, interactive metrics charts, and AI match outcome forecasts.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <meta name="monetag" content="0614d9bb504d89645de55b2bae139b70"/>

      {/*Monetag Tag - Push Ads*/}
      <script src="https://5gvci.com/act/files/tag.min.js?z=11157509" data-cfasync="false" async></script>

      {/*Monetag Tag - In-page Push Ads*/}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone = '11157575',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />

      {/*Monetag Tag - Vignette Ads*/}
      <script>(function(s){s.dataset.zone = '11157715',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement,
        document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
      </script>
    </head>
    <body
        className="antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
    <LanguageProvider>
      <ThemeProvider>
        <Navbar/>
        {/*<LiveScoreBar />*/}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-20 xl:pb-10">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
