"use client";

import React from "react";
import { FileText, ShieldAlert, Award, Compass, RefreshCw } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
          Terms of <span className="teal-gradient-text">Service</span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto font-semibold">
          Last updated: June 16, 2026. Review the rules, liability statements, and guidelines governing Football Score.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-10 space-y-8 shadow-sm">
        
        {/* Agreement */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            1. Agreement to Terms
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            By accessing or using our website, live ticker dashboards, lineups generator, and AI expected outcomes projections (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you must terminate your access to the Service immediately.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            These terms apply to all visitors, logged-in administrators, users, and others who access the platform.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* AI & Analytics disclaimer */}
        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            2. AI Predictions & Content Disclaimer
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Football Score provides predictive analytics, team performance forecasts, and expected goal (xG) projections computed using specialized data modeling. 
          </p>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-destructive block">Not Financial or Betting Advice</span>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                Our statistics and AI calculations are purely for entertainment, educational, and general discussion purposes. We do not support, host, or offer any form of gambling or sports betting. Football Score is not liable for any financial losses incurred from actions or decisions taken based on prediction models.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-border/60" />

        {/* IP */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            3. Intellectual Property Rights
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            All proprietary software, code, styling architectures, design system files, layouts, UI graphics, and proprietary analytical models are the exclusive intellectual property of Football Score and its licensors. 
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            You may not scrape, replicate, recompile, resell, or distribute our proprietary live data feeds or widgets without obtaining a commercial license or written permissions from our development office.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Live Feeds & API */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            4. External Feeds & Service Interruptions
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            We fetch live matches, standings tables, rosters, and player telemetry from third-party sports APIs (such as ESPN API feeds). While we strive to ensure maximum accuracy and near-instant telemetry updates, we do not guarantee the absolute correctness or uninterrupted availability of live scores, player stats, or match statuses. 
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Service may be temporarily suspended due to server migrations, API network issues, developer maintenance, or structural updates.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Termination */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            5. User Accounts & Admin Guidelines
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Certain administrative tools or scoring panels require account setup. If you create an account, you must safeguard your login credentials and ensure the information provided is accurate and complete. We reserve the right to suspend or terminate accounts that breach guidelines or engage in disruptive behavior on our public servers.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Terms Updates */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <RefreshCw className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-foreground">Amendments and Changes</h4>
            <p className="text-xs text-muted-foreground leading-normal font-semibold">
              We reserve the right to modify these terms at any time. When updates occur, we will post the revised version and modify the last updated date. Continued use of Football Score after changes take effect constitutes your consent to the new terms.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
