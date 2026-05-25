'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronDown, ChevronUp, MapPin, AlertCircle, AlertTriangle, Info, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface IntelFeedProps {
  data: any;
  onLocate?: (lat: number, lng: number) => void;
}

const TYPE_CFG: Record<string, { color: string; bg: string; Icon: any }> = {
  critical: { color: '#DC2626', bg: 'bg-red-50 border-red-200',    Icon: AlertCircle },
  warning:  { color: '#D97706', bg: 'bg-amber-50 border-amber-200', Icon: AlertTriangle },
  info:     { color: '#1B3A6B', bg: 'bg-blue-50 border-blue-100',   Icon: Info },
};

function coverageColor(pct: number) {
  if (pct < 20) return '#7f1d1d';
  if (pct < 30) return '#dc2626';
  if (pct < 40) return '#f97316';
  if (pct < 55) return '#eab308';
  if (pct < 70) return '#22c55e';
  return '#15803d';
}

export default function IntelFeed({ data, onLocate }: IntelFeedProps) {
  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<'alerts' | 'priorities'>('alerts');

  const alerts: any[] = data.nira_alerts ?? [];
  const districts: any[] = data.nira_districts ?? [];

  // Priority score: lower coverage + larger population = higher priority
  const priorities = [...districts]
    .filter(d => d.status !== 'on_track')
    .map(d => ({
      ...d,
      score: ((100 - d.nid_coverage_pct) * Math.log(d.population)) / Math.max(d.registration_centres, 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  const critCount = alerts.filter(a => a.type === 'critical').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="glass-panel flex flex-col overflow-hidden pointer-events-auto"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 hover:bg-[var(--hover-accent)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          <span className="hud-text text-[12px] text-[var(--text-primary)]">NIRA INTEL</span>
          {critCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold bg-red-100 text-red-600 border border-red-200">
              {critCount} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)] animate-osiris-pulse" />
          {expanded ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-[var(--border-secondary)] px-4 gap-4">
              {(['alerts', 'priorities'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-2 text-[9px] font-mono tracking-widest uppercase border-b-2 transition-colors -mb-px ${
                    tab === t
                      ? 'border-[var(--gold-primary)] text-[var(--gold-primary)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t === 'alerts' ? `Alerts (${alerts.length})` : `Priorities (${priorities.length})`}
                </button>
              ))}
            </div>

            <div className="max-h-[380px] overflow-y-auto styled-scrollbar">
              {/* ── ALERTS TAB ── */}
              {tab === 'alerts' && (
                <div className="divide-y divide-[var(--border-secondary)]">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[11px] font-mono text-[var(--text-muted)] tracking-widest">
                      NO ACTIVE ALERTS
                    </div>
                  ) : alerts.map((alert: any, i: number) => {
                    const cfg = TYPE_CFG[alert.type] ?? TYPE_CFG.info;
                    const Icon = cfg.Icon;
                    return (
                      <div key={alert.id ?? i} className="px-4 py-3 hover:bg-[var(--hover-accent)] transition-colors">
                        <div className="flex items-start gap-2">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-[10px] font-mono font-bold" style={{ color: cfg.color }}>
                                {alert.type.toUpperCase()}
                              </span>
                              <span className="text-[8px] font-mono text-[var(--text-muted)]">{alert.source}</span>
                            </div>
                            <p className="text-[11px] text-[var(--text-primary)] leading-snug mb-1">{alert.title}</p>
                            <p className="text-[9px] text-[var(--text-muted)] leading-relaxed mb-1">{alert.summary}</p>
                            {alert.action && (
                              <p className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>
                                → {alert.action}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[8px] font-mono text-[var(--text-muted)]">
                                {alert.district} · {alert.region}
                              </span>
                              {alert.lat && alert.lon && onLocate && (
                                <button
                                  onClick={() => onLocate(alert.lat, alert.lon)}
                                  className="flex items-center gap-0.5 text-[8px] font-mono text-[var(--text-muted)] hover:text-[var(--gold-primary)] transition-colors"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  Locate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PRIORITIES TAB ── */}
              {tab === 'priorities' && (
                <div className="divide-y divide-[var(--border-secondary)]">
                  <div className="px-4 py-2 bg-[var(--hover-accent)]">
                    <p className="text-[8px] font-mono text-[var(--text-muted)] tracking-wider">
                      RANKED BY: (100 - NID%) × log(population) ÷ centres
                    </p>
                  </div>
                  {priorities.map((d: any, i: number) => {
                    const TrendIcon = d.trend === 'improving' ? TrendingUp : d.trend === 'declining' ? TrendingDown : Minus;
                    const trendColor = d.trend === 'improving' ? '#16A34A' : d.trend === 'declining' ? '#DC2626' : '#94A3B8';
                    return (
                      <div key={d.district_id} className="px-4 py-2.5 hover:bg-[var(--hover-accent)] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] w-5 flex-shrink-0">
                            #{i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{d.name}</span>
                              <span className="text-[10px] font-mono font-bold ml-2 flex-shrink-0" style={{ color: coverageColor(d.nid_coverage_pct) }}>
                                {d.nid_coverage_pct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-mono text-[var(--text-muted)]">
                                {d.region} · {(d.population / 1000).toFixed(0)}K pop · {d.registration_centres} ctrs
                              </span>
                              <TrendIcon className="w-3 h-3 flex-shrink-0" style={{ color: trendColor }} />
                            </div>
                            {d.mobile_teams_needed > 0 && (
                              <p className="text-[8px] font-mono mt-0.5" style={{ color: '#D97706' }}>
                                → {d.mobile_teams_needed} mobile team{d.mobile_teams_needed > 1 ? 's' : ''} needed
                              </p>
                            )}
                          </div>
                          {onLocate && (
                            <button
                              onClick={() => onLocate(d.lat, d.lon)}
                              className="text-[var(--text-muted)] hover:text-[var(--gold-primary)] transition-colors flex-shrink-0"
                            >
                              <MapPin className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
