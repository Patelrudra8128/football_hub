"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/api";
import { Team, Player } from "@/lib/mockData";
import { ArrowLeft, Users, Trophy, TrendingUp, Sparkles } from "lucide-react";

// Tactical field visual component (4-3-3)
function SoccerPitch({ starters }: { starters: string[] }) {
  const positions = [
    { label: "GK", bottom: "5%", left: "50%", name: starters[0] || "Goalkeeper" },
    
    { label: "LB", bottom: "20%", left: "15%", name: starters[1] || "Defender" },
    { label: "CB", bottom: "18%", left: "38%", name: starters[2] || "Defender" },
    { label: "CB", bottom: "18%", left: "62%", name: starters[3] || "Defender" },
    { label: "RB", bottom: "20%", left: "85%", name: starters[4] || "Defender" },
    
    { label: "LCM", bottom: "45%", left: "28%", name: starters[5] || "Midfielder" },
    { label: "CM", bottom: "40%", left: "50%", name: starters[6] || "Midfielder" },
    { label: "RCM", bottom: "45%", left: "72%", name: starters[7] || "Midfielder" },
    
    { label: "LW", bottom: "75%", left: "20%", name: starters[8] || "Forward" },
    { label: "ST", bottom: "82%", left: "50%", name: starters[9] || "Forward" },
    { label: "RW", bottom: "75%", left: "80%", name: starters[10] || "Forward" }
  ];

  const getLastName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.split(" ");
    return parts[parts.length - 1];
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-emerald-700 rounded-2xl border-4 border-white/50 overflow-hidden shadow-inner flex flex-col justify-between p-2 select-none">
      {/* Lines */}
      <div className="absolute inset-2 border-2 border-white/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/10 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/10 pointer-events-none" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-14 border-b-2 border-x-2 border-white/10 pointer-events-none" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-14 border-t-2 border-x-2 border-white/10 pointer-events-none" />

      {positions.map((pos, idx) => (
        <div
          key={idx}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10"
          style={{ bottom: pos.bottom, left: pos.left }}
        >
          <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center font-bold text-[9px] text-white">
            {idx + 1}
          </div>
          <span className="text-[9px] text-white font-extrabold bg-black/60 px-1 py-0.2 rounded mt-0.5 whitespace-nowrap">
            {getLastName(pos.name)}
          </span>
        </div>
      ))}
      <span className="absolute bottom-1 right-2 text-[8px] font-bold text-white/30 tracking-widest uppercase">4-3-3 Grid</span>
    </div>
  );
}

