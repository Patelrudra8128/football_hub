import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA World Cup Standings & Group Points Table - Football Score",
  description: "View the official FIFA World Cup group stage standings, points charts, matches played, goal differential stats, and qualifying parameters.",
  keywords: [
    "FIFA World Cup Standings", "Group standings table", "points table", 
    "World Cup group stage", "league table rankings", "football tournament standings"
  ],
  alternates: {
    canonical: "/standings",
  },
};

export default function StandingsLayout({
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
        "name": "Group Standings",
        "item": "https://www.footballscore.info/standings"
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
