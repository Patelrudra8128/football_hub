"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/api";
import { Match, Team, Player, NewsArticle } from "@/lib/mockData";
import { 
  Calendar, Flame, Sparkles, Trophy, Star, ArrowRight, Activity, 
  Search, Users, Award, ChevronRight 
} from "lucide-react";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Group A");
  const [activeMatchesTab, setActiveMatchesTab] = useState<"all" | "live" | "upcoming" | "finished">("all");

  const loadData = () => {
    db.getMatches().then(setMatches);
    db.getTeams().then(setTeams);
    db.getPlayers().then(setPlayers);
    db.getNews().then(setNews);
    db.getFavorites().then(setFavorites);
  };

  useEffect(() => {
    loadData();

    const unsubscribeMatches = db.subscribe("matches", () => {
      db.getMatches().then(setMatches);
    });
    const unsubscribeTeams = db.subscribe("teams", () => {
      loadData();
    });
    const unsubscribeFavs = db.subscribe("favorites", () => {
      db.getFavorites().then(setFavorites);
    });

    return () => {
      unsubscribeMatches();
      unsubscribeTeams();
      unsubscribeFavs();
    };
  }, []);

  const handleToggleFavorite = async (teamId: string) => {
    await db.toggleFavorite(teamId);
  };

  const liveMatches = matches.filter(m => m.status === "live");
  const upcomingMatches = matches.filter(m => m.status === "scheduled");
  const finishedMatches = matches.filter(m => m.status === "finished");

  // Smart featured match selection:
  // - Show live matches first
  // - Otherwise, show the closest upcoming match
  // - Otherwise, show the most recent completed match
  const upcomingSorted = [...upcomingMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedSorted = [...finishedMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredMatch = liveMatches.length > 0 
    ? liveMatches[0] 
    : upcomingSorted.length > 0 
      ? upcomingSorted[0] 
      : finishedSorted.length > 0 
        ? finishedSorted[0] 
        : matches[0];

  const getFilteredMatches = () => {
    switch (activeMatchesTab) {
      case "live": 
        return liveMatches;
      case "upcoming": 
        return upcomingSorted.slice(0, 6);
      case "finished": 
        return finishedSorted.slice(0, 6);
      default: {
        // "all": timeline format (last 3 finished, all live, next 5 scheduled)
        const recentFinished = finishedSorted.slice(0, 3).reverse();
        return [...recentFinished, ...liveMatches, ...upcomingSorted.slice(0, 5)];
      }
    }
  };

  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  // Group standin filtration
  const groupsList = Array.from(new Set(teams.map(t => t.group))).sort();
  const groupTeams = teams
    .filter(t => t.group === selectedGroup)
    .sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      const gdA = a.stats.goalsFor - a.stats.goalsAgainst;
      const gdB = b.stats.goalsFor - b.stats.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.stats.goalsFor - a.stats.goalsFor;
    });

  const pinnedCountries = teams.filter(t => favorites.includes(t.id));

  // Global search results
  const showSearchResults = searchQuery.trim().length > 0;
  const filteredMatches = matches.filter(m => 
    getTeam(m.homeTeamId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTeam(m.awayTeamId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* GLOBAL SEARCH SECTION */}
      <section className="bg-gradient-to-br from-primary/10 via-card to-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-foreground uppercase">
            Football Score
          </h1>
          <p className="text-xs text-muted-foreground font-semibold max-w-md">
            Track real-time FIFA World Cup scores, match telemetry events, and AI progression charts.
          </p>
        </div>

        <div className="w-full md:max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nations, players, or group stages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/80 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition"
          />
        </div>
      </section>

      {/* SEARCH RESULTS PANEL */}
      {showSearchResults && (
        <section className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-md animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border/60 pb-2">
            Search Results for &quot;{searchQuery}&quot;
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matches */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Matches ({filteredMatches.length})</span>
              </h3>
              {filteredMatches.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredMatches.map(m => (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="block p-2.5 rounded border border-border/60 hover:border-primary/45 bg-muted/20 text-xs transition"
                    >
                      <div className="font-bold">{getTeam(m.homeTeamId)?.code} vs {getTeam(m.awayTeamId)?.code}</div>
                      <div className="text-[10px] text-muted-foreground">{m.stage} • {m.status}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">No matches found.</p>
              )}
            </div>

            {/* Players */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Players ({filteredPlayers.length})</span>
              </h3>
              {filteredPlayers.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredPlayers.map(p => (
                    <Link
                      key={p.id}
                      href={`/players?id=${p.id}&teamId=${p.teamId}`}
                      className="block p-2.5 rounded border border-border/60 hover:border-primary/45 bg-muted/20 text-xs transition"
                    >
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.position} ({p.teamName})</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">No players found.</p>
              )}
            </div>

            {/* Teams */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Nations ({filteredTeams.length})</span>
              </h3>
              {filteredTeams.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredTeams.map(t => (
                    <Link
                      key={t.id}
                      href={`/teams/${t.id}`}
                      className="block p-2.5 rounded border border-border/60 hover:border-primary/45 bg-muted/20 text-xs transition"
                    >
                      <div className="font-bold">{t.flag} {t.name}</div>
                      <div className="text-[10px] text-muted-foreground">Rank: #{t.fifaRanking}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">No nations found.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* DASHBOARD MODULAR GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Featured Match Highlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              <span>Live Highlight Fixture</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Feeds active</span>
            </div>
          </div>
          {featuredMatch ? (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                <div>
                  <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                    {featuredMatch.stage}
                  </span>
                  <h3 className="font-bold text-foreground mt-1.5">{getTeam(featuredMatch.homeTeamId)?.name} vs {getTeam(featuredMatch.awayTeamId)?.name}</h3>
                </div>
                
                {featuredMatch.status === "live" && (
                  <div className="text-right flex items-center gap-3">
                    <Link
                      href={`/matches/${featuredMatch.id}?watch=true`}
                      className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-black px-2.5 py-1 rounded-lg uppercase hover:bg-destructive/20 transition duration-200"
                    >
                      <span>📺 Watch Live</span>
                    </Link>
                    <div className="flex items-center gap-1.5 text-destructive font-black uppercase animate-pulse">
                      <Activity className="w-4 h-4" />
                      <span>{featuredMatch.minute}&apos; mins</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Core Scoreboard Box */}
              <div className="flex items-center justify-around py-4 border-y border-border/60">
                {/* Team A */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-5xl select-none">{getTeam(featuredMatch.homeTeamId)?.flag}</span>
                  <span className="font-black text-sm text-foreground">{getTeam(featuredMatch.homeTeamId)?.code}</span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4 text-3xl font-mono font-black text-foreground bg-background border border-border rounded-xl px-4 py-2 shadow-inner">
                  <span>{featuredMatch.homeScore}</span>
                  <span className="text-muted-foreground/35">:</span>
                  <span>{featuredMatch.awayScore}</span>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-5xl select-none">{getTeam(featuredMatch.awayTeamId)?.flag}</span>
                  <span className="font-black text-sm text-foreground">{getTeam(featuredMatch.awayTeamId)?.code}</span>
                </div>
              </div>

              {/* Live Events Timeline */}
              {featuredMatch.events && featuredMatch.events.length > 0 && (
                <div className="bg-muted/25 border border-border/60 rounded-xl p-3 text-xs space-y-2.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block border-b border-border/40 pb-1">Match Actions Log</span>
                  <div className="flex flex-wrap gap-3 font-semibold">
                    {featuredMatch.events.map((ev, idx) => (
                      <span key={idx} className="bg-card border border-border/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px]">
                        <span>{ev.type === "goal" ? "⚽" : "🟨"}</span>
                        <span>{ev.playerName} ({ev.minute}&apos;)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  href={`/matches/${featuredMatch.id}`}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground font-black text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow"
                >
                  <span>Detailed scorecard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-xs text-muted-foreground">
              No matches found.
            </div>
          )}
        </div>

        {/* Right 1 Column: Favorites Pinboard & Series analytics */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-card border border-primary/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-black text-primary tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI World Cup Prediction</span>
            </h3>
            <p className="text-xs text-foreground font-black mb-1">Final Bracket Projection</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Based on squad health indices, goal ratios, and rankings metrics, Spain and Argentina enter as overall favorites to reach the Grand Final.
            </p>
          </div>

          {/* Favorited Countries */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
            <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-wider border-b border-border/60 pb-2 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span>My Favorited Teams</span>
            </h3>
            {pinnedCountries.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {pinnedCountries.map(team => (
                  <div key={team.id} className="flex items-center justify-between bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="text-base">{team.flag}</span>
                      <span>{team.code}</span>
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(team.id)}
                      className="text-primary hover:text-muted-foreground transition-colors cursor-pointer"
                      title="Unpin country"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                <p className="font-semibold">No favorited countries.</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Click the star in standings below to pin.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FIXTURES AND STANDINGS COLUMNS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (65% width): Match Center Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Fixtures Center</span>
            </h2>

            {/* Filter Tabs */}
            <div className="bg-muted p-1 rounded-xl flex gap-0.5 text-[10px] font-bold uppercase shrink-0 border border-border/60">
              {(["all", "live", "upcoming", "finished"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveMatchesTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeMatchesTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 gap-4">
            {getFilteredMatches().length > 0 ? (
              getFilteredMatches().map(match => {
                const homeTeam = getTeam(match.homeTeamId);
                const awayTeam = getTeam(match.awayTeamId);
                return (
                  <div key={match.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/45 transition flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted border border-border/40 px-1.5 py-0.2 rounded">
                          {match.stage}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <span>{homeTeam?.flag} {homeTeam?.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs font-mono">:</span>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <span>{awayTeam?.name} {awayTeam?.flag}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center md:text-right space-y-1.5 shrink-0">
                      {match.status === "finished" && (
                        <div>
                          <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-black uppercase tracking-wider block">Finished</span>
                          <span className="text-sm font-mono font-black text-primary block mt-1">{match.homeScore} - {match.awayScore}</span>
                        </div>
                      )}
                      
                      {match.status === "live" && (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[9px] bg-destructive/10 border border-destructive/20 text-destructive font-black px-2 py-0.5 rounded uppercase animate-pulse">
                            Live {match.minute}&apos;
                          </span>
                          <span className="text-sm font-mono font-black text-foreground block mt-1">{match.homeScore} - {match.awayScore}</span>
                        </div>
                      )}

                      {match.status === "scheduled" && (
                        <div>
                          <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wider block">Scheduled</span>
                          <span className="text-[10px] font-mono font-bold block text-muted-foreground mt-1">
                            {new Date(match.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/matches/${match.id}`}
                        className="inline-flex items-center gap-1 text-[10px] text-primary font-black uppercase hover:underline"
                      >
                        <span>Telemetry Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-xl text-xs text-muted-foreground">
                No matches found.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/matches"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-black uppercase hover:underline"
            >
              <span>View Full Match Center & Schedules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Leaders spotlight section */}
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>World Cup Top Performers</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {players.slice(0, 3).map(player => (
                <Link
                  key={player.id}
                  href={`/players?id=${player.id}&teamId=${player.teamId}`}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/45 transition flex flex-col justify-between space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-12 h-12 rounded-full border border-border object-cover"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{player.name}</h3>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase">{player.position} • {player.teamName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3 text-[10px] text-muted-foreground font-semibold">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider">Goals</span>
                      <span className="text-xs font-black font-mono text-foreground">{player.stats.goals}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider">Assists</span>
                      <span className="text-xs font-black font-mono text-foreground">{player.stats.assists}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (35% width): FIFA Group standings table */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span>Group Standings</span>
              </h2>
              <Link href="/standings" className="text-[9px] font-black uppercase text-primary hover:underline flex items-center gap-1">
                <span>All Groups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Group Dropdown Selector */}
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                <span className="font-extrabold text-[10px] text-foreground uppercase tracking-wider">Group tables</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-card border border-border text-foreground font-extrabold text-xs rounded-lg px-2.5 py-1 outline-none"
                >
                  {groupsList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <table className="w-full text-xs text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/10 text-muted-foreground font-bold uppercase text-[8px] tracking-wider">
                    <th className="p-3 w-8 text-center">Pos</th>
                    <th className="p-3">Nation</th>
                    <th className="p-3 text-center w-8">Pld</th>
                    <th className="p-3 text-center w-8">GD</th>
                    <th className="p-3 text-center w-8 font-bold text-foreground">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {groupTeams.map((team, idx) => {
                    const isQualifying = idx < 2;
                    const gd = team.stats.goalsFor - team.stats.goalsAgainst;
                    const isFav = favorites.includes(team.id);

                    return (
                      <tr key={team.id} className={`hover:bg-muted/10 transition-colors ${isQualifying ? "bg-primary/[0.015]" : ""}`}>
                        <td className="p-3 text-center">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mx-auto ${
                            idx === 0 ? "bg-accent text-accent-foreground" : idx === 1 ? "bg-slate-300 text-slate-800" : "text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleFavorite(team.id)}
                              className="p-0.5 text-muted-foreground/60 hover:text-primary transition-colors shrink-0 cursor-pointer"
                              title={isFav ? "Unpin nation" : "Pin nation"}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? "fill-primary text-primary" : ""}`} />
                            </button>
                            <span className="text-lg shrink-0">{team.flag}</span>
                            <span className="truncate max-w-[80px] font-bold">{team.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-medium">{team.stats.played}</td>
                        <td className={`p-3 text-center font-mono font-semibold ${gd > 0 ? "text-primary" : gd < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                          {gd > 0 ? `+${gd}` : gd}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-foreground text-xs">{team.stats.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trending Football News */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Trending News</span>
            </h2>
            <div className="space-y-3">
              {news.map(article => (
                <div key={article.id} className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-2">
                  <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="text-xs font-bold text-foreground hover:text-primary transition">
                    {article.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold border-t border-border/40 pt-2">
                    <span>{article.readTime}</span>
                    <span>{new Date(article.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
