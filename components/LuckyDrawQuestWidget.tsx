"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Clock, CheckCircle2, Gift, Mail, 
  User, Phone, MapPin, Loader2, Sparkles, AlertCircle,
  ArrowRight, X
} from "lucide-react";
import { enrollInLuckyDraw } from "@/lib/firebase";
import { db } from "@/lib/api";
import { Team } from "@/lib/mockData";

export default function LuckyDrawQuestWidget() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  // Task completion states
  const [matchesDone, setMatchesDone] = useState(false);
  const [standingsDone, setStandingsDone] = useState(false);
  const [predictionsDone, setPredictionsDone] = useState(false);
  const [predictionRunDone, setPredictionRunDone] = useState(false);

  // Time remaining states
  const [matchesTime, setMatchesTime] = useState(10);
  const [standingsTime, setStandingsTime] = useState(10);
  const [predictionsTime, setPredictionsTime] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    favoriteTeam: "",
    address: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Audio/Visual feedback ref
  const lastPathRef = useRef("");

  // Load configuration and initial state on mount
  useEffect(() => {
    // Load teams for select list
    db.getTeams().then((data) => {
      setTeams(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, favoriteTeam: data[0].name }));
      }
    });

    // Check localStorage keys
    const checkState = () => {
      const active = localStorage.getItem("lucky_draw_quest_active") === "true";
      const enrolled = !!localStorage.getItem("lucky_draw_enrolled_ticket");
      
      setIsActive(active);
      setIsEnrolled(enrolled);

      setMatchesDone(localStorage.getItem("lucky_draw_matches_done") === "true");
      setStandingsDone(localStorage.getItem("lucky_draw_standings_done") === "true");
      setPredictionsDone(localStorage.getItem("lucky_draw_predictions_done") === "true");
      setPredictionRunDone(localStorage.getItem("lucky_draw_prediction_run") === "true");

      const savedMatchesTime = localStorage.getItem("lucky_draw_matches_time");
      const savedStandingsTime = localStorage.getItem("lucky_draw_standings_time");
      const savedPredictionsTime = localStorage.getItem("lucky_draw_predictions_time");

      if (savedMatchesTime !== null) setMatchesTime(parseInt(savedMatchesTime));
      if (savedStandingsTime !== null) setStandingsTime(parseInt(savedStandingsTime));
      if (savedPredictionsTime !== null) setPredictionsTime(parseInt(savedPredictionsTime));
    };

    checkState();

    // Listen for storage events (updates from other tabs/banners)
    window.addEventListener("storage", checkState);
    
    // Custom event listener for starting the quest
    const handleQuestStart = () => checkState();
    window.addEventListener("lucky_draw_quest_started", handleQuestStart);

    return () => {
      window.removeEventListener("storage", checkState);
      window.removeEventListener("lucky_draw_quest_started", handleQuestStart);
    };
  }, []);

  // Timer loop - ticks every second when quest is active and not enrolled
  useEffect(() => {
    if (!isActive || isEnrolled || success) return;

    const interval = setInterval(() => {
      // Check current page
      if (pathname === "/matches" && !matchesDone) {
        setMatchesTime(prev => {
          const nextVal = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("lucky_draw_matches_time", nextVal.toString());
          if (nextVal === 0) {
            setMatchesDone(true);
            localStorage.setItem("lucky_draw_matches_done", "true");
          }
          return nextVal;
        });
      } else if (pathname === "/standings" && !standingsDone) {
        setStandingsTime(prev => {
          const nextVal = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("lucky_draw_standings_time", nextVal.toString());
          if (nextVal === 0) {
            setStandingsDone(true);
            localStorage.setItem("lucky_draw_standings_done", "true");
          }
          return nextVal;
        });
      } else if (pathname === "/predictions" && !predictionsDone) {
        setPredictionsTime(prev => {
          const nextVal = prev > 0 ? prev - 1 : 0;
          localStorage.setItem("lucky_draw_predictions_time", nextVal.toString());
          if (nextVal === 0) {
            setPredictionsDone(true);
            localStorage.setItem("lucky_draw_predictions_done", "true");
          }
          return nextVal;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isEnrolled, pathname, matchesDone, standingsDone, predictionsDone, success]);

  // Keep ref updated
  useEffect(() => {
    lastPathRef.current = pathname;
  }, [pathname]);

  if (!isActive || (isEnrolled && !success)) return null;

  const allDone = matchesDone && standingsDone && predictionsDone && predictionRunDone;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError("Please fill in all details.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const result = await enrollInLuckyDraw(formData);
      if (result.success) {
        // Store details in local storage so other components (like the banner) can display the success state and registered details
        localStorage.setItem("lucky_draw_enrolled_ticket", result.id);
        localStorage.setItem("lucky_draw_enrolled_name", formData.name);
        localStorage.setItem("lucky_draw_enrolled_email", formData.email);
        localStorage.setItem("lucky_draw_enrolled_team", formData.favoriteTeam);

        setSuccess(true);
        // Trigger page re-renders for other components (like banner)
        window.dispatchEvent(new Event("storage"));
        // Slide out after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setIsEnrolled(true);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during enrollment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Determine current redirection target link
  const getNextRedirection = () => {
    if (!matchesDone) {
      return { label: "Explore Match Center", href: "/matches" };
    }
    if (!standingsDone) {
      return { label: "Explore Rankings", href: "/standings" };
    }
    if (!predictionsDone) {
      return { label: "Explore Predictions", href: "/predictions" };
    }
    if (!predictionRunDone) {
      return { label: "Run AI Prediction", href: "/predictions" };
    }
    return null;
  };

  const nextRedirect = getNextRedirection();

  return (
    <>
      {/* Sticky Bottom Floating Bar (Responsive position: shifts up bottom-[76px] on mobile to clear bottom tabbar) */}
      <div className="fixed bottom-[76px] xl:bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto w-[calc(100%-2rem)] bg-card/90 border border-border/80 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform animate-in slide-in-from-bottom-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Progress items */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 text-foreground font-black text-[11px] sm:text-xs uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-pulse" />
              <span>Lucky Draw Quest:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] font-bold">
              {/* Match Center Progress */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
                matchesDone 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : pathname === "/matches"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                    : "bg-muted/40 border-border text-muted-foreground"
              }`}>
                <span>Match Center</span>
                {matchesDone ? (
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <span className="font-mono text-[8px] sm:text-[9px]">({matchesTime}s)</span>
                )}
              </div>

              {/* Standings Progress */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
                standingsDone 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : pathname === "/standings"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                    : "bg-muted/40 border-border text-muted-foreground"
              }`}>
                <span>Rankings</span>
                {standingsDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="font-mono text-[8px] sm:text-[9px]">({standingsTime}s)</span>
                )}
              </div>

              {/* Predictions Progress */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
                predictionsDone 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : pathname === "/predictions"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                    : "bg-muted/40 border-border text-muted-foreground"
              }`}>
                <span>Predictions</span>
                {predictionsDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="font-mono text-[8px] sm:text-[9px]">({predictionsTime}s)</span>
                )}
              </div>

              {/* Run AI Prediction Action Progress */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${
                predictionRunDone 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : pathname === "/predictions" && predictionsDone
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                    : "bg-muted/40 border-border text-muted-foreground"
              }`}>
                <span>Run AI Prediction</span>
                {predictionRunDone ? (
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <Clock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons / Enroll Option */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            {allDone ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full md:w-auto bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow hover:scale-[1.02] transition flex items-center justify-center gap-1.5 animate-bounce cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Enroll Now!</span>
              </button>
            ) : nextRedirect ? (
              <Link
                href={nextRedirect.href}
                className="w-full md:w-auto bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                <span>{nextRedirect.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal Enrollment Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Click outside to close */}
          <div className="fixed inset-0" onClick={() => !submitting && !success && setShowForm(false)} />
          
          {/* Form container */}
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary animate-pulse" />
                  <span>Lucky Draw Enrollment</span>
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Quests completed! Submit your details below to finalize your registration.
                </p>
              </div>
              
              {!submitting && !success && (
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Success screen */}
            {success ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <CheckCircle2 className="h-7 w-7 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-black uppercase text-foreground">Enrolled Successfully!</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Your fan registration is active. Your entry has been recorded in the database. We will notify the winners directly by email.
                  </p>
                </div>
                <div className="mx-auto max-w-xs rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-left text-[11px] font-semibold">
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1.5">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground font-bold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorite Team:</span>
                    <span className="text-foreground font-bold">{formData.favoriteTeam}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full name */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  {/* Favorite Team */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Favorite World Cup Team</label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        name="favoriteTeam"
                        value={formData.favoriteTeam}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition outline-none appearance-none"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.name}>{t.flag} {t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mailing address */}
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Mailing / Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="123 Championship Way, Suite 4B, New York, NY 10001"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-muted text-foreground border border-border rounded-xl font-bold hover:bg-muted/65 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary text-primary-foreground font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit Enrollment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
