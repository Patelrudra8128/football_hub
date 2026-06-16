"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { Team, Match } from "@/lib/mockData";
import { calculatePrediction, PredictionResult } from "@/lib/predictionEngine";
import PredictionCard from "@/components/PredictionCard";
import { Sparkles, HelpCircle, Loader2, ArrowRightLeft } from "lucide-react";

export default function PredictionCenter() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selection states
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([db.getTeams(), db.getMatches()])
      .then(([teamsList, list]) => {
        setTeams(teamsList);
        setUpcomingMatches(list.filter(m => m.status === "scheduled"));
        if (teamsList.length > 1) {
          setHomeTeamId(teamsList[0].id);
          setAwayTeamId(teamsList[1].id);
        }
        setLoadingList(false);
      })
      .catch((err) => {
        console.error("Failed to load predictions data:", err);
        setLoadingList(false);
      });
  }, []);

  const swapTeams = () => {
    const temp = homeTeamId;
    setHomeTeamId(awayTeamId);
    setAwayTeamId(temp);
  };

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!homeTeamId || !awayTeamId) return;

    if (homeTeamId === awayTeamId) {
      setError("Please select two different teams.");
      setPrediction(null);
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      // Small simulated delay to simulate AI engine processing
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await calculatePrediction(homeTeamId, awayTeamId);
      setPrediction(res);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const predictUpcomingMatch = async (homeId: string, awayId: string) => {
    setHomeTeamId(homeId);
    setAwayTeamId(awayId);
    setError("");
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await calculatePrediction(homeId, awayId);
      setPrediction(res);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <span className="teal-gradient-text">AI Prediction Center</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Compute winning probabilities, expected goals (xG) ratios, and detailed tactical match analytics.</p>
      </div>

      {loadingList ? (
        <div className="text-center py-20 text-xs text-muted-foreground">
          Loading prediction center matchup data...
        </div>
      ) : (
        /* Main split grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Predictor & Upcoming predictions list */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Custom Matchup Predictor Form */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">Custom Matchup Selector</h3>
              
              <form onSubmit={handlePredict} className="space-y-4 text-xs">
                {/* Home Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Home Team</label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary transition"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={swapTeams}
                    className="p-2 bg-muted/60 hover:bg-border/60 rounded-full transition-colors text-muted-foreground hover:text-primary cursor-pointer"
                    title="Swap matchup sides"
                  >
                    <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
                  </button>
                </div>

                {/* Away Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Away Team</label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-primary transition"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-[10px] text-destructive font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs rounded-lg hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Running AI Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                      <span>Run AI Prediction</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Predict Upcoming Matches List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">Quick Forecast Fixtures</h3>
              
              {upcomingMatches.length > 0 ? (
                <div className="space-y-2.5">
                  {upcomingMatches.map(m => {
                    const hTeam = getTeam(m.homeTeamId);
                    const aTeam = getTeam(m.awayTeamId);
                    if (!hTeam || !aTeam) return null;

                    return (
                      <button
                        key={m.id}
                        onClick={() => predictUpcomingMatch(m.homeTeamId, m.awayTeamId)}
                        className="w-full p-3.5 bg-card border border-border hover:border-primary/45 rounded-lg flex items-center justify-between text-left text-xs transition shadow-sm cursor-pointer"
                      >
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-extrabold block mb-1">{m.group}</span>
                          <span className="font-extrabold text-foreground">{hTeam.flag} {hTeam.code} vs {aTeam.flag} {aTeam.code}</span>
                        </div>
                        <span className="text-[10px] text-primary font-bold hover:underline shrink-0">Predict &rarr;</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">No scheduled matches available for forecasting.</p>
              )}
            </div>

          </div>

          {/* Right Column: AI predictions display */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">Forecast Outcome</h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-xl space-y-3 text-center px-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-medium max-w-sm leading-relaxed">AI engine compiling rating databases, standings statistics, expected goal metrics (xG), and form factors...</p>
              </div>
            ) : prediction ? (
              <PredictionCard prediction={prediction} />
            ) : (
              <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground flex flex-col items-center justify-center p-4">
                <HelpCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-extrabold text-foreground uppercase tracking-wider">Ready to Forecast</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mt-1">Select teams in the matchup selector or click an upcoming scheduled fixture to trigger the prediction analysis.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
