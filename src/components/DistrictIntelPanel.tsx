'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Building2, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface DistrictIntelPanelProps {
  district: any | null;
  onClose: () => void;
  onLocate: (lat: number, lon: number) => void;
}


const STATUS_CONFIG = {
  critical: { label: 'CRITICAL', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' },
  needs_attention: { label: 'NEEDS ATTENTION', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  on_track: { label: 'ON TRACK', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500', bar: 'bg-green-500' },
};

function CoverageBar({ label, pct }: { label: string; pct: number }) {
  const status = pct < 40 ? 'critical' : pct < 70 ? 'needs_attention' : 'on_track';
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
        <span className={`text-xs font-bold font-mono ${pct < 40 ? 'text-red-600' : pct < 70 ? 'text-amber-600' : 'text-green-600'}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${cfg.bar}`}
        />
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

function priorityAction(d: any): string {
  if (d.nid_coverage_pct < 20) return `Deploy ${d.mobile_teams_needed} emergency mobile teams — coverage below crisis threshold`;
  if (d.nid_coverage_pct < 30) return `Deploy ${d.mobile_teams_needed} mobile teams — critical gap requires immediate intervention`;
  if (d.nid_coverage_pct < 40) return `Schedule ${d.mobile_teams_needed} mobile drives — district below national minimum target`;
  if (d.nid_coverage_pct < 55) return `Plan ${d.mobile_teams_needed || 1} mobile drive — gap above average, targeted outreach needed`;
  return 'Continue routine registration — maintain current staffing levels';
}

export default function DistrictIntelPanel({ district, onClose, onLocate }: DistrictIntelPanelProps) {
  return (
    <AnimatePresence>
      {district && (
        <motion.div
          key={district.district_id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-white rounded-2xl border border-[var(--border-primary)] shadow-xl overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[district.status as keyof typeof STATUS_CONFIG]?.border} ${STATUS_CONFIG[district.status as keyof typeof STATUS_CONFIG]?.bg} ${STATUS_CONFIG[district.status as keyof typeof STATUS_CONFIG]?.text}`}>
                  {STATUS_CONFIG[district.status as keyof typeof STATUS_CONFIG]?.label}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{district.region}</span>
              </div>
              <h2 className="text-base font-bold text-[var(--text-heading)] leading-tight truncate">
                {district.name} District
              </h2>
              {district.subregion && (
                <p className="text-[11px] text-[var(--text-muted)]">{district.subregion} sub-region</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onLocate(district.lat, district.lon)}
                className="p-1.5 rounded-lg hover:bg-[var(--hover-accent)] transition-colors text-[var(--gold-primary)]"
                title="Locate on map"
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto styled-scrollbar" style={{ maxHeight: 'calc(100vh - 260px)' }}>

            {/* Quick stats */}
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <Users className="w-4 h-4 text-[var(--gold-primary)] mx-auto mb-1" />
                  <div className="text-sm font-bold text-[var(--text-heading)]">
                    {(district.population / 1000).toFixed(0)}K
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">Population</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <Building2 className="w-4 h-4 text-[var(--cyan-primary)] mx-auto mb-1" />
                  <div className="text-sm font-bold text-[var(--text-heading)]">{district.registration_centres}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">Centres</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendIcon trend={district.trend} />
                  </div>
                  <div className={`text-sm font-bold capitalize ${
                    district.trend === 'improving' ? 'text-green-600' :
                    district.trend === 'declining' ? 'text-red-600' : 'text-gray-500'
                  }`}>{district.trend}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">Trend</div>
                </div>
              </div>
            </div>

            {/* Coverage metrics */}
            <div className="px-4 py-3 border-b border-gray-50 space-y-3">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Registration Coverage</h3>
              <CoverageBar label="National ID (Adults)" pct={district.nid_coverage_pct} />
              <CoverageBar label="Birth Registration" pct={district.birth_registration_pct} />
              <CoverageBar label="Death Registration" pct={district.death_registration_pct} />
              <CoverageBar label="Marriage Registration" pct={district.marriage_registration_pct} />
            </div>

            {/* Operations */}
            <div className="px-4 py-3 border-b border-gray-50 space-y-2">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Operations</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Last mobile drive</span>
                <div className="flex items-center gap-1 text-[var(--text-heading)] font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{district.last_drive || 'Not recorded'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Mobile teams needed</span>
                <span className={`font-bold ${district.mobile_teams_needed >= 5 ? 'text-red-600' : district.mobile_teams_needed >= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                  {district.mobile_teams_needed} team{district.mobile_teams_needed !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">People per centre</span>
                <span className="font-mono font-bold text-[var(--text-heading)]">
                  {Math.round(district.population / (district.registration_centres || 1)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recommended action */}
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Recommended Action</h3>
              <div className={`rounded-xl p-3 border ${district.nid_coverage_pct < 40 ? 'bg-red-50 border-red-100' : district.nid_coverage_pct < 70 ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex items-start gap-2">
                  {district.nid_coverage_pct < 40 ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : district.nid_coverage_pct < 70 ? (
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  )}
                  <p className={`text-xs leading-relaxed ${district.nid_coverage_pct < 40 ? 'text-red-700' : district.nid_coverage_pct < 70 ? 'text-amber-700' : 'text-green-700'}`}>
                    {priorityAction(district)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {district.notes && (
              <div className="px-4 py-3 border-b border-gray-50">
                <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Field Notes</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{district.notes}</p>
              </div>
            )}

            {/* Data source */}
            <div className="px-4 py-3">
              <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                Data: NIRA Annual Report 2022/23 + UBOS Census 2024. Prototype — district-level figures are estimates disaggregated from regional totals.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
