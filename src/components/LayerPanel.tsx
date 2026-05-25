'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Baby, Heart, Gift, MapPin, ShieldAlert,
  Users, ChevronDown, ChevronUp,
} from 'lucide-react';

interface LayerPanelProps {
  data: any;
  activeLayers: any;
  setActiveLayers: React.Dispatch<React.SetStateAction<any>>;
  onLayerChange?: (layer: string) => void;
}

const LAYER_GROUPS = [
  {
    label: 'REGISTRATION COVERAGE',
    color: '#1B3A6B',
    layers: [
      { key: 'nid_coverage', label: 'National ID (Adults)', icon: CreditCard, color: '#1B3A6B', description: 'NID coverage for adults 18+' },
      { key: 'birth_reg', label: 'Birth Registration', icon: Baby, color: '#2563EB', description: 'Birth reg. rate for children under 5' },
      { key: 'death_reg', label: 'Death Registration', icon: Heart, color: '#7C3AED', description: 'Death registration completeness' },
      { key: 'marriage_reg', label: 'Marriage Registration', icon: Gift, color: '#DB2777', description: 'Marriage registration rate' },
    ],
  },
  {
    label: 'FACILITIES',
    color: '#1E6B3C',
    layers: [
      { key: 'centres', label: 'Registration Centres', icon: MapPin, color: '#1E6B3C', description: 'Permanent + mobile registration points' },
    ],
  },
  {
    label: 'CONTEXT',
    color: '#D97706',
    layers: [
      { key: 'disease_alerts', label: 'Disease Alerts (WHO)', icon: ShieldAlert, color: '#D97706', description: 'WHO AFRO outbreak alerts affecting registration' },
      { key: 'refugee_zones', label: 'Refugee Settlements', icon: Users, color: '#9333EA', description: 'UNHCR refugee settlement locations' },
    ],
  },
];

// Only one coverage layer can be active at a time
const COVERAGE_LAYERS = new Set(['nid_coverage', 'birth_reg', 'death_reg', 'marriage_reg']);

const LAYER_TO_API: Record<string, string> = {
  nid_coverage: 'nid',
  birth_reg: 'birth',
  death_reg: 'death',
  marriage_reg: 'marriage',
};

export default memo(function LayerPanel({ activeLayers, setActiveLayers, onLayerChange }: LayerPanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) =>
    setCollapsed(p => ({ ...p, [label]: !p[label] }));

  const toggleLayer = (key: string) => {
    setActiveLayers((prev: any) => {
      const next = { ...prev };

      if (COVERAGE_LAYERS.has(key)) {
        // Coverage layers are mutually exclusive — enable the clicked one, disable others
        COVERAGE_LAYERS.forEach(k => { next[k] = false; });
        next[key] = !prev[key];
        if (next[key] && onLayerChange) onLayerChange(LAYER_TO_API[key] || 'nid');
      } else {
        next[key] = !prev[key];
      }
      return next;
    });
  };

  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel overflow-hidden pointer-events-auto"
    >
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-bold text-[var(--text-heading)] tracking-widest uppercase font-mono">
            Data Layers
          </h2>
          <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
            {activeLayerCount} active · Click to toggle
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-bold text-[var(--gold-primary)]">{activeLayerCount}</span>
          <span className="text-[9px] text-[var(--text-muted)]">ON</span>
        </div>
      </div>

      {/* Layer groups */}
      <div className="divide-y divide-gray-50">
        {LAYER_GROUPS.map(group => {
          const isCollapsed = collapsed[group.label];
          const activeInGroup = group.layers.filter(l => activeLayers[l.key]).length;

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--hover-accent)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  <span className="text-[9px] font-bold tracking-widest uppercase font-mono text-[var(--text-muted)]">
                    {group.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeInGroup > 0 && (
                    <span className="text-[9px] font-mono font-bold text-[var(--gold-primary)]">
                      {activeInGroup}/{group.layers.length}
                    </span>
                  )}
                  {isCollapsed ? (
                    <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" />
                  )}
                </div>
              </button>

              {/* Layers */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {group.layers.map(layer => {
                      const isActive = !!activeLayers[layer.key];
                      const Icon = layer.icon;

                      return (
                        <button
                          key={layer.key}
                          onClick={() => toggleLayer(layer.key)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                            isActive ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-[var(--hover-accent)]'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: isActive ? `${layer.color}18` : 'transparent',
                              border: `1px solid ${isActive ? layer.color + '40' : 'transparent'}`,
                            }}
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              style={{ color: isActive ? layer.color : 'var(--text-muted)' }}
                            />
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs font-medium truncate ${isActive ? 'text-[var(--text-heading)]' : 'text-[var(--text-secondary)]'}`}
                            >
                              {layer.label}
                            </div>
                          </div>

                          {/* Toggle */}
                          <div
                            className={`layer-toggle flex-shrink-0 ${isActive ? 'active' : ''}`}
                            aria-label={isActive ? 'On' : 'Off'}
                          />
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-2">Coverage Scale</p>
        <div className="flex items-center gap-1">
          <div className="h-2 rounded-l flex-1" style={{ background: '#7f1d1d' }} />
          <div className="h-2 flex-1" style={{ background: '#dc2626' }} />
          <div className="h-2 flex-1" style={{ background: '#f97316' }} />
          <div className="h-2 flex-1" style={{ background: '#eab308' }} />
          <div className="h-2 flex-1" style={{ background: '#22c55e' }} />
          <div className="h-2 rounded-r flex-1" style={{ background: '#15803d' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-red-500 font-mono">0%</span>
          <span className="text-[8px] text-amber-500 font-mono">40%</span>
          <span className="text-[8px] text-amber-400 font-mono">70%</span>
          <span className="text-[8px] text-green-600 font-mono">100%</span>
        </div>
      </div>
    </motion.div>
  );
});
