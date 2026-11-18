export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Approximate city-centre coordinates for the cities the problem wizard
 * offers. Problems are geo-located from the selected city because the wizard
 * does not collect exact coordinates. Unknown cities fall back to the centre
 * of India so distance filtering stays functional (just coarse).
 */
const CITY_COORDINATES: Record<string, Coordinates> = {
  pune: { latitude: 18.5204, longitude: 73.8567 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  "navi mumbai": { latitude: 19.033, longitude: 73.0297 },
  thane: { latitude: 19.2183, longitude: 72.9781 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  "delhi ncr": { latitude: 28.6139, longitude: 77.209 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  noida: { latitude: 28.5355, longitude: 77.391 },
  gurugram: { latitude: 28.4595, longitude: 77.0266 },
  gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
  nagpur: { latitude: 21.1458, longitude: 79.0882 },
  indore: { latitude: 22.7196, longitude: 75.8577 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
};

const FALLBACK_COORDINATES: Coordinates = { latitude: 20.5937, longitude: 78.9629 };

export function coordinatesForCity(city: string): Coordinates {
  return CITY_COORDINATES[city.trim().toLowerCase()] ?? FALLBACK_COORDINATES;
}

/** Great-circle distance between two coordinates, in kilometres. */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
