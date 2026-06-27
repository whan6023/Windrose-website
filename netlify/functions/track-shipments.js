// All Windrose shipments — containers tracked via timetocargo API,
// B/L-only entries (RoRo, consolidated) use static data only.
const CONTAINERS = [
  // Completed shipments — routes verified, no need to poll API
  { id: 'TTNU0750322',  label: 'Truck #1',              bl: 'COSU6433904190', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Antwerp',   country: 'Belgium',        lat: 51.2194,  lng: 4.4025   },
    departure: '2025-11-09', arrival: '2026-01-09', days: 61, latestStatus: 'Delivered' },
  { id: 'TCLU6061172',  label: 'Truck #2',              bl: 'COSU6437078400', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Antwerp',   country: 'Belgium',        lat: 51.2194,  lng: 4.4025   },
    departure: null, arrival: '2026-01-30', days: null, latestStatus: 'Delivered' },
  { id: 'TEXU6012142',  label: 'Trucks #3–4',           bl: 'COSU6411786800', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Long Beach', country: 'United States', lat: 33.7432,  lng: -118.2141 },
    departure: '2025-03-18', arrival: '2025-04-02', days: 15, latestStatus: 'Delivered' },
  { id: 'TEXU8957641',  label: 'Trucks #5–6',           bl: 'COSU6411786800', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Long Beach', country: 'United States', lat: 33.7432,  lng: -118.2141 },
    departure: '2025-03-18', arrival: '2025-04-02', days: 15, latestStatus: 'Delivered' },
  { id: 'ECMU6607220',  label: 'Shipment D',            bl: 'NAM8404891', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Los Angeles', country: 'United States', lat: 33.7163, lng: -118.2644 },
    departure: '2026-04-02', arrival: '2026-04-15', days: 13, latestStatus: 'Delivered' },
  // Active / live containers — poll API for real-time status
  { id: 'DRYU2839809',  label: 'Shipment A',            bl: 'ONEYSH6AC6816600',
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Los Angeles', country: 'United States', lat: 33.7163, lng: -118.2644 },
    departure: '2026-05-25', arrival: '2026-06-22', days: 28 },
  { id: 'TLLU1477416',  label: 'Shipment B' },
  { id: 'TLLU1521951',  label: 'Shipment C' },

  // B/L-only shipments — no container number, skip timetocargo API
  { id: 'SF04106936',   label: 'RoRo #1 (Helsinki→Antwerp)', skipApi: true,
    pol: { name: 'Helsinki',  country: 'Finland',        lat: 60.1699,  lng: 24.9384 },
    pod: { name: 'Antwerp',   country: 'Belgium',        lat: 51.2194,  lng: 4.4025  },
    departure: null, arrival: null, days: 5 },
  { id: 'CN2471073',    label: 'Consolidated (Shanghai→Brisbane)', skipApi: true,
    pol: { name: 'Shanghai',  country: 'China',          lat: 31.4057,  lng: 121.5447 },
    pod: { name: 'Brisbane',  country: 'Australia',      lat: -27.4698, lng: 153.0251 },
    departure: null, arrival: null, days: 15 },
  { id: 'S327715434',   label: 'RoRo #2 (Auckland→Ningbo)', skipApi: true,
    pol: { name: 'Auckland',  country: 'New Zealand',    lat: -36.8485, lng: 174.7633 },
    pod: { name: 'Ningbo',    country: 'China',          lat: 29.8683,  lng: 121.5440 },
    departure: null, arrival: null, days: null },
  { id: 'COSU6447908310', label: 'ATA Return #1 (US→Shanghai)', bl: 'COSU6447908310', skipApi: true,
    pol: { name: 'Long Beach', country: 'United States', lat: 33.7432,  lng: -118.2141 },
    pod: { name: 'Shanghai',   country: 'China',         lat: 31.4057,  lng: 121.5447  },
    departure: null, arrival: null, days: null, cost: 'RMB 106,830.31', costUSD: 'USD 15,699.49' },
  { id: 'COSU6448828820', label: 'ATA Return #2 (US→Shanghai)', bl: 'COSU6448828820', skipApi: true,
    pol: { name: 'Long Beach', country: 'United States', lat: 33.7432,  lng: -118.2141 },
    pod: { name: 'Shanghai',   country: 'China',         lat: 31.4057,  lng: 121.5447  },
    departure: null, arrival: null, days: null, cost: 'RMB 107,644.85', costUSD: 'USD 15,819.13' },
  { id: 'COSU6447584950', label: 'Antwerp→Shanghai',            bl: 'COSU6447584950', skipApi: true,
    pol: { name: 'Antwerp',  country: 'Belgium', lat: 51.2194,  lng: 4.4025  },
    pod: { name: 'Shanghai', country: 'China',   lat: 31.4057,  lng: 121.5447 },
    departure: null, arrival: null, days: null, cost: 'RMB 97,537.51', costUSD: 'USD 14,333.84' },
  { id: 'ONEYSH6AC6816600', label: 'KD Export Shanghai→LA (4 CTN)', bl: 'ONEYSH6AC6816600', skipApi: true,
    pol: { name: 'Shanghai',    country: 'China',         lat: 31.4057,  lng: 121.5447  },
    pod: { name: 'Los Angeles', country: 'United States', lat: 33.7163,  lng: -118.2644 },
    departure: null, arrival: null, days: null, cost: 'RMB 33,164.88', costUSD: 'USD 4,873.82' },
  { id: 'VOLCANIC-ASH-DETENTION', label: 'Volcanic Ash Detention Fee', skipApi: true,
    pol: null, pod: null,
    departure: null, arrival: null, days: null, cost: 'RMB 24,436.44', costUSD: 'USD 3,591.11' },
];

