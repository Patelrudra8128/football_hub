import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA World Cup Matches Schedule & Scorecard Center - Football Score",
  description: "Browse the full FIFA World Cup match schedule, historical fixtures, upcoming timetables, and detailed scorecards for all national teams.",
  keywords: [
    "scorecard", "football scorecard", "football score", "FIFA world cup matches",
    "World Cup schedule", "fixtures list", "tournament group matches"
  ],
  alternates: {
    canonical: "/matches",
  },
};

export default function MatchesLayout({
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
        "name": "Matches",
        "item": "https://www.footballscore.info/matches"
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
