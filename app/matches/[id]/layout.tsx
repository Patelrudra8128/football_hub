import { Metadata } from "next";
import { db } from "@/lib/api";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const match = await db.getMatchDetails(id);
    if (!match) {
      return {
        title: "Match Scorecard & Telemetry Center - Football Score",
        description: "Get real-time World Cup scores, head-to-head match stats, lineups, and AI predictions.",
        alternates: {
          canonical: `/matches/${id}`,
        }
      };
    }
    const teamsList = await db.getTeams();
    const homeTeam = teamsList.find(t => t.id === match.homeTeamId);
    const awayTeam = teamsList.find(t => t.id === match.awayTeamId);

    const homeName = homeTeam?.name || match.homeTeamId;
    const awayName = awayTeam?.name || match.awayTeamId;

    let title = `${homeName} vs ${awayName} Live Score & Scorecard - Football Score`;
    let description = `Follow ${homeName} vs ${awayName} live score, telemetry event timeline logs, announced squad lineups, H2H statistics, and AI predictions.`;

    if (match.status === "finished") {
      title = `${homeName} vs ${awayName} Match Scorecard & Results - Football Score`;
      description = `Get ${homeName} vs ${awayName} final match score of ${match.homeScore}-${match.awayScore}, goal timeline summaries, key statistics, and lineups.`;
    }

    return {
      title,
      description,
      keywords: [
        `${homeName} vs ${awayName}`, `${homeName} vs ${awayName} score`, 
        `${homeName} vs ${awayName} scorecard`, `${homeName} vs ${awayName} live`,
        `${homeName} vs ${awayName} predictions`, "football score", "football scorecard"
      ],
      alternates: {
        canonical: `/matches/${id}`,
      }
    };
  } catch (error) {
    console.error("Failed to generate metadata for match:", id, error);
    return {
      title: "Match Scorecard & Telemetry Center - Football Score",
      description: "Get real-time World Cup scores, head-to-head match stats, lineups, and AI predictions.",
      alternates: {
        canonical: `/matches/${id}`,
      }
    };
  }
}

export default async function MatchLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  let homeName = "Home Team";
  let awayName = "Away Team";
  let homeLogo = "";
  let awayLogo = "";
  let homeScore = 0;
  let awayScore = 0;
  let matchDate = new Date().toISOString();
  let status = "scheduled";

  try {
    const match = await db.getMatchDetails(id);
    if (match) {
      homeScore = match.homeScore;
      awayScore = match.awayScore;
      matchDate = match.date;
      status = match.status;

      const teamsList = await db.getTeams();
      const homeTeam = teamsList.find(t => t.id === match.homeTeamId);
      const awayTeam = teamsList.find(t => t.id === match.awayTeamId);
      if (homeTeam) {
        homeName = homeTeam.name;
        homeLogo = homeTeam.logo || "";
      }
      if (awayTeam) {
        awayName = awayTeam.name;
        awayLogo = awayTeam.logo || "";
      }
    }
  } catch (error) {
    console.error("Failed to fetch match details in layout:", id, error);
  }

  const matchEventJson = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `https://www.footballscore.info/matches/${id}#event`,
    "name": `${homeName} vs ${awayName}`,
    "description": `${homeName} vs ${awayName} match scorecard. Status: ${status}. Score: ${homeScore} - ${awayScore}`,
    "startDate": matchDate,
    "sport": "Soccer",
    "eventStatus": "https://schema.org/EventScheduled",
    "homeTeam": {
      "@type": "SportsTeam",
      "name": homeName,
      "logo": homeLogo
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": awayName,
      "logo": awayLogo
    },
    "location": {
      "@type": "Place",
      "name": "FIFA World Cup Stadium",
      "address": "Qatar / USA / Canada"
    },
    "result": status !== "scheduled" ? {
      "@type": "SportsEventResult",
      "score": `${homeScore}-${awayScore}`
    } : undefined
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
        "name": "Matches",
        "item": "https://www.footballscore.info/matches"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${homeName} vs ${awayName}`,
        "item": `https://www.footballscore.info/matches/${id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(matchEventJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      {children}
    </>
  );
}