export default function TeamProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [team, setTeam] = useState<Team | null>(null);
  const [squadPlayers, setSquadPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<"squad" | "playingXI" | "stats">("squad");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    db.getTeams().then(async (teamsList) => {
      const found = teamsList.find(t => t.id === id);
      if (found) {
        setTeam(found);

        // Fetch players in squad dynamically from roster API
        const playersList = await db.getPlayers(id);
        setSquadPlayers(playersList);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load team details:", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24 text-xs text-muted-foreground">
        Loading team profile from ESPN roster...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-24 text-xs text-muted-foreground">
        Team profile not found.
      </div>
    );
  }

  // Categorize squad
  const goalkeepers = squadPlayers.filter(p => p.position === "Goalkeeper");
  const defenders = squadPlayers.filter(p => p.position === "Defender");
  const midfielders = squadPlayers.filter(p => p.position === "Midfielder");
  const forwards = squadPlayers.filter(p => p.position === "Forward");

  // Extract starter names for field overlay
  const starters = squadPlayers.slice(0, 11).map(p => p.name);

  // Stats calculation
  const gd = (team.stats?.goalsFor || 0) - (team.stats?.goalsAgainst || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Back Link */}
      <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-semibold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Hero Header */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full font-bold">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-16 h-16 md:w-20 md:h-20 object-contain filter drop-shadow-sm select-none" />
          ) : (
            <span className="text-6xl md:text-7xl filter drop-shadow-sm select-none">{team.flag}</span>
          )}
          
          <div className="space-y-2 flex-1 font-normal">
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">{team.name}</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              {team.group} • FIFA Ranking: <span className="text-foreground font-black">#{team.fifaRanking}</span>
            </p>
          </div>
          
          {/* Form Widget */}
          <div className="flex items-center gap-1.5 shrink-0 bg-muted/40 p-2.5 rounded-xl border border-border/60">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mr-1">Form:</span>
            {team.form.map((f, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                  f === "W" ? "bg-green-500 text-white" : f === "L" ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-border flex gap-4 overflow-x-auto text-xs font-extrabold uppercase tracking-wider pb-0.5">
        <button
          onClick={() => setActiveTab("squad")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "squad" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Squad Roster
        </button>
        <button
          onClick={() => setActiveTab("playingXI")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "playingXI" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Tactical Lineup XI
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-2.5 transition cursor-pointer ${activeTab === "stats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Tournament Stats
        </button>
      </div>

      {/* Content panel */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm min-h-[300px]">
        
        {/* 1. Squad Tab */}
        {activeTab === "squad" && (
          <div className="space-y-6">
            {squadPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Goalkeepers */}
                {goalkeepers.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Goalkeepers ({goalkeepers.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {goalkeepers.map(p => (
                        <Link
                          key={p.id}
                          href={`/players?id=${p.id}&teamId=${id}`}
                          className="flex justify-between items-center bg-muted/20 border border-border/40 p-2.5 rounded-lg text-xs hover:border-primary/45 transition"
                        >
                          <span className="font-bold text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold font-mono">Shirt #{p.number}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Defenders */}
                {defenders.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Defenders ({defenders.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {defenders.map(p => (
                        <Link
                          key={p.id}
                          href={`/players?id=${p.id}&teamId=${id}`}
                          className="flex justify-between items-center bg-muted/20 border border-border/40 p-2.5 rounded-lg text-xs hover:border-primary/45 transition"
                        >
                          <span className="font-bold text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold font-mono">Shirt #{p.number}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Midfielders */}
                {midfielders.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Midfielders ({midfielders.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {midfielders.map(p => (
                        <Link
                          key={p.id}
                          href={`/players?id=${p.id}&teamId=${id}`}
                          className="flex justify-between items-center bg-muted/20 border border-border/40 p-2.5 rounded-lg text-xs hover:border-primary/45 transition"
                        >
                          <span className="font-bold text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold font-mono">Shirt #{p.number}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forwards */}
                {forwards.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border pb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Forwards ({forwards.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {forwards.map(p => (
                        <Link
                          key={p.id}
                          href={`/players?id=${p.id}&teamId=${id}`}
                          className="flex justify-between items-center bg-muted/20 border border-border/40 p-2.5 rounded-lg text-xs hover:border-primary/45 transition"
                        >
                          <span className="font-bold text-foreground">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold font-mono">Shirt #{p.number}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">No squad roster information available.</p>
            )}
          </div>
        )}

        {/* 2. Playing XI Tab */}
        {activeTab === "playingXI" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>Predicted Starting Lineup XI</span>
              </h3>
            </div>

            {squadPlayers.length >= 11 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Playing XI list */}
                <div className="bg-muted/15 border border-border/60 rounded-xl p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">XI Starters</span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs font-semibold text-foreground">
                    {squadPlayers.slice(0, 11).map((player, idx) => (
                      <li key={idx} className="bg-card p-2 rounded border border-border/40 flex justify-between">
                        <span>{player.name}</span>
                        <span className="text-[10px] text-muted-foreground">{player.position}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Playing Field graphics layout */}
                <div className="max-w-sm mx-auto w-full">
                  <SoccerPitch starters={starters} />
                </div>

              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-12">Roster squad sizes too small to map lineup XI.</p>
            )}
          </div>
        )}

        {/* 3. Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Tournament Standings Stats</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-bold">
              <div className="bg-muted/20 border border-border/60 p-4 rounded-xl">
                <span className="block text-[8px] uppercase text-muted-foreground mb-1">Played</span>
                <span className="text-xl font-mono text-foreground">{team.stats?.played || 0}</span>
              </div>
              <div className="bg-muted/20 border border-border/60 p-4 rounded-xl">
                <span className="block text-[8px] uppercase text-muted-foreground mb-1">Wins</span>
                <span className="text-xl font-mono text-primary">{team.stats?.won || 0}</span>
              </div>
              <div className="bg-muted/20 border border-border/60 p-4 rounded-xl">
                <span className="block text-[8px] uppercase text-muted-foreground mb-1">Draws</span>
                <span className="text-xl font-mono text-muted-foreground">{team.stats?.drawn || 0}</span>
              </div>
              <div className="bg-muted/20 border border-border/60 p-4 rounded-xl">
                <span className="block text-[8px] uppercase text-muted-foreground mb-1">Losses</span>
                <span className="text-xl font-mono text-rose-500">{team.stats?.lost || 0}</span>
              </div>
              <div className="bg-muted/20 border border-border/60 p-4 rounded-xl">
                <span className="block text-[8px] uppercase text-muted-foreground mb-1">Goal Difference</span>
                <span className={`text-xl font-mono ${gd > 0 ? "text-primary" : gd < 0 ? "text-destructive" : "text-foreground"}`}>
                  {gd > 0 ? `+${gd}` : gd}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
