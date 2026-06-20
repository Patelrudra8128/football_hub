import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import LiveScoreBar from "@/components/LiveScoreBar";
import MobileNav from "@/components/MobileNav";
import LuckyDrawQuestWidget from "@/components/LuckyDrawQuestWidget";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.footballscore.info"),
  title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
  description: "Get real-time FIFA World Cup scores, match scorecards, player statistics, group standings, and AI match outcomes predictions. Your ultimate football scorecard hub.",
  keywords: [
    "football", "football score", "FIFA world cup", "FIFA score", "scorecard", 
    "football scorecard", "live score", "World Cup Live Scores", "Soccer AI predictions", 
    "Lineups formation", "Group standings table", "Player profile stats"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
    description: "Get real-time FIFA World Cup scores, match scorecards, player statistics, group standings, and AI match outcomes predictions. Your ultimate football scorecard hub.",
    url: "https://www.footballscore.info",
    type: "website",
    locale: "en_US",
    siteName: "Football Score",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Score - FIFA World Cup AI Predictions & Live Scores",
    description: "Get real-time FIFA World Cup scores, match scorecards, player statistics, group standings, and AI match outcomes predictions.",
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
      <Script id="al5sm-ad-script">{`(function(s){s.dataset.zone='11165383',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
      </Script>
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
