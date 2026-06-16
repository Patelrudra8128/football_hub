"use client";

import React from "react";
import { Shield, Lock, Eye, FileText, Bell } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
          Privacy <span className="teal-gradient-text">Policy</span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto font-semibold">
          Last updated: June 16, 2026. Learn how Football Score handles, protects, and respects your personal data.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-10 space-y-8 shadow-sm">
        
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            1. Introduction & Overview
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Welcome to Football Score (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We operate the live match score dashboard, AI predictions portal, and standings analytics platform. This Privacy Policy describes how we collect, use, process, and disclose your information when you use our website, mobile application, or API feeds.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            By accessing or using Football Score, you agree to the collection and use of information in accordance with this policy. Your privacy is critical to us, and we are committed to maintaining industry-standard protocols to safeguard your personal data.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Data We Collect */}
        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            2. Information We Collect
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            We collect several different types of information for various purposes to provide and improve our sports statistics service to you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-muted/15 border border-border/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Personal Data</span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                While using our service, you may provide us with personally identifiable information, such as your email address (when registering for analytics updates, predictions dashboards, or admin notifications).
              </p>
            </div>
            <div className="bg-muted/15 border border-border/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                <Eye className="w-4 h-4 text-primary" />
                <span>Usage & Telemetry Data</span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                We collect diagnostic logs automatically. This includes your IP address, browser type, pages visited, time spent on match detail interfaces, and interaction with the live scoreboard or team lineups grid.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-border/60" />

        {/* Use of Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            3. How We Use Your Data
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Football Score utilizes the gathered information to deliver high-quality sports tracking:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground font-medium">
            <li>To compile, personalize, and optimize our live score telemetry and AI-driven match outcome forecasts.</li>
            <li>To manage your dashboard account, verify admin credentials, and save your preferred teams or active matches.</li>
            <li>To monitor website speed, optimize API calls to external providers (such as ESPN or FIFA feeds), and detect security anomalies.</li>
            <li>To deliver push notifications or match alerts (such as goal alerts, yellow/red cards, and full-time summaries) if authorized by your browser.</li>
          </ul>
        </section>

        <hr className="border-border/60" />

        {/* Cookies & Ad Networks */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            4. Cookies, Analytics & Third-Party Tags
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            We use essential cookies to maintain your light/dark theme preference and active sessions. Additionally, we integrate Google Analytics and authorized advertising scripts (such as Monetag monetization scripts, e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">0614d9bb504d89645de55b2bae139b70</code>) to serve contextually relevant information and analyze site-wide performance metrics.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our Match Center might not function as intended.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Data Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-black uppercase text-foreground tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            5. Information Security
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            We value your trust in providing us with your personal details. We implement modern SSL/TLS encryption protocols across all endpoints. While no method of transmission over the Internet or electronic storage is 100% secure, we strive to use commercially acceptable means to protect your personal information.
          </p>
        </section>

        <hr className="border-border/60" />

        {/* Contact Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-foreground">Have questions about your data?</h4>
            <p className="text-xs text-muted-foreground font-semibold">
              Reach out directly to our privacy compliance team for requests, options, and data removal.
            </p>
          </div>
          <a
            href="mailto:privacy@footballscore.example.com"
            className="inline-flex justify-center items-center px-4 py-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition cursor-pointer"
          >
            Contact Privacy Officer
          </a>
        </div>

      </div>
    </div>
  );
}
