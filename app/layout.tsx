import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import LiveScoreBar from "@/components/LiveScoreBar";
import MobileNav from "@/components/MobileNav";
import LuckyDrawQuestWidget from "@/components/LuckyDrawQuestWidget";

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
    <html lang="en" className="dark" suppressHydrationWarning>
    <head>
      <script src="https://quge5.com/88/tag.min.js" data-zone="250791" async data-cfasync="false"></script>
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
            <LuckyDrawQuestWidget />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
