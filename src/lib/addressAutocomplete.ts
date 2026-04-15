/** Photon (OpenStreetMap) — browser-friendly CORS; debounce calls from the UI. */

const PHOTON_URL = 'https://photon.komoot.io/api/';

type PhotonProps = {
  name?: string;
  housenumber?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

function labelFromPhotonProps(p: PhotonProps): string {
  const line1 = [p.housenumber, p.street].filter(Boolean).join(' ').trim();
  const region = [p.city, p.state, p.postcode].filter(Boolean).join(', ');
  if (line1 && region) return `${line1}, ${region}`;
  if (line1) return line1;
  if (p.name && region) return `${p.name}, ${region}`;
  if (p.name) return p.name;
  if (region) return region;
  return '';
}

/**
 * Returns display strings for address autocomplete (US and worldwide via OSM).
 * No API key. Respect Photon/OSM usage: debounce (~300ms+) and don’t hammer on every keystroke.
 */
export async function fetchAddressSuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL(PHOTON_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '10');
  url.searchParams.set('lang', 'en');

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Address search failed');

  const json = (await res.json()) as {
    features?: { properties?: PhotonProps }[];
  };
  const features = json.features ?? [];
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const f of features) {
    const label = labelFromPhotonProps(f.properties ?? {});
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}
