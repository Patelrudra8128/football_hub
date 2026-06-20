import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Football Match Predictions & Win Probability - Football Score",
  description: "Get data-driven AI match forecasts, historical head-to-head records, squad power indexes, expected goals (xG), and win probability metrics.",
  keywords: [
    "Soccer AI predictions", "football score forecasting", "FIFA match predictions", 
    "World Cup predictions", "win probability calculator", "xG forecasts"
  ],
  alternates: {
    canonical: "/predictions",
  },
};

export default function PredictionsLayout({
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
        "name": "AI Predictions",
        "item": "https://www.footballscore.info/predictions"
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
