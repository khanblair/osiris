import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Static NIRA alerts for prototype — in production these come from WHO AFRO RSS + NIRA news feed
const PROTOTYPE_ALERTS = [
  {
    id: 'ALT001',
    type: 'critical',
    category: 'coverage_drop',
    title: 'Kaabong NID coverage fell below 20%',
    district: 'Kaabong',
    region: 'Karamoja',
    lat: 3.52,
    lon: 34.14,
    timestamp: '2024-11-15T08:00:00Z',
    source: 'NIRA District Report',
    summary: 'NID registration in Kaabong has declined 3.2% quarter-on-quarter due to extended dry season preventing access to remote areas. Mobile team deployment recommended.',
    action: 'Deploy mobile team — Priority Level 5',
  },
  {
    id: 'ALT002',
    type: 'warning',
    category: 'disease_outbreak',
    title: 'Cholera outbreak affecting Adjumani registration centres',
    district: 'Adjumani',
    region: 'Northern',
    lat: 3.38,
    lon: 31.79,
    timestamp: '2024-11-12T14:00:00Z',
    source: 'WHO AFRO Uganda',
    summary: 'Cholera outbreak declared in Adjumani district. Two registration centres suspended operations as a precaution. Backlog of ~4,200 applications expected.',
    action: 'Monitor — Centres to reopen when outbreak contained',
  },
  {
    id: 'ALT003',
    type: 'info',
    category: 'mobile_drive',
    title: 'Mobile registration drive launched — Yumbe',
    district: 'Yumbe',
    region: 'Northern',
    lat: 3.46,
    lon: 31.25,
    timestamp: '2024-11-10T09:00:00Z',
    source: 'NIRA Headquarters',
    summary: 'A 3-week mobile registration drive is underway in Yumbe, targeting 15,000 unregistered adults in Rhino Camp and Imvepi refugee settlements in partnership with UNHCR.',
    action: 'Ongoing — Track weekly issuance targets',
  },
  {
    id: 'ALT004',
    type: 'warning',
    category: 'coverage_drop',
    title: 'Birth registration stalled in 8 Karamoja districts',
    district: 'Moroto',
    region: 'Karamoja',
    lat: 2.54,
    lon: 34.67,
    timestamp: '2024-11-08T11:00:00Z',
    source: 'UBOS Vital Statistics Unit',
    summary: 'Birth registration rates across Karamoja sub-region remain below 13% despite two previous mobile drives. Root cause analysis suggests need for community health worker integration.',
    action: 'Escalate to Minister — Policy intervention required',
  },
  {
    id: 'ALT005',
    type: 'info',
    category: 'milestone',
    title: 'Kampala reaches 70% NID coverage milestone',
    district: 'Kampala',
    region: 'Central',
    lat: 0.35,
    lon: 32.58,
    timestamp: '2024-11-05T15:00:00Z',
    source: 'NIRA Kampala Region',
    summary: 'Kampala district has crossed the 70% NID coverage threshold, making it the first district to achieve this milestone. Strategy review underway to replicate approach nationally.',
    action: 'Document best practices — Share with regional offices',
  },
  {
    id: 'ALT006',
    type: 'critical',
    category: 'facility',
    title: 'Amudat registration centre closed — equipment failure',
    district: 'Amudat',
    region: 'Karamoja',
    lat: 1.95,
    lon: 34.95,
    timestamp: '2024-11-03T10:00:00Z',
    source: 'NIRA Field Operations',
    summary: 'The only registration centre in Amudat district has been offline for 3 weeks due to fingerprint scanner malfunction. Replacement equipment dispatched from Kampala.',
    action: 'Emergency — Equipment ETA: 5 days',
  },
  {
    id: 'ALT007',
    type: 'warning',
    category: 'refugee',
    title: 'New refugee arrivals in Kikuube — registration backlog building',
    district: 'Kikuube',
    region: 'Western',
    lat: 1.45,
    lon: 31.05,
    timestamp: '2024-11-01T08:00:00Z',
    source: 'UNHCR Uganda',
    summary: '8,400 new refugees arrived at Kyangwali settlement in October. NIRA has received UNHCR referrals for 3,200 individuals eligible for NIN. Current centre capacity is insufficient.',
    action: 'Coordinate with UNHCR — Scale up Kyangwali registration point',
  },
  {
    id: 'ALT008',
    type: 'info',
    category: 'data_sync',
    title: 'Q3 2024 registration data compiled from 135 districts',
    district: null,
    region: null,
    lat: 1.37,
    lon: 32.29,
    timestamp: '2024-10-28T16:00:00Z',
    source: 'NIRA Data Management Unit',
    summary: 'Q3 2024 national registration data has been consolidated. National NID coverage stands at 41.1%. 18 districts remain in critical status. Full report available to authorised NIRA officers.',
    action: 'Share with planning committee',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const type = searchParams.get('type') || 'all';

  let alerts = PROTOTYPE_ALERTS;
  if (category !== 'all') alerts = alerts.filter(a => a.category === category);
  if (type !== 'all') alerts = alerts.filter(a => a.type === type);

  return NextResponse.json(
    {
      alerts,
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length,
      last_sync: new Date().toISOString(),
      note: 'Prototype data — production feed connects to WHO AFRO RSS + NIRA News API',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
