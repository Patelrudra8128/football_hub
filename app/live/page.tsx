"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { Match, Team } from "@/lib/mockData";
import MatchCard from "@/components/MatchCard";
import { Activity, Clock, BarChart2, Calendar } from "lucide-react";

export default function LiveScores() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLiveMatchId, setSelectedLiveMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([db.getTeams(), db.getMatches()])
      .then(([teamsList, list]) => {
        setTeams(teamsList);
        setMatches(list);
        
        // Auto-select first live match, or fallback to first match
        if (list.length > 0) {
          const live = list.find(m => m.status === "live");
          if (live) {
            setSelectedLiveMatchId(live.id);
          } else if (!selectedLiveMatchId) {
            setSelectedLiveMatchId(list[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load live scoreboard data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();

    // Subscribe to database changes (live updates via BroadcastChannel / simulations)
    const unsubscribe = db.subscribe("matches", () => {
      db.getMatches().then(list => {
        setMatches(list);
      });
    });

    return () => unsubscribe();
  }, []);

  // Poll for live scoring data updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      db.getMatches().then(setMatches);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(m => m.status === "live");
  const selectedMatch = matches.find(m => m.id === selectedLiveMatchId);

  // Load detailed info for the selected match (to get stats and timeline events)
  const [detailedMatch, setDetailedMatch] = useState<Match | null>(null);
  useEffect(() => {
    if (selectedLiveMatchId) {
      db.getMatchDetails(selectedLiveMatchId).then(setDetailedMatch);
    } else {
      setDetailedMatch(null);
    }
  }, [selectedLiveMatchId, matches]);

  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
          <Activity className="w-6 h-6 text-destructive animate-pulse" />
          <span>Real-time Live Scores</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Minute-by-minute ESPN scoreboard details, match events, possession, and corners statistics.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-muted-foreground">
          Loading live scoreboard...
        </div>
      ) : (
        /* Main split grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left column: Live and recent matches list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
              Matches Selection
            </h3>
            
            <div className="space-y-3">
              {liveMatches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-widest block">Active Live</span>
                  {liveMatches.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedLiveMatchId(m.id)}
                      className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                        selectedLiveMatchId === m.id ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold uppercase mb-2">
                        <span>{m.group}</span>
                        <span className="text-destructive font-black animate-pulse">Live {m.minute}&apos;</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <span>{getTeam(m.homeTeamId)?.flag}</span>
                          <span>{getTeam(m.homeTeamId)?.code}</span>
                        </div>
                        <span className="text-foreground">{m.homeScore}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <span>{getTeam(m.awayTeamId)?.flag}</span>
                          <span>{getTeam(m.awayTeamId)?.code}</span>
                        </div>
                        <span className="text-foreground">{m.awayScore}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Other matches */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Other Fixtures</span>
                {matches.filter(m => m.status !== "live").slice(0, 5).map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedLiveMatchId(m.id)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs cursor-pointer ${
                      selectedLiveMatchId === m.id ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase mb-1">
                      <span>{m.group}</span>
                      <span>{m.status === "finished" ? "Full Time" : "Scheduled"}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="truncate max-w-[150px]">{getTeam(m.homeTeamId)?.flag} {getTeam(m.homeTeamId)?.code} vs {getTeam(m.awayTeamId)?.code} {getTeam(m.awayTeamId)?.flag}</span>
                      {m.status === "finished" ? (
                        <span className="font-mono text-primary font-black">{m.homeScore} - {m.awayScore}</span>
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Selected match details & commentary ticker */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
              Live Match Tracker
            </h3>

            {selectedMatch ? (
              <div className="space-y-6">
                
                {/* Score card component */}
                <MatchCard match={selectedMatch} showDetailsButton={true} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Commentary Event Log */}
                  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Match Action Log</span>
                    </h4>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                      {detailedMatch?.events && detailedMatch.events.length > 0 ? (
                        detailedMatch.events.map((ev, idx) => (
                          <div key={idx} className="flex gap-2 text-xs leading-normal animate-in slide-in-from-bottom duration-300">
                            <span className="font-mono font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.2 rounded text-[9px] h-fit">
                              {ev.minute}&apos;
                            </span>
                            <div>
                              <p className="font-bold text-foreground">
                                {ev.playerName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-semibold">{ev.detail}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-8">No events logged yet. Match updates will populate here.</p>
                      )}
                    </div>
                  </div>

                  {/* Live stats visualization */}
                  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2">
                      <BarChart2 className="w-4 h-4 text-primary" />
                      <span>In-Play Metrics</span>
                    </h4>
                    
                    {detailedMatch?.stats ? (
                      <div className="space-y-4 pt-2">
                        {/* Possession */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                            <span>{getTeam(detailedMatch.homeTeamId)?.code} {detailedMatch.stats.possession[0]}%</span>
                            <span>Possession</span>
                            <span>{detailedMatch.stats.possession[1]}% {getTeam(detailedMatch.awayTeamId)?.code}</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-primary h-full" style={{ width: `${detailedMatch.stats.possession[0]}%` }} />
                            <div className="bg-secondary h-full" style={{ width: `${detailedMatch.stats.possession[1]}%` }} />
                          </div>
                        </div>

                        {/* Shots */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                            <span>{detailedMatch.stats.shots[0]}</span>
                            <span>Total Shots</span>
                            <span>{detailedMatch.stats.shots[1]}</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-primary h-full" style={{ width: `${(detailedMatch.stats.shots[0] / (detailedMatch.stats.shots[0] + detailedMatch.stats.shots[1] || 1)) * 100}%` }} />
                            <div className="bg-secondary h-full" style={{ width: `${(detailedMatch.stats.shots[1] / (detailedMatch.stats.shots[0] + detailedMatch.stats.shots[1] || 1)) * 100}%` }} />
                          </div>
                        </div>

                        {/* Corners */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                            <span>{detailedMatch.stats.corners[0]}</span>
                            <span>Corners</span>
                            <span>{detailedMatch.stats.corners[1]}</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-primary h-full" style={{ width: `${(detailedMatch.stats.corners[0] / (detailedMatch.stats.corners[0] + detailedMatch.stats.corners[1] || 1)) * 100}%` }} />
                            <div className="bg-secondary h-full" style={{ width: `${(detailedMatch.stats.corners[1] / (detailedMatch.stats.corners[0] + detailedMatch.stats.corners[1] || 1)) * 100}%` }} />
                          </div>
                        </div>

                        {/* Cards Summary */}
                        <div className="grid grid-cols-2 gap-4 border-t border-border/45 pt-3.5 text-center text-xs font-semibold text-muted-foreground">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider">Yellow Cards</span>
                            <span className="text-xs font-mono font-black text-foreground">
                              {detailedMatch.stats.cards.yellow[0]} - {detailedMatch.stats.cards.yellow[1]}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider">Red Cards</span>
                            <span className="text-xs font-mono font-black text-foreground">
                              {detailedMatch.stats.cards.red[0]} - {detailedMatch.stats.cards.red[1]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">In-play metrics available when match begins.</p>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center bg-card border border-border rounded-xl">No match selected.</p>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
