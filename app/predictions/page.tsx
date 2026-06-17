"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { Team, Match } from "@/lib/mockData";
import { calculatePrediction, PredictionResult } from "@/lib/predictionEngine";
import PredictionCard from "@/components/PredictionCard";
import { Sparkles, HelpCircle, Loader2, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function PredictionCenter() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const { t } = useLanguage();

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
      setError(t("predictions.errorSameTeam"));
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
      if (localStorage.getItem("lucky_draw_quest_active") === "true") {
        localStorage.setItem("lucky_draw_prediction_run", "true");
        window.dispatchEvent(new Event("storage"));
      }
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
      if (localStorage.getItem("lucky_draw_quest_active") === "true") {
        localStorage.setItem("lucky_draw_prediction_run", "true");
        window.dispatchEvent(new Event("storage"));
      }
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
          <span className="teal-gradient-text">{t("predictions.title")}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("predictions.subtitle")}</p>
      </div>

      {loadingList ? (
        <div className="text-center py-20 text-xs text-muted-foreground">
          {t("predictions.loadingText")}
        </div>
      ) : (
        /* Main split grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Custom Matchup Predictor Form */}
          <div className="lg:col-start-1 lg:row-start-1 lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">{t("predictions.customSelector")}</h3>
              
              <form onSubmit={handlePredict} className="space-y-4 text-xs">
                {/* Home Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">{t("predictions.homeTeam")}</label>
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
                    title={t("predictions.swapTooltip")}
                  >
                    <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
                  </button>
                </div>

                {/* Away Selection */}
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">{t("predictions.awayTeam")}</label>
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
                      <span>{t("predictions.runningSimulation")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                      <span>{t("predictions.runPrediction")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* AI predictions display */}
          <div className="lg:col-start-2 lg:row-start-1 lg:col-span-2 lg:row-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">{t("predictions.forecastOutcome")}</h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-xl space-y-3 text-center px-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-medium max-w-sm leading-relaxed">{t("predictions.aiCompiling")}</p>
              </div>
            ) : prediction ? (
              <PredictionCard prediction={prediction} />
            ) : (
              <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground flex flex-col items-center justify-center p-4">
                <HelpCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-extrabold text-foreground uppercase tracking-wider">{t("predictions.readyToForecast")}</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mt-1">{t("predictions.forecastHint")}</p>
              </div>
            )}
          </div>

          {/* Quick Predict Upcoming Matches List */}
          <div className="lg:col-start-1 lg:row-start-2 lg:col-span-1 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">{t("predictions.quickForecast")}</h3>
            
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
                        <span className="font-extrabold text-foreground flex items-center gap-1.5">
                          {hTeam.logo ? (
                            <img src={hTeam.logo} alt={hTeam.name} className="w-4 h-4 object-contain filter drop-shadow-sm select-none" />
                          ) : (
                            <span>{hTeam.flag}</span>
                          )}
                          <span>{hTeam.code}</span>
                          <span className="text-muted-foreground/60 font-light font-mono text-[10px] mx-0.5">vs</span>
                          {aTeam.logo ? (
                            <img src={aTeam.logo} alt={aTeam.name} className="w-4 h-4 object-contain filter drop-shadow-sm select-none" />
                          ) : (
                            <span>{aTeam.flag}</span>
                          )}
                          <span>{aTeam.code}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-primary font-bold hover:underline shrink-0">{t("nav.predict")} &rarr;</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-medium">{t("predictions.noForecastAvailable")}</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
