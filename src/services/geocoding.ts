import type { Location } from "../types";

interface OpenMeteoGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
}

/**
 * Search locations by text using Open-Meteo's free geocoding API.
 * https://open-meteo.com/en/docs/geocoding-api
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<Location[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data: OpenMeteoGeoResponse = await res.json();

  return (data.results ?? []).map((r) => ({
    name: r.name,
    admin: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

/** Reverse geocode coordinates to a place name via Open-Meteo. */
export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<Location> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data: OpenMeteoGeoResponse = await res.json();
      const r = data.results?.[0];
      if (r) {
        return {
          name: r.name,
          admin: r.admin1,
          country: r.country,
          countryCode: r.country_code,
          latitude: lat,
          longitude: lon,
          timezone: r.timezone,
        };
      }
    }
  } catch {
    // fall through
  }
  return {
    name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
    latitude: lat,
    longitude: lon,
  };
}
