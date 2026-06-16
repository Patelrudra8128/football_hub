"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { Match, Team, MatchEvent } from "@/lib/mockData";
import { calculatePrediction, PredictionResult } from "@/lib/predictionEngine";
import { ArrowLeft, Calendar, Clock, BarChart2, Sparkles, AlertCircle, Award, Users } from "lucide-react";

// Soccer Field Lineups Representation (4-3-3)
function SoccerPitch({ starters }: { starters: string[] }) {
  // 11 positions mapped on the pitch (relative coordinates from bottom-left)
  const positions = [
    { label: "GK", bottom: "5%", left: "50%", name: starters[0] || "Goalkeeper" },
    
    { label: "LB", bottom: "20%", left: "15%", name: starters[1] || "Left Back" },
    { label: "CB", bottom: "18%", left: "38%", name: starters[2] || "Center Back" },
    { label: "CB", bottom: "18%", left: "62%", name: starters[3] || "Center Back" },
    { label: "RB", bottom: "20%", left: "85%", name: starters[4] || "Right Back" },
    
    { label: "LCM", bottom: "45%", left: "28%", name: starters[5] || "Midfielder" },
    { label: "CM", bottom: "40%", left: "50%", name: starters[6] || "Midfielder" },
    { label: "RCM", bottom: "45%", left: "72%", name: starters[7] || "Midfielder" },
    
    { label: "LW", bottom: "75%", left: "20%", name: starters[8] || "Left Winger" },
    { label: "ST", bottom: "82%", left: "50%", name: starters[9] || "Striker" },
    { label: "RW", bottom: "75%", left: "80%", name: starters[10] || "Right Winger" }
  ];

  const getLastName = (fullName: string) => {
    const parts = fullName.split(" ");
    return parts[parts.length - 1];
  };

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-emerald-600 rounded-2xl border-4 border-white/60 overflow-hidden shadow-inner flex flex-col justify-between p-2 select-none">
      {/* Field Lines */}
      {/* Outer line */}
      <div className="absolute inset-2 border-2 border-white/20 pointer-events-none" />
      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full pointer-events-none" />
      {/* Center line */}
      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/20 pointer-events-none" />
      {/* Penalty boxes */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-20 border-b-2 border-x-2 border-white/20 pointer-events-none" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 h-20 border-t-2 border-x-2 border-white/20 pointer-events-none" />

      {/* Render Players */}
      {positions.map((pos, idx) => (
        <div
          key={idx}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 transition-all duration-300"
          style={{ bottom: pos.bottom, left: pos.left }}
        >
          {/* Jersey circle */}
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center font-black text-[10px] text-white shadow-md">
            {idx + 1}
          </div>
          {/* Player label & Name */}
          <div className="flex flex-col items-center leading-none">
            <span className="text-[7px] text-white/75 font-bold uppercase tracking-tighter">{pos.label}</span>
            <span className="text-[9px] text-white font-extrabold bg-black/60 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-sm">
              {getLastName(pos.name)}
            </span>
          </div>
        </div>
      ))}

      <span className="absolute bottom-2 right-3 text-[8px] font-black uppercase text-white/40 tracking-widest pointer-events-none">
        4-3-3 Formation Grid
      </span>
    </div>
  );
}

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  
  const [activeTab, setActiveTab] = useState<"timeline" | "lineups" | "stats" | "prediction">("timeline");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    db.getMatchDetails(id).then(async (currentMatch) => {
      if (!currentMatch) {
        setLoading(false);
        return;
      }
      setMatch(currentMatch);

      const teamsList = await db.getTeams();
      const hTeam = teamsList.find(t => t.id === currentMatch.homeTeamId) || null;
      const aTeam = teamsList.find(t => t.id === currentMatch.awayTeamId) || null;
      setHomeTeam(hTeam);
      setAwayTeam(aTeam);

      if (hTeam && aTeam) {
        const pred = await calculatePrediction(hTeam.id, aTeam.id);
        setPrediction(pred);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    // Subscribe to database changes (simulation overrides)
    const unsubscribe = db.subscribe("matches", () => {
      loadData();
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24 text-xs text-muted-foreground">
        Loading match details from ESPN API...
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-muted-foreground">Match not found or failed to retrieve summary from ESPN.</p>
        <Link href="/matches" className="text-primary font-bold text-xs mt-4 block hover:underline">
          &larr; Back to Match Center
        </Link>
      </div>
    );
  }

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back Navigation */}
      <Link href="/matches" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-semibold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Match Center</span>
      </Link>

      {/* Hero Scoreboard Header */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Stage & Group */}
        <div className="text-center text-[10px] uppercase font-black text-primary tracking-widest mb-6">
          <span>{match.group} • {match.stage}</span>
        </div>

        {/* Board Layout */}
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          {/* Home team */}
          <div className="flex flex-col items-center text-center max-w-[150px] flex-1">
            <span className="text-5xl md:text-6xl mb-2 select-none filter drop-shadow-sm">{homeTeam?.flag || "🏳️"}</span>
            <span className="font-extrabold text-sm md:text-lg text-foreground leading-tight">{homeTeam?.name || match.homeTeamId}</span>
            {homeTeam?.fifaRanking && (
              <span className="text-[10px] text-muted-foreground font-semibold mt-1">FIFA Rank #{homeTeam.fifaRanking}</span>
            )}
          </div>

          {/* Score block */}
          <div className="flex flex-col items-center shrink-0">
            {match.status === "scheduled" ? (
              <div className="text-center space-y-1">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xs uppercase font-extrabold text-muted-foreground">{new Date(match.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                <p className="text-lg font-mono font-bold">{new Date(match.date).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex justify-center items-center gap-3 text-4xl md:text-5xl font-black font-mono text-foreground tracking-tighter bg-background border border-border/75 rounded-2xl px-5 py-2.5 shadow-inner">
                  <span className={isLive ? "text-primary animate-pulse" : ""}>{match.homeScore}</span>
                  <span className="text-muted-foreground/35 font-light">:</span>
                  <span className={isLive ? "text-primary animate-pulse" : ""}>{match.awayScore}</span>
                </div>

                {isLive && (
                  <span className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-black px-2.5 py-0.5 rounded uppercase animate-pulse">
                    Live {match.minute}&apos;
                  </span>
                )}
                
                {isFinished && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black px-2.5 py-0.5 rounded uppercase">
                    Full Time
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center text-center max-w-[150px] flex-1">
            <span className="text-5xl md:text-6xl mb-2 select-none filter drop-shadow-sm">{awayTeam?.flag || "🏳️"}</span>
            <span className="font-extrabold text-sm md:text-lg text-foreground leading-tight">{awayTeam?.name || match.awayTeamId}</span>
            {awayTeam?.fifaRanking && (
              <span className="text-[10px] text-muted-foreground font-semibold mt-1">FIFA Rank #{awayTeam.fifaRanking}</span>
            )}
          </div>
        </div>

      </section>

      {/* Tabs Menu Selection */}
      <div className="border-b border-border flex gap-4 overflow-x-auto text-xs font-extrabold uppercase tracking-wider pb-0.5">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "timeline" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Match Timeline
        </button>
        <button
          onClick={() => setActiveTab("lineups")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "lineups" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Announced Lineups
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "stats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Match Statistics
        </button>
        <button
          onClick={() => setActiveTab("prediction")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "prediction" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          AI Match Predictor
        </button>
      </div>

      {/* Content Area */}
      <section className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm min-h-[300px]">
        
        {/* 1. Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Action Timeline Log
            </h3>

            {match.events && match.events.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {match.events.map((ev, idx) => {
                  const isHome = ev.teamId === match.homeTeamId;

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs border-b border-border/40 pb-3 leading-normal animate-in slide-in-from-bottom duration-300 ${
                        isHome ? "justify-start" : "justify-end text-right"
                      }`}
                    >
                      {/* Event details */}
                      <div className={`flex items-start gap-2 max-w-[80%] ${isHome ? "flex-row" : "flex-row-reverse"}`}>
                        {/* Time badge */}
                        <span className="font-mono text-[10px] py-0.5 px-2 bg-muted text-muted-foreground border border-border/60 rounded-lg shrink-0">
                          {ev.minute}&apos;
                        </span>
                        
                        <div>
                          <p className="font-extrabold text-foreground flex items-center gap-1.5 justify-start">
                            <span>{getEventIcon(ev.type)}</span>
                            <span>{ev.detail || "Match Action"}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed mt-0.5">
                            {ev.playerName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                No telemetry timeline actions logged yet. Playback starts when the match begins.
              </div>
            )}
          </div>
        )}

        {/* 2. Lineups Tab */}
        {activeTab === "lineups" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>Announced Starters & Squad Grids</span>
            </h3>

            {match.lineups ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Home Starters */}
                <div className="bg-muted/15 border border-border/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                    <span className="text-2xl">{homeTeam?.flag}</span>
                    <span className="text-xs font-black uppercase text-foreground truncate">{homeTeam?.name || "Home"} Starters</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-xs font-semibold text-muted-foreground">
                    {match.lineups.home.map((p, idx) => (
                      <li key={idx} className="bg-card p-1.5 rounded border border-border/40 text-foreground">
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Visual Pitch */}
                <div className="flex flex-col items-center">
                  <SoccerPitch starters={match.lineups.home} />
                  <span className="text-[10px] text-muted-foreground font-semibold mt-2">Home Team tactical pitch overlay</span>
                </div>

                {/* Away Starters */}
                <div className="bg-muted/15 border border-border/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                    <span className="text-2xl">{awayTeam?.flag}</span>
                    <span className="text-xs font-black uppercase text-foreground truncate">{awayTeam?.name || "Away"} Starters</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-xs font-semibold text-muted-foreground">
                    {match.lineups.away.map((p, idx) => (
                      <li key={idx} className="bg-card p-1.5 rounded border border-border/40 text-foreground">
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                Lineups will be announced 60 minutes before kickoff.
              </div>
            )}
          </div>
        )}

        {/* 3. Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Match Team Statistics
            </h3>

            {match.stats ? (
              <div className="space-y-4 max-w-xl mx-auto py-4">
                {/* Possession */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-muted-foreground uppercase">
                    <span className="font-mono text-foreground">{match.stats.possession[0]}%</span>
                    <span>Ball Possession</span>
                    <span className="font-mono text-foreground">{match.stats.possession[1]}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${match.stats.possession[0]}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${match.stats.possession[1]}%` }} />
                  </div>
                </div>

                {/* Shots */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-muted-foreground uppercase">
                    <span className="font-mono text-foreground">{match.stats.shots[0]}</span>
                    <span>Total Shots</span>
                    <span className="font-mono text-foreground">{match.stats.shots[1]}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${(match.stats.shots[1] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Shots on Target */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-muted-foreground uppercase">
                    <span className="font-mono text-foreground">{match.stats.shotsOnTarget[0]}</span>
                    <span>Shots on Target</span>
                    <span className="font-mono text-foreground">{match.stats.shotsOnTarget[1]}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(match.stats.shotsOnTarget[0] / (match.stats.shotsOnTarget[0] + match.stats.shotsOnTarget[1] || 1)) * 100}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${(match.stats.shotsOnTarget[1] / (match.stats.shotsOnTarget[0] + match.stats.shotsOnTarget[1] || 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Corners */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-muted-foreground uppercase">
                    <span className="font-mono text-foreground">{match.stats.corners[0]}</span>
                    <span>Corner Kicks</span>
                    <span className="font-mono text-foreground">{match.stats.corners[1]}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(match.stats.corners[0] / (match.stats.corners[0] + match.stats.corners[1] || 1)) * 100}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${(match.stats.corners[1] / (match.stats.corners[0] + match.stats.corners[1] || 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Fouls */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-extrabold text-muted-foreground uppercase">
                    <span className="font-mono text-foreground">{match.stats.fouls[0]}</span>
                    <span>Fouls Committed</span>
                    <span className="font-mono text-foreground">{match.stats.fouls[1]}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full" style={{ width: `${(match.stats.fouls[0] / (match.stats.fouls[0] + match.stats.fouls[1] || 1)) * 100}%` }} />
                    <div className="bg-secondary h-full" style={{ width: `${(match.stats.fouls[1] / (match.stats.fouls[0] + match.stats.fouls[1] || 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-border/50 text-center text-xs">
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="block text-[8px] font-black uppercase text-muted-foreground mb-1">Yellow Cards</span>
                    <div className="flex justify-center items-center gap-2 font-mono font-black text-sm">
                      <span className="text-primary">{match.stats.cards.yellow[0]}</span>
                      <span className="text-muted-foreground/30">:</span>
                      <span className="text-secondary">{match.stats.cards.yellow[1]}</span>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="block text-[8px] font-black uppercase text-muted-foreground mb-1">Red Cards</span>
                    <div className="flex justify-center items-center gap-2 font-mono font-black text-sm">
                      <span className="text-primary">{match.stats.cards.red[0]}</span>
                      <span className="text-muted-foreground/30">:</span>
                      <span className="text-secondary">{match.stats.cards.red[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-muted-foreground">
                Detailed stats will update in real-time as events occur.
              </div>
            )}
          </div>
        )}

        {/* 4. AI Predictor Tab */}
        {activeTab === "prediction" && (
          <div className="space-y-6 max-w-xl mx-auto">
            {prediction ? (
              <div className="bg-muted/30 border border-border/80 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                
                <h3 className="text-sm font-black uppercase text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span>AI Outcomes Analysis</span>
                </h3>

                {/* Win Prob dials */}
                <div className="grid grid-cols-3 gap-2.5 text-center font-bold">
                  <div className="bg-card/60 p-3 rounded-lg border border-border/40">
                    <span className="block text-[8px] uppercase text-muted-foreground">{prediction.homeTeam.code} Wins</span>
                    <span className="text-lg font-mono font-black text-secondary">{prediction.homeWinProb}%</span>
                  </div>
                  <div className="bg-card/60 p-3 rounded-lg border border-border/40">
                    <span className="block text-[8px] uppercase text-muted-foreground">Draw</span>
                    <span className="text-lg font-mono font-black text-muted-foreground">{prediction.drawProb}%</span>
                  </div>
                  <div className="bg-card/60 p-3 rounded-lg border border-border/40">
                    <span className="block text-[8px] uppercase text-muted-foreground">{prediction.awayTeam.code} Wins</span>
                    <span className="text-lg font-mono font-black text-primary">{prediction.awayWinProb}%</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 text-xs leading-normal">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>Confidence Score: <span className="text-primary font-bold uppercase">{prediction.confidence}</span></span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1 border-y border-border/30 py-2.5 my-2">
                    <div>
                      <span className="text-[8px] text-muted-foreground uppercase font-bold block">AI Expected Goals (xG)</span>
                      <span className="text-xs font-mono font-black text-foreground">
                        {prediction.homeXG.toFixed(2)} - {prediction.awayXG.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-muted-foreground uppercase font-bold block">Predicted Final Score</span>
                      <span className="text-xs font-mono font-black text-primary">
                        {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed border-t border-border/40 pt-3">
                    {prediction.reasoning}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Loading AI match metrics...</p>
            )}
          </div>
        )}

      </section>

    </div>
  );
}
