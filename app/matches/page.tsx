"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { Match, Team } from "@/lib/mockData";
import MatchCard from "@/components/MatchCard";
import { Filter, Calendar, Users, Trophy, Search, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default function MatchCenter() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPast, setShowAllPast] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([db.getMatches(), db.getTeams()])
      .then(([matchesList, teamsList]) => {
        setMatches(matchesList);
        setTeams(teamsList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load match center data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();

    // Live update listener
    const unsubscribe = db.subscribe("matches", () => {
      db.getMatches().then(setMatches);
    });

    return () => unsubscribe();
  }, []);

  // Get distinct values for selectors
  const stages = Array.from(new Set(matches.map(m => m.stage || "Group Stage")));
  const dates = Array.from(new Set(matches.map(m => new Date(m.date).toDateString())));

  const resetFilters = () => {
    setSelectedTeam("all");
    setSelectedStage("all");
    setSelectedDate("all");
    setSearchQuery("");
  };

  // Run filter logic
  const filteredMatches = matches.filter(match => {
    // Stage Filter
    if (selectedStage !== "all" && (match.stage || "Group Stage") !== selectedStage) return false;

    // Date Filter
    if (selectedDate !== "all" && new Date(match.date).toDateString() !== selectedDate) return false;

    // Team Filter
    if (selectedTeam !== "all" && match.homeTeamId !== selectedTeam && match.awayTeamId !== selectedTeam) return false;

    // Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hTeam = teams.find(t => t.id === match.homeTeamId)?.name.toLowerCase() || "";
      const aTeam = teams.find(t => t.id === match.awayTeamId)?.name.toLowerCase() || "";
      const group = (match.group || "").toLowerCase();
      const stage = (match.stage || "").toLowerCase();
      if (!hTeam.includes(q) && !aTeam.includes(q) && !group.includes(q) && !stage.includes(q)) return false;
    }

    return true;
  });

  // Group filtered matches by date categories and sort them for premium UX
  const todayStr = new Date().toDateString();

  const liveMatches = filteredMatches
    .filter(m => m.status === "live")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const todaysMatches = filteredMatches
    .filter(m => m.status !== "live" && new Date(m.date).toDateString() === todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastMatches = filteredMatches
    .filter(m => m.status === "finished" && new Date(m.date).toDateString() !== todayStr)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingMatches = filteredMatches
    .filter(m => m.status === "scheduled" && new Date(m.date).toDateString() !== todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span>World Cup Match Center</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Complete schedules, real-time live telemetry actions, and groups schedules.</p>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>

      {/* Responsive Filter Control Grid - Premium Design */}
      <section className="bg-card border border-border p-4 md:p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
        
        {/* Search */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <Search className="w-3 h-3 text-primary" />
            <span>Search Match / Group</span>
          </label>
          <input
            type="text"
            placeholder="Type country name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 rounded-md border border-border/80 px-3 py-1.5 text-xs outline-none focus:border-primary transition"
          />
        </div>

        {/* Team Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3 h-3 text-primary" />
            <span>Filter by Nation</span>
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full bg-muted/50 rounded-md border border-border/80 px-3 py-1.5 text-xs outline-none focus:border-primary font-semibold transition"
          >
            <option value="all">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        {/* Stage Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-primary" />
            <span>Stage</span>
          </label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full bg-muted/50 rounded-md border border-border/80 px-3 py-1.5 text-xs outline-none focus:border-primary font-semibold transition"
          >
            <option value="all">All Stages</option>
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" />
            <span>Filter by Date</span>
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-muted/50 rounded-md border border-border/80 px-3 py-1.5 text-xs outline-none focus:border-primary font-semibold transition"
          >
            <option value="all">All Dates</option>
            {dates.map(d => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</option>
            ))}
          </select>
        </div>

      </section>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-xs text-muted-foreground">
          Loading World Cup matches list...
        </div>
      ) : (
        /* Match Results listing grouped by date flow */
        <section className="space-y-8">
          
          {/* 1. Live Matches */}
          {liveMatches.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>Live Matches ({liveMatches.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveMatches.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {/* 2. Today's Matches */}
          {todaysMatches.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/80 pb-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Scheduled Today ({todaysMatches.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todaysMatches.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {/* 3. Past Matches */}
          {pastMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/80 pb-1">
                <span>Past Matches ({pastMatches.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showAllPast ? pastMatches : pastMatches.slice(0, 4)).map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
              {pastMatches.length > 4 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllPast(!showAllPast)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted/60 hover:bg-muted border border-border/80 hover:border-primary/45 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {showAllPast ? (
                      <>
                        <span>Show Less Past Matches</span>
                        <ChevronUp className="w-4 h-4 text-primary" />
                      </>
                    ) : (
                      <>
                        <span>View All Past Matches ({pastMatches.length})</span>
                        <ChevronDown className="w-4 h-4 text-primary" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/80 pb-1">
                <span>Upcoming Schedules ({upcomingMatches.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showAllUpcoming ? upcomingMatches : upcomingMatches.slice(0, 4)).map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
              {upcomingMatches.length > 4 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted/60 hover:bg-muted border border-border/80 hover:border-primary/45 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {showAllUpcoming ? (
                      <>
                        <span>Show Less Scheduled Matches</span>
                        <ChevronUp className="w-4 h-4 text-primary" />
                      </>
                    ) : (
                      <>
                        <span>View All Scheduled Matches ({upcomingMatches.length})</span>
                        <ChevronDown className="w-4 h-4 text-primary" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredMatches.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded-xl text-muted-foreground">
              <p className="text-sm">No matches found matching the current search parameters.</p>
              <button
                onClick={resetFilters}
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

        </section>
      )}

    </div>
  );
}
