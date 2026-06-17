"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, ArrowRight, Clock, HelpCircle } from "lucide-react";

export default function LuckyDrawBanner() {
  const [stage, setStage] = useState<"start" | "progress" | "success">("start");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    favoriteTeam: ""
  });

  useEffect(() => {
    const checkStatus = () => {
      const enrolled = !!localStorage.getItem("lucky_draw_enrolled_ticket");
      const active = localStorage.getItem("lucky_draw_quest_active") === "true";
      
      if (enrolled) {
        setStage("success");
        
        const storedName = localStorage.getItem("lucky_draw_enrolled_name");
        const storedEmail = localStorage.getItem("lucky_draw_enrolled_email");
        const storedTeam = localStorage.getItem("lucky_draw_enrolled_team");
        
        if (storedName) {
          setFormData({
            name: storedName,
            email: storedEmail || "",
            favoriteTeam: storedTeam || ""
          });
        } else {
          // Fallback to entries array in local storage (e.g. for backward compatibility/mock data)
          try {
            const entries = JSON.parse(localStorage.getItem("lucky_draw_entries") || "[]");
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              setFormData({
                name: lastEntry.name || "Enrolled Fan",
                email: lastEntry.email || "",
                favoriteTeam: lastEntry.favoriteTeam || ""
              });
            } else {
              setFormData({
                name: "Enrolled Fan",
                email: "",
                favoriteTeam: ""
              });
            }
          } catch (e) {
            console.error("Error reading enrolled entry:", e);
            setFormData({
              name: "Enrolled Fan",
              email: "",
              favoriteTeam: ""
            });
          }
        }
      } else if (active) {
        setStage("progress");
      } else {
        setStage("start");
      }
    };

    checkStatus();
    
    // Listen for state changes (from layout widget or storage changes)
    window.addEventListener("storage", checkStatus);
    window.addEventListener("lucky_draw_quest_started", checkStatus);

    // Also poll occasionally to capture fast status changes in single-tab
    const interval = setInterval(checkStatus, 1000);

    return () => {
      window.removeEventListener("storage", checkStatus);
      window.removeEventListener("lucky_draw_quest_started", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleStartQuest = () => {
    localStorage.setItem("lucky_draw_quest_active", "true");
    window.dispatchEvent(new Event("lucky_draw_quest_started"));
    setStage("progress");
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg transition-all duration-300">
      {/* Background Decorative Blur */}
      <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 -z-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      {stage === "start" && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive Promotion</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              Enroll in the <span className="teal-gradient-text">Lucky Draw</span> & Win Exclusive Gear!
            </h2>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Earn eligibility by completing a fan navigation quest. Visit key sections of our soccer hub (Match Center, Rankings, and Predictions) for 10 seconds each to unlock enrollment!
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={handleStartQuest}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md transition hover:scale-[1.02] hover:opacity-95 cursor-pointer"
              >
                <span>Start Verification Quest</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Reward Display grid */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md shrink-0">
            {/* Jersey Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_jersey.png" 
                  alt="Player Jersey" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Player Jersey</span>
            </div>

            {/* Ball Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_football.png" 
                  alt="Official Football" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Match Ball</span>
            </div>

            {/* Mug Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_mug.png" 
                  alt="Championship Mug" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Premium Mug</span>
            </div>
          </div>
        </div>
      )}

      {stage === "progress" && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-500 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Verification Quest In Progress</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              Explore Pages to Unlock!
            </h2>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your fan verification quest is currently active. Use the status bar at the bottom of the screen to guide your visits. Stay on each of the following sections for **10 seconds** to complete the time lock:
            </p>

            <ul className="grid grid-cols-3 gap-2 text-[10px] font-extrabold text-foreground text-left max-w-sm pt-2">
              <li className="flex items-center gap-1 bg-muted/30 border border-border/80 px-2.5 py-1.5 rounded-lg">⚽ Match Center</li>
              <li className="flex items-center gap-1 bg-muted/30 border border-border/80 px-2.5 py-1.5 rounded-lg">🏆 Rankings</li>
              <li className="flex items-center gap-1 bg-muted/30 border border-border/80 px-2.5 py-1.5 rounded-lg">🔮 Predictions</li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-2xl max-w-sm w-full bg-muted/10">
            <HelpCircle className="w-10 h-10 text-muted-foreground/30 mb-2 animate-bounce" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Follow Bottom Status Bar</h3>
            <p className="text-[10px] text-muted-foreground text-center mt-1 leading-relaxed">
              Timers tick automatically once you visit each section internally. When all timers hit 0, the enrollment form will unlock in the status bar.
            </p>
          </div>
        </div>
      )}

      {stage === "success" && (
        <div className="space-y-6 text-center py-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
              Enrolled Successfully!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Thank you for participating! Your entry has been recorded in the database. We will notify the winners directly by email.
            </p>
          </div>

          {/* Clean Glassmorphic Confirmation Panel */}
          <div className="mx-auto max-w-sm rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-left text-xs font-semibold">
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Participant:</span>
              <span className="text-foreground font-bold">{formData.name || "Enrolled Fan"}</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground font-bold">{formData.email || "Registered Email"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Favorite Team:</span>
              <span className="text-foreground font-bold">{formData.favoriteTeam || "Selected Team"}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
