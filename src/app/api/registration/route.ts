import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const LAYER_FIELD: Record<string, string> = {
  nid: 'nid_coverage_pct',
  birth: 'birth_registration_pct',
  death: 'death_registration_pct',
  marriage: 'marriage_registration_pct',
};

function getStatus(pct: number): string {
  if (pct < 40) return 'critical';
  if (pct < 70) return 'needs_attention';
  return 'on_track';
}

let coverageDataCache: any = null;
function getCoverageData() {
  if (!coverageDataCache) {
    const filePath = join(process.cwd(), 'public', 'data', 'nira-coverage.json');
    coverageDataCache = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return coverageDataCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer') || 'nid';
  const region = searchParams.get('region') || 'all';
  const field = LAYER_FIELD[layer] || 'nid_coverage_pct';

  const coverageData = getCoverageData();

  const districts = (coverageData.districts as any[])
    .filter((d: any) => region === 'all' || d.region === region)
    .map((d: any) => ({
      id: d.district_id,
      name: d.name,
      region: d.region,
      subregion: d.subregion,
      population: d.population,
      lat: d.lat,
      lon: d.lon,
      coverage: d[field],
      nid_coverage_pct: d.nid_coverage_pct,
      birth_registration_pct: d.birth_registration_pct,
      death_registration_pct: d.death_registration_pct,
      marriage_registration_pct: d.marriage_registration_pct,
      registration_centres: d.registration_centres,
      status: getStatus(d[field]),
      trend: d.trend,
      mobile_teams_needed: d.mobile_teams_needed,
      last_drive: d.last_drive,
      notes: d.notes || null,
    }));

  const summary = {
    total_districts: districts.length,
    critical: districts.filter((d: any) => d.status === 'critical').length,
    needs_attention: districts.filter((d: any) => d.status === 'needs_attention').length,
    on_track: districts.filter((d: any) => d.status === 'on_track').length,
    national_average: Math.round(
      districts.reduce((sum: number, d: any) => sum + d.coverage, 0) / districts.length * 10
    ) / 10,
    total_population: coverageData.metadata.national_summary.total_population,
    total_registered: coverageData.metadata.national_summary.total_registered,
  };

  // Top 10 priority districts (mobile team deployment score)
  const priorities = [...districts]
    .sort((a: any, b: any) => {
      const scoreA = (100 - a.coverage) * Math.log(a.population) / (a.registration_centres || 1);
      const scoreB = (100 - b.coverage) * Math.log(b.population) / (b.registration_centres || 1);
      return scoreB - scoreA;
    })
    .slice(0, 10)
    .map((d: any, i: number) => ({ rank: i + 1, ...d }));

  return NextResponse.json(
    { layer, districts, summary, priorities },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    }
  );
}