const PORT_COORDS = {
  'BEANR': [51.2194, 4.4025],
  'NLRTM': [51.9225, 4.4792],
  'DEHAM': [53.5753, 9.9752],
  'USLAX': [33.7163, -118.2644],
  'USNYC': [40.6892, -74.0445],
};
const PORT_COORDS_BY_NAME = {
  'Antwerp':     [51.2194, 4.4025],
  'Rotterdam':   [51.9225, 4.4792],
  'Hamburg':     [53.5753, 9.9752],
  'New York':    [40.6892, -74.0445],
  'Los Angeles': [33.7163, -118.2644],
  'Long Beach':  [33.7432, -118.2141],
  'Zeebrugge':   [51.3581, 3.1999],
};

const BASE = 'https://tracking.timetocargo.com/v2/tracking';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function resolveCoords(loc) {
  if (!loc) return null;
  let lat = loc.lat, lng = loc.lng;
  if (!lat && loc.locode && PORT_COORDS[loc.locode]) [lat, lng] = PORT_COORDS[loc.locode];
  if (!lat && PORT_COORDS_BY_NAME[loc.name]) [lat, lng] = PORT_COORDS_BY_NAME[loc.name];
  return { name: loc.name, country: loc.country, lat, lng };
}

exports.handler = async function() {
  const key = process.env.TIMETOCARGO_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };

  const results = [];
  for (let i = 0; i < CONTAINERS.length; i++) {
    const c = CONTAINERS[i];

    // B/L-only entries: return static data without calling the API
    if (c.skipApi) {
      results.push({
        id: c.id, label: c.label, bl: c.bl || null,
        pol: c.pol || null, pod: c.pod || null,
        departure: c.departure || null, arrival: c.arrival || null, days: c.days || null,
        carrier: null, vessel: null, latestStatus: c.latestStatus || null, events: [],
        cost: c.cost || null, costUSD: c.costUSD || null,
      });
      continue;
    }

    await sleep(400);
    try {
      const url = `${BASE}?api_key=${key}&company=AUTO&value=${c.id}&type=container&need_route=true`;
      let json;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await sleep(1500);
        const res = await fetch(url);
        json = await res.json();
        if (json.success) break;
      }

      let pol = c.pol || null;
      let pod = c.pod || null;
      let carrier = null, vessel = null, latestStatus = null, events = [];

      if (json.success) {
        const d = json.data;
        const locs = d.locations || [];
        const summary = d.summary || {};
        carrier = summary.company?.name || null;
        events = (d.containers?.[0]?.events || []).slice(0, 5).map(ev => ({
          status: ev.status,
          date: ev.date,
          actual: ev.actual,
          vessel: ev.vessel,
          location: locs[ev.location]?.name || null,
        }));
        vessel = events.find(e => e.vessel)?.vessel || null;
        latestStatus = events[0]?.status || null;
        if (!pol) pol = resolveCoords({ ...locs[summary.pol?.location] });
        if (!pod) pod = resolveCoords({ ...locs[summary.pod?.location] });
      }

      results.push({
        id: c.id, label: c.label, bl: c.bl || null,
        carrier, vessel,
        pol: pol?.lat ? pol : null,
        pod: pod?.lat ? pod : null,
        departure: c.departure || null, arrival: c.arrival || null, days: c.days || null,
        latestStatus, events,
        cost: c.cost || null, costUSD: c.costUSD || null,
      });
    } catch (e) {
      results.push({
        id: c.id, label: c.label, bl: c.bl || null,
        pol: c.pol || null, pod: c.pod || null,
        departure: c.departure || null, arrival: c.arrival || null, days: c.days || null,
        error: e.message, cost: c.cost || null, costUSD: c.costUSD || null,
      });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
    body: JSON.stringify(results),
  };
};
