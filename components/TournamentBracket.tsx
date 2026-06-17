"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface BracketMatch {
  id: string;
  stage: string;
  homeTeam: { name: string; flag: string; score?: number; code: string; logo?: string };
  awayTeam: { name: string; flag: string; score?: number; code: string; logo?: string };
  status: "completed" | "scheduled";
  date: string;
}

export default function TournamentBracket() {
  // Mock bracket data (Quarterfinals -> Semis -> Finals) for compact elegant representation
  const [activeStage, setActiveStage] = useState<"quarter" | "semi" | "final">("quarter");

  const quarterMatches: BracketMatch[] = [
    {
      id: "q1",
      stage: "Quarterfinal 1",
      homeTeam: { name: "Argentina", flag: "🇦🇷", code: "ARG", score: 2 },
      awayTeam: { name: "Netherlands", flag: "🇳🇱", code: "NED", score: 1 },
      status: "completed",
      date: "June 20, 2026"
    },
    {
      id: "q2",
      stage: "Quarterfinal 2",
      homeTeam: { name: "Brazil", flag: "🇧🇷", code: "BRA", score: 3 },
      awayTeam: { name: "Croatia", flag: "🇭🇷", code: "CRO", score: 0 },
      status: "completed",
      date: "June 20, 2026"
    },
    {
      id: "q3",
      stage: "Quarterfinal 3",
      homeTeam: { name: "France", flag: "🇫🇷", code: "FRA", score: 1 },
      awayTeam: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", score: 2 },
      status: "completed",
      date: "June 21, 2026"
    },
    {
      id: "q4",
      stage: "Quarterfinal 4",
      homeTeam: { name: "Germany", flag: "🇩🇪", code: "GER", score: 1 },
      awayTeam: { name: "Spain", flag: "🇪🇸", code: "ESP", score: 2 },
      status: "completed",
      date: "June 21, 2026"
    }
  ];

  const semiMatches: BracketMatch[] = [
    {
      id: "s1",
      stage: "Semifinal 1",
      homeTeam: { name: "Argentina", flag: "🇦🇷", code: "ARG", score: 1 },
      awayTeam: { name: "Brazil", flag: "🇧🇷", code: "BRA", score: 2 },
      status: "completed",
      date: "June 24, 2026"
    },
    {
      id: "s2",
      stage: "Semifinal 2",
      homeTeam: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG", score: 1 },
      awayTeam: { name: "Spain", flag: "🇪🇸", code: "ESP", score: 2 },
      status: "completed",
      date: "June 25, 2026"
    }
  ];

  const finalMatch: BracketMatch = {
    id: "f1",
    stage: "Grand Final",
    homeTeam: { name: "Brazil", flag: "🇧🇷", code: "BRA" },
    awayTeam: { name: "Spain", flag: "🇪🇸", code: "ESP" },
    status: "scheduled",
    date: "June 28, 2026"
  };

  const MatchNode = ({ match }: { match: BracketMatch }) => {
    const homeWon = match.homeTeam.score !== undefined && match.awayTeam.score !== undefined && match.homeTeam.score > match.awayTeam.score;
    const awayWon = match.homeTeam.score !== undefined && match.awayTeam.score !== undefined && match.awayTeam.score > match.homeTeam.score;

    const homeLogo = match.homeTeam.logo || `https://a.espncdn.com/i/teamlogos/countries/500/${match.homeTeam.code.toLowerCase()}.png`;
    const awayLogo = match.awayTeam.logo || `https://a.espncdn.com/i/teamlogos/countries/500/${match.awayTeam.code.toLowerCase()}.png`;

    return (
      <div className="bg-card border border-border/80 rounded-lg p-3 w-56 shadow-sm hover:border-primary transition select-none flex flex-col gap-2 relative">
        <div className="text-[9px] font-bold text-muted-foreground uppercase flex justify-between border-b border-border/50 pb-1">
          <span>{match.stage}</span>
          <span>{match.date}</span>
        </div>
        
        <div className="space-y-1.5 text-xs">
          {/* Home team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <img src={homeLogo} alt={match.homeTeam.name} className="w-4.5 h-4.5 object-contain filter drop-shadow-sm select-none" />
              <span className={`font-semibold ${homeWon ? "text-foreground font-extrabold" : "text-muted-foreground"}`}>{match.homeTeam.code}</span>
            </div>
            {match.homeTeam.score !== undefined ? (
              <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${homeWon ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{match.homeTeam.score}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground">-</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <img src={awayLogo} alt={match.awayTeam.name} className="w-4.5 h-4.5 object-contain filter drop-shadow-sm select-none" />
              <span className={`font-semibold ${awayWon ? "text-foreground font-extrabold" : "text-muted-foreground"}`}>{match.awayTeam.code}</span>
            </div>
            {match.awayTeam.score !== undefined ? (
              <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${awayWon ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{match.awayTeam.score}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground">-</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mobile tabs for stage filtering */}
      <div className="flex justify-center xl:hidden">
        <div className="bg-muted p-1 rounded-lg flex gap-1 text-xs">
          <button
            onClick={() => setActiveStage("quarter")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${activeStage === "quarter" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Quarterfinals
          </button>
          <button
            onClick={() => setActiveStage("semi")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${activeStage === "semi" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Semifinals
          </button>
          <button
            onClick={() => setActiveStage("final")}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${activeStage === "final" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Final
          </button>
        </div>
      </div>

      {/* Mobile Bracket View */}
      <div className="xl:hidden flex justify-center">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="py-4"
        >
          {activeStage === "quarter" && (
            <div className="flex flex-col gap-4">
              {quarterMatches.map(m => <MatchNode key={m.id} match={m} />)}
            </div>
          )}
          {activeStage === "semi" && (
            <div className="flex flex-col gap-4">
              {semiMatches.map(m => <MatchNode key={m.id} match={m} />)}
            </div>
          )}
          {activeStage === "final" && (
            <div className="flex flex-col gap-4">
              <MatchNode match={finalMatch} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Desktop Connected Tree View */}
      <div className="hidden xl:flex items-center justify-center gap-12 py-10 overflow-x-auto min-w-[800px] border border-border/40 rounded-xl bg-card/30 p-8">
        
        {/* Quarterfinals */}
        <div className="flex flex-col gap-12">
          <h3 className="text-center font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Quarterfinals</h3>
          <div className="flex flex-col gap-8">
            <MatchNode match={quarterMatches[0]} />
            <MatchNode match={quarterMatches[1]} />
          </div>
          <div className="flex flex-col gap-8">
            <MatchNode match={quarterMatches[2]} />
            <MatchNode match={quarterMatches[3]} />
          </div>
        </div>

        {/* Connectors: Quarters to Semis */}
        <div className="flex flex-col justify-around h-[340px] text-muted-foreground/35 select-none shrink-0 w-8">
          <div className="h-[100px] border-y-2 border-r-2 border-border/80 rounded-r-md"></div>
          <div className="h-[100px] border-y-2 border-r-2 border-border/80 rounded-r-md"></div>
        </div>

        {/* Semifinals */}
        <div className="flex flex-col justify-around h-[380px] gap-8">
          <h3 className="text-center font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Semifinals</h3>
          <div className="flex flex-col justify-around h-full">
            <MatchNode match={semiMatches[0]} />
            <MatchNode match={semiMatches[1]} />
          </div>
        </div>

        {/* Connectors: Semis to Final */}
        <div className="flex flex-col justify-center h-[240px] text-muted-foreground/35 select-none shrink-0 w-8">
          <div className="h-[135px] border-y-2 border-r-2 border-border/80 rounded-r-md"></div>
        </div>

        {/* Final */}
        <div className="flex flex-col justify-center gap-4">
          <h3 className="text-center font-bold text-xs uppercase tracking-wider text-primary border-b border-border pb-1">Grand Final</h3>
          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg gold-gradient-bg opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
            <MatchNode match={finalMatch} />
          </div>
        </div>

      </div>

    </div>
  );
}
