import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Football Scores & World Cup Commentary - Football Score",
  description: "Follow live FIFA World Cup football scores, play-by-play text telemetry, minute updates, and interactive match event scorecards in real-time.",
  keywords: [
    "football score", "FIFA score", "football scorecard", "live score", 
    "World Cup Live Scores", "live football streaming", "FIFA live scores"
  ],
  alternates: {
    canonical: "/live",
  },
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.footballscore.info"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Live Scores",
        "item": "https://www.footballscore.info/live"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      {children}
    </>
  );
}
