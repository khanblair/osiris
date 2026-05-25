'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, MapPin, AlertTriangle,
  Bell, Info, AlertCircle, Clock,
} from 'lucide-react';

interface LiveAlertsProps {
  data: any;
  onLocate: (lat: number, lng: number) => void;
  onWatchFeed?: (url: string, name: string) => void;
}

const TYPE_CONFIG: Record<string, { color: string; Icon: any; label: string }> = {
  critical: { color: '#DC2626', Icon: AlertCircle, label: 'CRITICAL' },
  warning:  { color: '#D97706', Icon: AlertTriangle, label: 'WARNING' },
  info:     { color: '#1B3A6B', Icon: Info, label: 'INFO' },
};

export default function LiveAlerts({ data, onLocate }: LiveAlertsProps) {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const alerts: any[] = data.nira_alerts ?? [];

  const filtered = filter === 'all' ? alerts : alerts.filter((a: any) => a.type === filter);

  const critCount = alerts.filter((a: any) => a.type === 'critical').length;
  const warnCount = alerts.filter((a: any) => a.type === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass-panel flex flex-col overflow-hidden pointer-events-auto"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-3 py-2 hover:bg-[var(--hover-accent)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          <span className="hud-text text-[10px] text-[var(--text-primary)]">NIRA ALERTS</span>
          {critCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold bg-red-100 text-red-600 border border-red-200">
              {critCount} CRITICAL
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200">
              {warnCount} WARN
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {critCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-osiris-pulse" />}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-2 pb-2"
          >
            {/* Filters */}
            <div className="flex gap-1 mb-2">
              {(['all', 'critical', 'warning', 'info'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded text-[9px] font-mono tracking-wider transition-all ${
                    filter === f
                      ? 'bg-[var(--hover-accent)] text-[var(--text-primary)] border border-[var(--border-primary)]'
                      : 'text-[var(--text-muted)] border border-transparent hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Alert list */}
            <div className="space-y-0.5 max-h-[220px] overflow-y-auto styled-scrollbar">
              {filtered.length === 0 && (
                <div className="text-center py-4 text-[10px] font-mono text-[var(--text-muted)]">
                  No alerts
                </div>
              )}
              {filtered.map((alert: any, i: number) => {
                const cfg = TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.info;
                const Icon = cfg.Icon;
                return (
                  <button
                    key={alert.id ?? i}
                    onClick={() => onLocate(alert.lat, alert.lon)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[var(--hover-accent)] transition-all border border-transparent hover:border-[var(--border-primary)] group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon className="w-3 h-3 flex-shrink-0" style={{ color: cfg.color }} />
                          <span className="text-[10px] font-mono text-[var(--text-primary)] truncate leading-tight">
                            {alert.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[8px] font-mono text-[var(--text-muted)]">
                            {alert.district} · {alert.region}
                          </span>
                        </div>
                        {alert.summary && (
                          <p className="text-[8px] text-[var(--text-muted)] leading-snug line-clamp-2">
                            {alert.summary}
                          </p>
                        )}
                        {alert.action && (
                          <p className="text-[8px] font-mono text-[var(--gold-primary)] mt-0.5 truncate">
                            → {alert.action}
                          </p>
                        )}
                        {alert.timestamp && (
                          <span className="text-[7px] font-mono text-[var(--text-muted)] flex items-center gap-0.5 mt-0.5">
                            <Clock className="w-2 h-2" />
                            {new Date(alert.timestamp).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })}
                            {' · '}{alert.source}
                          </span>
                        )}
                      </div>
                      <MapPin className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Source note */}
            <p className="text-[7px] font-mono text-[var(--text-muted)] mt-1.5 px-1">
              Sources: NIRA Operations · WHO AFRO · UNHCR Uganda
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
