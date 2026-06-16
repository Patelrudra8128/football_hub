"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Calendar, Trophy, Sparkles, LayoutGrid } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/live", label: "Live", icon: Activity },
    { href: "/matches", label: "Matches", icon: Calendar },
    { href: "/standings", label: "Rankings", icon: Trophy },
    { href: "/predictions", label: "Predict", icon: Sparkles },
    { href: "/design-system", label: "System", icon: LayoutGrid }
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border/80 px-2 py-2.5 flex justify-around items-center shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition ${
              isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
