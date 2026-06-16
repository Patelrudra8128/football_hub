"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border mt-auto pb-20 xl:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo Section */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="teal-gradient-text font-black uppercase">{t("brand")}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/matches" className="hover:text-primary transition-colors font-medium">{t("nav.matchCenter")}</Link></li>
              <li><Link href="/standings" className="hover:text-primary transition-colors font-medium">{t("nav.rankings")}</Link></li>
              <li><Link href="/predictions" className="hover:text-primary transition-colors font-medium">{t("nav.predictions")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground">
          <span>&copy; {currentYear} {t("footer.copyright")}</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:underline">{t("footer.terms")}</Link>
            <a href="#" className="hover:underline">{t("footer.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
