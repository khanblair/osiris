'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Building2 } from 'lucide-react';

interface SearchBarProps {
  onLocate: (lat: number, lng: number) => void;
  districts?: any[];
}

// Uganda bounding box — constrains Nominatim to Uganda only
const UG_VIEWBOX = '29.4,-1.6,35.1,4.3';

export default function SearchBar({ onLocate, districts = [] }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [results, setResults] = useState<{ label: string; sub?: string; lat: number; lng: number; isDistrict?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const parseCoords = (s: string): { lat: number; lng: number } | null => {
    const m = s.trim().match(/^([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)$/);
    if (!m) return null;
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
    return null;
  };

  const searchDistricts = (q: string) => {
    const lower = q.toLowerCase();
    return districts
      .filter(d => d.name.toLowerCase().includes(lower) || d.region?.toLowerCase().includes(lower))
      .slice(0, 4)
      .map(d => ({
        label: `${d.name} District`,
        sub: `${d.region} · NID ${d.nid_coverage_pct}% · Pop. ${Number(d.population).toLocaleString()}`,
        lat: d.lat,
        lng: d.lon,
        isDistrict: true,
      }));
  };

  const handleSearch = useCallback(async (q: string) => {
    setValue(q);
    const coords = parseCoords(q);
    if (coords) {
      setResults([{ label: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`, lat: coords.lat, lng: coords.lng }]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 2) { setResults([]); return; }

    // Immediate district matches (no debounce)
    const districtMatches = searchDistricts(q);
    setResults(districtMatches);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=4&countrycodes=ug&viewbox=${UG_VIEWBOX}&bounded=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const geoResults = data.map((r: any) => ({
          label: r.display_name.split(',').slice(0, 3).join(','),
          sub: 'Uganda',
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          isDistrict: false,
        }));
        // Merge: district matches first, then geo (dedupe by proximity)
        const merged = [...districtMatches];
        geoResults.forEach((g: any) => {
          const dup = merged.some(m => Math.abs(m.lat - g.lat) < 0.05 && Math.abs(m.lng - g.lng) < 0.05);
          if (!dup) merged.push(g);
        });
        setResults(merged.slice(0, 6));
      } catch { /* keep district results */ }
      setLoading(false);
    }, 350);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts]);

  const handleSelect = (r: { lat: number; lng: number }) => {
    onLocate(r.lat, r.lng);
    setOpen(false);
    setValue('');
    setResults([]);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 glass-panel-sm px-3 py-2 text-[9px] font-mono tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--gold-primary)] hover:border-[var(--border-active)] transition-all"
      >
        <Search className="w-3 h-3" />
        SEARCH DISTRICTS
      </button>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 glass-panel px-3 py-2.5 !border-[var(--border-active)]">
        <Search className="w-3.5 h-3.5 text-[var(--gold-primary)] flex-shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setOpen(false); setValue(''); setResults([]); }
            if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
          }}
          placeholder="Search Uganda districts or place names..."
          className="flex-1 bg-transparent text-[10px] text-[var(--text-primary)] font-mono tracking-wider outline-none placeholder:text-[var(--text-muted)]"
        />
        {loading && <div className="w-3 h-3 border border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin" />}
        <button onClick={() => { setOpen(false); setValue(''); setResults([]); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="w-3 h-3" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 glass-panel overflow-hidden shadow-lg max-h-[240px] overflow-y-auto styled-scrollbar z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2.5 hover:bg-[var(--hover-accent)] transition-colors border-b border-[var(--border-secondary)] last:border-0 flex items-start gap-2"
            >
              {r.isDistrict
                ? <Building2 className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0 mt-0.5" />
                : <MapPin className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0 mt-0.5" />
              }
              <div className="min-w-0">
                <div className="text-[9px] text-[var(--text-primary)] font-mono truncate">{r.label}</div>
                {r.sub && <div className="text-[8px] text-[var(--text-muted)] font-mono truncate mt-0.5">{r.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
