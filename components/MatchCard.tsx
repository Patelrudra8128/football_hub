"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Match, Team, MatchEvent } from "@/lib/mockData";
import { db } from "@/lib/api";
import { ChevronDown, ChevronUp, Calendar, Clock, BarChart2, ShieldAlert } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface MatchCardProps {
  match: Match;
  showDetailsButton?: boolean;
}

export default function MatchCard({ match, showDetailsButton = true }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    db.getTeams().then(teams => {
      setHomeTeam(teams.find(t => t.id === match.homeTeamId) || null);
      setAwayTeam(teams.find(t => t.id === match.awayTeamId) || null);
    });
  }, [match]);

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";

  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal": return "⚽";
      case "yellow_card": return "🟨";
      case "red_card": return "🟥";
      case "substitution": return "🔄";
      default: return "•";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/45 transition-all duration-200">
      
      {/* Header Info */}
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border/80 flex justify-between items-center text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
        <span>{match.stage} {match.group ? `• ${match.group}` : ""}</span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-destructive font-black animate-pulse bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded">
            {t("common.live")} {match.minute}&apos;
          </span>
        )}
        {isFinished && <span className="text-muted-foreground font-bold">{t("common.fullTime")}</span>}
        {isScheduled && <span className="text-muted-foreground font-bold">{t("common.scheduled")}</span>}
      </div>

      {/* Main Card Content */}
      <div className="p-5 md:p-6 flex items-center justify-between gap-4">
        
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl mb-2 filter drop-shadow-sm select-none">{homeTeam?.flag || "🏳️"}</span>
          <span className="text-xs md:text-sm font-black text-foreground tracking-tight">{homeTeam?.name || match.homeTeamId}</span>
          <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t("common.rank")} #{homeTeam?.fifaRanking}</span>
        </div>

        {/* Scoreboard Area */}
        <div className="flex flex-col items-center shrink-0 min-w-[90px]">
          {isScheduled ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{new Date(match.date).toLocaleDateString(language, {month: 'short', day: 'numeric'})}</span>
              <span className="text-[11px] font-bold font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">{new Date(match.date).toLocaleTimeString(language, {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold font-mono text-foreground tracking-tighter bg-background border border-border/75 rounded px-3 py-1.5 shadow-inner">
                <span className={isLive ? "text-primary animate-pulse" : ""}>{match.homeScore}</span>
                <span className="text-muted-foreground/35 font-light">:</span>
                <span className={isLive ? "text-primary animate-pulse" : ""}>{match.awayScore}</span>
              </div>
              {isLive && <span className="text-[8px] font-black text-primary uppercase tracking-widest animate-pulse mt-1">{t("common.live")}</span>}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl mb-2 filter drop-shadow-sm select-none">{awayTeam?.flag || "🏳️"}</span>
          <span className="text-xs md:text-sm font-black text-foreground tracking-tight">{awayTeam?.name || match.awayTeamId}</span>
          <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t("common.rank")} #{awayTeam?.fifaRanking}</span>
        </div>

      </div>

      {/* Quick Collapse Actions */}
      <div className="px-4 py-2 border-t border-border bg-muted/10 flex justify-between items-center text-xs">
        
        {/* Toggle expanded details */}
        {!isScheduled ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition py-1 font-bold cursor-pointer"
          >
            {expanded ? (
              <>
                <span>{t("matchCard.hideSummary")}</span>
                <ChevronUp className="w-4 h-4 text-primary" />
              </>
            ) : (
              <>
                <span>{t("matchCard.viewSummary")}</span>
                <ChevronDown className="w-4 h-4 text-primary" />
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground font-bold">{t("matchCard.predictionsReady")}</span>
        )}

        {showDetailsButton && (
          <Link
            href={`/matches/${match.id}`}
            className="text-primary hover:underline font-extrabold text-xs flex items-center gap-1 py-1 uppercase tracking-wider"
          >
            <span>{t("matchCard.matchDetails")}</span>
            <span>&rarr;</span>
          </Link>
        )}
      </div>

      {/* Expanded Live Summary Section */}
      {expanded && !isScheduled && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          
          {/* Match Events Timeline */}
          {match.events && match.events.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{t("matchCard.matchEvents")}</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {match.events.map(ev => {
                  const isHomeEvent = ev.teamId === match.homeTeamId;
                  return (
                    <div key={ev.id} className={`flex items-center gap-2 text-xs py-0.5 ${isHomeEvent ? "justify-start" : "justify-end text-right"}`}>
                      {isHomeEvent && (
                        <>
                          <span className="font-mono text-muted-foreground w-6 text-left">{ev.minute}&apos;</span>
                          <span className="font-bold text-foreground">{getEventIcon(ev.type)} {ev.playerName}</span>
                          {ev.detail && <span className="text-[10px] text-muted-foreground">({ev.detail})</span>}
                        </>
                      )}
                      {!isHomeEvent && (
                        <>
                          {ev.detail && <span className="text-[10px] text-muted-foreground">({ev.detail})</span>}
                          <span className="font-bold text-foreground">{ev.playerName} {getEventIcon(ev.type)}</span>
                          <span className="font-mono text-muted-foreground w-6 text-right">{ev.minute}&apos;</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats details */}
          {match.stats && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-primary" />
                <span>{t("matchCard.matchStatistics")}</span>
              </h4>
              
              <div className="space-y-2.5">
                {/* Possession */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span className="font-mono text-foreground">{match.stats.possession[0]}%</span>
                    <span>{t("matchCard.possession")}</span>
                    <span className="font-mono text-foreground">{match.stats.possession[1]}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${match.stats.possession[0]}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${match.stats.possession[1]}%` }} />
                  </div>
                </div>

                {/* Shots */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span className="font-mono text-foreground">{match.stats.shots[0]}</span>
                    <span>{t("matchCard.shots")}</span>
                    <span className="font-mono text-foreground">{match.stats.shots[1]}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${(match.stats.shots[1] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lineups List preview */}
          {match.lineups && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                <span>{t("matchCard.squadLineups")}</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <h5 className="font-extrabold text-foreground mb-1 border-b border-border/40 pb-0.5">{homeTeam?.name}</h5>
                  <ol className="list-decimal pl-4 space-y-0.5 text-muted-foreground text-[10px]">
                    {match.lineups.home.slice(0, 5).map((player, idx) => (
                      <li key={idx}>{player}</li>
                    ))}
                    <li className="text-[9px] list-none text-primary mt-1">+6 {t("matchCard.moreStarters")}</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-extrabold text-foreground mb-1 border-b border-border/40 pb-0.5">{awayTeam?.name}</h5>
                  <ol className="list-decimal pl-4 space-y-0.5 text-muted-foreground text-[10px]">
                    {match.lineups.away.slice(0, 5).map((player, idx) => (
                      <li key={idx}>{player}</li>
                    ))}
                    <li className="text-[9px] list-none text-primary mt-1">+6 {t("matchCard.moreStarters")}</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
