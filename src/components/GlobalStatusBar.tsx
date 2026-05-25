'use client';

import { motion } from 'framer-motion';

interface GlobalStatusBarProps {
  niraStats?: any;
  alertCount?: number;
  districtCount?: number;
}

const TICKER_ITEMS = [
  '🇺🇬 UGANDA · CIVIL REGISTRATION INTELLIGENCE PLATFORM',
  '📋 SOURCE: NIRA Annual Report 2022/23 + UBOS Census 2024',
  '🏥 DATA FEEDS: NIRA Operations · WHO AFRO · UNHCR Uganda · UBOS',
  '⚠️ PROTOTYPE — For demonstration purposes at the Uganda Ministry of ICT Showcase',
  '📌 TARGET: 100% NID coverage for all 47M+ Ugandans by 2030',
  '🚐 MOBILE TEAMS: Karamoja sub-region flagged as highest priority corridor',
  '📊 CRVS METRICS: NID · Birth · Death · Marriage registration rates',
  '🛰️ NIRA-INTEL built on open-source geospatial intelligence infrastructure',
  '🏛️ MINISTRY OF ICT & NATIONAL GUIDANCE — Government Systems Prototype Showcase 2026',
];

export default function GlobalStatusBar({ niraStats, alertCount = 0, districtCount = 57 }: GlobalStatusBarProps) {
  const coverage = niraStats?.national_average ?? '—';
  const critical = niraStats?.critical ?? '—';
  const registered = niraStats?.total_registered
    ? `${(niraStats.total_registered / 1e6).toFixed(1)}M`
    : '19.3M';

  const tickerContent = (
    <>
      <span className="inline-flex items-center gap-1.5 mx-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        <span className="text-[var(--gold-primary)] font-bold">NIRA-INTEL</span>
        <span className="text-[var(--text-muted)]">ONLINE</span>
      </span>
      <span className="text-[var(--border-primary)] mx-1">|</span>

      <span className="inline-flex items-center gap-1 mx-3">
        <span className="text-[var(--text-muted)]">REGISTERED</span>
        <span className="text-[var(--gold-primary)] font-bold">{registered}</span>
      </span>

      <span className="inline-flex items-center gap-1 mx-3">
        <span className="text-[var(--text-muted)]">NID COV.</span>
        <span className="font-bold" style={{ color: '#1E6B3C' }}>{coverage}%</span>
      </span>

      <span className="inline-flex items-center gap-1 mx-3">
        <span className="text-[var(--text-muted)]">CRITICAL</span>
        <span className="font-bold" style={{ color: '#DC2626' }}>{critical}</span>
        <span className="text-[var(--text-muted)]">DISTRICTS</span>
      </span>

      <span className="text-[var(--border-primary)] mx-1">|</span>

      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-0.5 mx-4 text-[var(--text-secondary)]">
          {item}
        </span>
      ))}

      <span className="text-[var(--border-primary)] mx-1">|</span>

      <span className="inline-flex items-center gap-1 mx-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)]" />
        <span className="text-[var(--text-muted)]">ALERTS</span>
        <span className="text-[var(--gold-primary)] font-bold">{alertCount}</span>
      </span>

      <span className="inline-flex items-center gap-1 mx-3">
        <span className="text-[var(--text-muted)]">DISTRICTS MONITORED</span>
        <span className="font-bold text-[var(--gold-primary)]">{districtCount}</span>
      </span>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 4, duration: 0.8 }}
      className="hidden md:block absolute bottom-0 left-0 right-0 z-[198] pointer-events-none"
    >
      <div className="h-[22px] overflow-hidden bg-[var(--bg-panel)]/90 border-t border-[var(--border-secondary)]/50 flex items-center text-[8px] font-mono tracking-wider backdrop-blur-sm">
        <div className="flex-shrink-0 px-2 h-full flex items-center gap-1 border-r border-[var(--border-secondary)]/50 bg-[var(--bg-panel)]">
          <span className="text-[9px]">🇺🇬</span>
          <span className="text-[var(--gold-primary)] font-bold">NIRA</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center animate-ticker whitespace-nowrap">
            {tickerContent}
            {tickerContent}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
