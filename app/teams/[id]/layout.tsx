import { Metadata } from "next";
import { db } from "@/lib/api";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const teamsList = await db.getTeams();
    const team = teamsList.find(t => t.id === id);
    if (!team) {
      return {
        title: "National Football Team Profile - Football Score",
        description: "Get squad lineups, standings stats and AI prediction metrics for World Cup competitor teams.",
        alternates: {
          canonical: `/teams/${id}`,
        }
      };
    }

    return {
      title: `${team.name} Squad, Standings & Stats - Football Score`,
      description: `Get the latest ${team.name} national team squad, FIFA rankings, match scores, tactical lineups, head-to-head records and AI predictions.`,
      keywords: [
        `${team.name} football`, `${team.name} score`, `${team.name} squad`,
        `${team.name} FIFA world cup`, `${team.name} stats`, `${team.name} scorecard`,
        "football score", "scorecard"
      ],
      alternates: {
        canonical: `/teams/${id}`,
      }
    };
  } catch (error) {
    console.error("Failed to generate metadata for team:", id, error);
    return {
      title: "National Football Team Profile - Football Score",
      description: "Get squad lineups, standings stats and AI prediction metrics for World Cup competitor teams.",
      alternates: {
        canonical: `/teams/${id}`,
      }
    };
  }
}

export default async function TeamLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  let teamName = "National Team";
  let teamLogo = "";

  try {
    const teamsList = await db.getTeams();
    const team = teamsList.find(t => t.id === id);
    if (team) {
      teamName = team.name;
      teamLogo = team.logo || "";
    }
  } catch (error) {
    console.error("Failed to fetch team details in layout:", id, error);
  }

  const organizationJson = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": `https://www.footballscore.info/teams/${id}#organization`,
    "name": teamName,
    "sport": "Soccer",
    "logo": teamLogo,
    "memberOf": [
      {
        "@type": "SportsOrganization",
        "name": "FIFA"
      }
    ],
    "parentOrganization": {
      "@type": "SportsOrganization",
      "name": "FIFA"
    }
  };

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": teamName,
        "item": `https://www.footballscore.info/teams/${id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      {children}
    </>
  );
}
