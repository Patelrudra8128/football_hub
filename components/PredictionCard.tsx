"use client";

import React, { useState } from "react";
import { PredictionResult } from "@/lib/predictionEngine";
import { Trophy, Share2, Check, Sparkles, TrendingUp } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface PredictionCardProps {
  prediction: PredictionResult;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const {
    homeTeam,
    awayTeam,
    homeWinProb,
    drawProb,
    awayWinProb,
    predictedHomeScore,
    predictedAwayScore,
    confidence,
    homeXG,
    awayXG,
    reasoning
  } = prediction;

  const handleShare = () => {
    const text = `🏆 AI Football Forecast for ${homeTeam.flag} ${homeTeam.name} vs ${awayTeam.flag} ${awayTeam.name}:
⚽ Predicted Score: ${predictedHomeScore}-${predictedAwayScore} (xG: ${homeXG.toFixed(1)} vs ${awayXG.toFixed(1)})
🔮 Win Probabilities: ${homeTeam.name} ${homeWinProb}% | Draw ${drawProb}% | ${awayTeam.name} ${awayWinProb}%
🔥 Confidence: ${confidence}
Analyzed by #FootballScore! Check it out!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceColor = (lvl: string) => {
    switch (lvl) {
      case "High": return "bg-green-500/15 text-green-400 border-green-500/30";
      case "Medium": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default: return "bg-primary/15 text-primary border-primary/30";
    }
  };

  // Localized confidence labels
  const confidenceLabels: Record<string, string> = {
    High: t("predictions.confidenceHigh") || "High Confidence",
    Medium: t("predictions.confidenceMedium") || "Medium Confidence",
    Low: t("predictions.confidenceLow") || "Low Confidence"
  };

  const winText = t("predictions.winLabel") || "WIN";
  const drawText = t("predictions.drawLabel") || "DRAW";

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-300">
      
      {/* Accent border bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

      {/* Header banner */}
      <div className="p-4 bg-muted/40 border-b border-border/80 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-extrabold text-foreground uppercase tracking-wider">{t("predictions.forecastOutcome")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border rounded-lg ${getConfidenceColor(confidence)}`}>
            {confidenceLabels[confidence] || confidence}
          </span>
          <button
            onClick={handleShare}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted/30 rounded-lg transition-colors cursor-pointer"
            title="Share prediction"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Match details & Predicted Score */}
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-4xl md:text-5xl mb-2 select-none">{homeTeam.flag}</span>
            <span className="text-sm font-black text-foreground leading-tight tracking-tight">{homeTeam.name}</span>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t("common.rank")} #{homeTeam.fifaRanking}</span>
          </div>

          {/* Predicted score center */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-extrabold text-muted-foreground tracking-wider mb-2">{t("predictions.predictedScore") || "Predicted Score"}</span>
            <div className="bg-primary text-primary-foreground font-mono text-3xl md:text-4xl font-extrabold px-6 py-2 rounded-xl shadow-inner flex items-center gap-3 border border-border/10 tracking-widest">
              <span>{predictedHomeScore}</span>
              <span className="text-primary-foreground/45 font-light">-</span>
              <span>{predictedAwayScore}</span>
            </div>
            <span className="text-[10px] font-bold text-accent mt-2.5 flex items-center gap-1.5 bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>xG: {homeXG.toFixed(1)} vs {awayXG.toFixed(1)}</span>
            </span>
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-4xl md:text-5xl mb-2 select-none">{awayTeam.flag}</span>
            <span className="text-sm font-black text-foreground leading-tight tracking-tight">{awayTeam.name}</span>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{t("common.rank")} #{awayTeam.fifaRanking}</span>
          </div>
        </div>

        {/* Win Probability Bar - Sleek Multi-segment slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
            <span className="text-primary">{homeTeam.name}: {homeWinProb}%</span>
            <span className="text-muted-foreground/80">{t("common.d") || "Draw"}: {drawProb}%</span>
            <span className="text-secondary">{awayTeam.name}: {awayWinProb}%</span>
          </div>
          
          <div className="h-4 w-full rounded-lg overflow-hidden flex bg-muted border border-border">
            {/* Home Win Segment */}
            <div 
              className="bg-primary h-full flex items-center justify-center text-[9px] font-black text-primary-foreground transition-all duration-700 uppercase tracking-widest" 
              style={{ width: `${homeWinProb}%` }}
              title={`${homeTeam.name} win probability: ${homeWinProb}%`}
            >
              {homeWinProb > 15 && winText}
            </div>
            {/* Draw Segment */}
            <div 
              className="bg-muted h-full flex items-center justify-center text-[9px] font-black text-foreground transition-all duration-700 border-x border-border uppercase tracking-widest" 
              style={{ width: `${drawProb}%` }}
              title={`Draw probability: ${drawProb}%`}
            >
              {drawProb > 15 && drawText}
            </div>
            {/* Away Win Segment */}
            <div 
              className="bg-secondary h-full flex items-center justify-center text-[9px] font-black text-secondary-foreground transition-all duration-700 uppercase tracking-widest" 
              style={{ width: `${awayWinProb}%` }}
              title={`${awayTeam.name} win probability: ${awayWinProb}%`}
            >
              {awayWinProb > 15 && winText}
            </div>
          </div>
        </div>

        {/* AI Rationale Summary Text */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <h5 className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span>{t("predictions.aiTacticalReasoning") || "AI Tactical Reasoning"}</span>
          </h5>
          <p className="text-xs text-foreground leading-relaxed font-semibold">
            {reasoning}
          </p>
        </div>

      </div>
    </div>
  );
}
