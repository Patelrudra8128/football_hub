"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/api";
import { Match, Team } from "@/lib/mockData";
import { Activity, Calendar } from "lucide-react";

export default function LiveScoreBar() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Load teams
    db.getTeams().then(setTeams);
    
    // Load matches
    db.getMatches().then(setMatches);

    // Subscribe to match changes
    const unsubscribe = db.subscribe("matches", () => {
      db.getMatches().then(setMatches);
    });

    return () => unsubscribe();
  }, []);

  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  // Smart timeline filtering for ticker: 
  // - All live matches
  // - Up to 4 recently finished matches (chronologically ordered)
  // - Up to 4 upcoming scheduled matches (chronologically ordered)
  const liveMatches = matches.filter(m => m.status === "live");
  
  const finishedMatches = matches
    .filter(m => m.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const scheduledMatches = matches
    .filter(m => m.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const visibleMatches = [
    ...[...finishedMatches].reverse(),
    ...liveMatches,
    ...scheduledMatches
  ];

  return (
    <div className="w-full bg-card border-b border-border/80 py-2.5 px-4 overflow-x-auto select-none no-scrollbar">
      <div className="container mx-auto flex items-center gap-4 min-w-max">
        
        {/* Live Indicator Label */}
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider shrink-0 pulse-teal-glow">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Scores</span>
        </div>

        {/* Scrollable list of match tickers */}
        <div className="flex items-center gap-3.5">
          {visibleMatches.map(match => {
            const isLive = match.status === "live";
            const isFinished = match.status === "finished";
            const homeTeam = getTeam(match.homeTeamId);
            const awayTeam = getTeam(match.awayTeamId);

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center gap-3 bg-muted/30 border border-border/60 hover:border-primary/45 rounded-lg px-3.5 py-1 text-xs text-foreground transition-all duration-200"
              >
                <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted/60 px-1 py-0.5 rounded tracking-wide shrink-0">
                  {match.stage}
                </span>

                {/* Score Summary */}
                <div className="flex items-center gap-1.5 font-bold">
                  <span>{homeTeam?.flag} {homeTeam?.code}</span>
                  {isFinished || isLive ? (
                    <span className="font-mono text-primary font-black px-1.5 bg-background border border-border/60 rounded">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 font-light font-mono text-[10px]">vs</span>
                  )}
                  <span>{awayTeam?.code} {awayTeam?.flag}</span>
                </div>

                {/* Live Pill */}
                {isLive && (
                  <span className="flex items-center gap-1 text-[9px] text-destructive bg-destructive/10 border border-destructive/20 font-black px-1.5 py-0.2 rounded uppercase animate-pulse">
                    {match.minute}&apos;
                  </span>
                )}

                {/* Date for scheduled matches */}
                {!isLive && !isFinished && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span>{new Date(match.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
