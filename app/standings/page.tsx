"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { Team } from "@/lib/mockData";
import { Table, Trophy, Layers, Star } from "lucide-react";

export default function StandingsAndBracket() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"tournament" | "rankings">("tournament");
  const [standingsData, setStandingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.getTeams();
      setTeams(list);

      const stdData = await db.getStandingsData();
      setStandingsData(stdData);

      const favIds = await db.getFavorites();
      setFavorites(favIds);
    } catch (err) {
      console.error("Standings data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribeTeams = db.subscribe("teams", () => {
      loadData();
    });

    const unsubscribeFavs = db.subscribe("favorites", () => {
      db.getFavorites().then(setFavorites);
    });

    return () => {
      unsubscribeTeams();
      unsubscribeFavs();
    };
  }, []);

  const handleToggleFavorite = async (teamId: string) => {
    await db.toggleFavorite(teamId);
  };

  // Sort teams for FIFA rankings
  const sortedRankings = [...teams].sort((a, b) => {
    return a.fifaRanking - b.fifaRanking;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="teal-gradient-text">World Cup Standings & Rankings</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Track official FIFA World Cup league standings, goal differentials, points, and pinned nations.</p>
        </div>

        {/* Tab Selector */}
        <div className="bg-muted p-1 rounded-xl flex gap-0.5 text-xs font-bold uppercase tracking-wider shrink-0 border border-border/60">
          <button
            onClick={() => setActiveTab("tournament")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition cursor-pointer ${activeTab === "tournament" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Table className="w-4 h-4 text-primary" />
            <span>Group Tables</span>
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition cursor-pointer ${activeTab === "rankings" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>FIFA World Rankings</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-muted-foreground">
          Loading standings and rankings data...
        </div>
      ) : (
        /* Content Panels */
        <section className="min-h-[400px]">
          {activeTab === "tournament" && standingsData ? (
            <div className="space-y-8">
              {standingsData.children?.map((group: any) => {
                // Parse entries
                const entries = group.standings?.entries || [];
                const sortedEntries = [...entries].sort((a: any, b: any) => {
                  const getStat = (entry: any, name: string) => entry.stats?.find((s: any) => s.name === name)?.value || 0;
                  const ptsA = getStat(a, "points");
                  const ptsB = getStat(b, "points");
                  if (ptsB !== ptsA) return ptsB - ptsA;
                  
                  const gdA = getStat(a, "pointDifferential");
                  const gdB = getStat(b, "pointDifferential");
                  if (gdB !== gdA) return gdB - gdA;

                  const gfA = getStat(a, "pointsFor");
                  const gfB = getStat(b, "pointsFor");
                  return gfB - gfA;
                });

                return (
                  <div key={group.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-muted/40 border-b border-border/80 flex items-center justify-between">
                      <span className="font-black text-sm text-foreground uppercase tracking-wider">{group.name || "Group Table"}</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 border border-primary/20 rounded font-bold uppercase tracking-wide">Top 2 Advance</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse select-none">
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/10 text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                            <th className="p-3 w-10 text-center">Pos</th>
                            <th className="p-3">Team</th>
                            <th className="p-3 text-center w-12">Pld</th>
                            <th className="p-3 text-center w-10">W</th>
                            <th className="p-3 text-center w-10">D</th>
                            <th className="p-3 text-center w-10">L</th>
                            <th className="p-3 text-center w-10">GF</th>
                            <th className="p-3 text-center w-10">GA</th>
                            <th className="p-3 text-center w-12">GD</th>
                            <th className="p-3 text-center w-12 font-bold text-foreground">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sortedEntries.map((entry: any, idx: number) => {
                            const isQualifying = idx < 2;
                            const t = entry.team;
                            const mappedTeam = teams.find(team => team.id === t.id);
                            const isFav = mappedTeam ? favorites.includes(mappedTeam.id) : false;

                            const getStat = (name: string) => entry.stats?.find((s: any) => s.name === name)?.value || 0;
                            const gp = getStat("gamesPlayed");
                            const w = getStat("wins");
                            const d = getStat("ties");
                            const l = getStat("losses");
                            const gf = getStat("pointsFor");
                            const ga = getStat("pointsAgainst");
                            const gd = getStat("pointDifferential");
                            const pts = getStat("points");

                            return (
                              <tr key={t.id} className={`hover:bg-muted/10 transition-colors ${isQualifying ? "bg-primary/[0.015]" : ""}`}>
                                <td className="p-3 text-center">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mx-auto ${
                                    idx === 0 ? "bg-accent text-accent-foreground" : idx === 1 ? "bg-slate-300 text-slate-800" : "text-muted-foreground"
                                  }`}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-foreground">
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      onClick={() => handleToggleFavorite(t.id)}
                                      className="p-0.5 text-muted-foreground/60 hover:text-primary transition-colors shrink-0 cursor-pointer"
                                      title={isFav ? "Unpin team" : "Pin team"}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
                                    </button>
                                    <span className="text-xl shrink-0">{mappedTeam?.flag || "🏳️"}</span>
                                    <span className="font-extrabold text-foreground">{t.displayName}</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">({t.abbreviation})</span>
                                  </div>
                                </td>
                                <td className="p-3 text-center font-mono font-medium">{gp}</td>
                                <td className="p-3 text-center font-mono text-muted-foreground">{w}</td>
                                <td className="p-3 text-center font-mono text-muted-foreground">{d}</td>
                                <td className="p-3 text-center font-mono text-muted-foreground">{l}</td>
                                <td className="p-3 text-center font-mono text-muted-foreground">{gf}</td>
                                <td className="p-3 text-center font-mono text-muted-foreground">{ga}</td>
                                <td className={`p-3 text-center font-mono font-semibold ${gd > 0 ? "text-primary" : gd < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {gd > 0 ? `+${gd}` : gd}
                                </td>
                                <td className="p-3 text-center font-mono font-black text-foreground text-sm">{pts}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === "rankings" ? (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-muted/40 border-b border-border/80 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">FIFA Official World Rankings</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse select-none">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/10 text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-3 w-10 text-center">Rank</th>
                      <th className="p-3">Team</th>
                      <th className="p-3 text-center w-24">Rating Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sortedRankings.map((team, idx) => {
                      const isFav = favorites.includes(team.id);

                      return (
                        <tr key={team.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-foreground">{idx + 1}</td>
                          <td className="p-3 font-semibold text-foreground">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => handleToggleFavorite(team.id)}
                                className="p-0.5 text-muted-foreground/60 hover:text-primary transition-colors shrink-0 cursor-pointer"
                                title={isFav ? "Unpin team" : "Pin team"}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
                              </button>
                              <span className="text-xl shrink-0">{team.flag}</span>
                              <span className="font-extrabold text-foreground">{team.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-black text-primary text-sm">
                            {team.stats?.points || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-12">No standings loaded.</p>
          )}
        </section>
      )}

    </div>
  );
}
