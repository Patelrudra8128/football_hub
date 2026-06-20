import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA World Cup Player Statistics & Profiles - Football Score",
  description: "Explore performance stats, profiles, goals, assists, appearance metrics, and tactical insights for FIFA World Cup performers.",
  keywords: [
    "Player profile stats", "football player metrics", "World Cup stats", 
    "FIFA top scorers", "squad player rosters", "midfielders defenders forwards statistics"
  ],
  alternates: {
    canonical: "/players",
  },
};

export default function PlayersLayout({
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
        "name": "Players Spotlight",
        "item": "https://www.footballscore.info/players"
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
