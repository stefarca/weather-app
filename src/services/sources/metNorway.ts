import type {
  CurrentWeather,
  ForecastPoint,
  Location,
  SourceForecast,
} from "../../types";
import { fromMetSymbol } from "../weatherCodes";

interface MetInstantDetails {
  air_temperature?: number;
  relative_humidity?: number;
  wind_speed?: number; // m/s
  wind_from_direction?: number;
  air_pressure_at_sea_level?: number;
  ultraviolet_index_clear_sky?: number;
}

interface MetNextHoursSummary {
  symbol_code?: string;
}

interface MetNextHoursDetails {
  precipitation_amount?: number;
  probability_of_precipitation?: number;
}

interface MetTimeseriesEntry {
  time: string;
  data: {
    instant: { details: MetInstantDetails };
    next_1_hours?: {
      summary?: MetNextHoursSummary;
      details?: MetNextHoursDetails;
    };
    next_6_hours?: {
      summary?: MetNextHoursSummary;
      details?: MetNextHoursDetails & {
        air_temperature_max?: number;
        air_temperature_min?: number;
      };
    };
    next_12_hours?: {
      summary?: MetNextHoursSummary;
    };
  };
}

interface MetForecastResponse {
  properties: {
    timeseries: MetTimeseriesEntry[];
  };
}

export async function fetchMetNorway(
  loc: Location,
  signal?: AbortSignal
): Promise<SourceForecast> {
  const url = new URL(
    "https://api.met.no/weatherapi/locationforecast/2.0/compact"
  );
  url.searchParams.set("lat", loc.latitude.toFixed(4));
  url.searchParams.set("lon", loc.longitude.toFixed(4));

  // Browsers refuse to set User-Agent — MET Norway accepts the default
  // browser UA in practice (CORS is enabled).
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`MET Norway HTTP ${res.status}`);
  const data: MetForecastResponse = await res.json();

  const series = data.properties.timeseries;
  if (!series.length) throw new Error("MET Norway: empty timeseries");

  const first = series[0]!;
  const firstInstant = first.data.instant.details;
  const firstSym =
    first.data.next_1_hours?.summary?.symbol_code ??
    first.data.next_6_hours?.summary?.symbol_code ??
    first.data.next_12_hours?.summary?.symbol_code ??
    "cloudy";

  const current: CurrentWeather = {
    tempC: firstInstant.air_temperature ?? Number.NaN,
    humidity: firstInstant.relative_humidity,
    condition: fromMetSymbol(firstSym),
    windKph:
      firstInstant.wind_speed != null
        ? Math.round(firstInstant.wind_speed * 3.6 * 10) / 10
        : undefined,
    windDirDeg: firstInstant.wind_from_direction,
    pressureHpa: firstInstant.air_pressure_at_sea_level,
    precipMm: first.data.next_1_hours?.details?.precipitation_amount,
    uvIndex: firstInstant.ultraviolet_index_clear_sky,
    observedAt: first.time,
  };

  const now = Date.now();
  const hourly: ForecastPoint[] = [];
  for (const entry of series) {
    const dt = new Date(entry.time).getTime();
    if (dt < now - 60 * 60 * 1000) continue;
    const t = entry.data.instant.details.air_temperature;
    if (t == null) continue;
    const sym =
      entry.data.next_1_hours?.summary?.symbol_code ??
      entry.data.next_6_hours?.summary?.symbol_code ??
      "cloudy";
    hourly.push({
      time: entry.time,
      tempC: t,
      condition: fromMetSymbol(sym),
      precipProb:
        entry.data.next_1_hours?.details?.probability_of_precipitation,
    });
    if (hourly.length >= 24) break;
  }

  // Aggregate a daily summary by picking the entry closest to 12:00 UTC each day.
  const byDay = new Map<string, MetTimeseriesEntry>();
  for (const entry of series) {
    const d = new Date(entry.time);
    const dayKey = d.toISOString().slice(0, 10);
    const existing = byDay.get(dayKey);
    const score = Math.abs(d.getUTCHours() - 12);
    const existingScore = existing
      ? Math.abs(new Date(existing.time).getUTCHours() - 12)
      : Infinity;
    if (score < existingScore) byDay.set(dayKey, entry);
  }
  const daily: ForecastPoint[] = [];
  for (const [day, entry] of byDay) {
    const t = entry.data.instant.details.air_temperature;
    if (t == null) continue;
    const sym =
      entry.data.next_6_hours?.summary?.symbol_code ??
      entry.data.next_12_hours?.summary?.symbol_code ??
      entry.data.next_1_hours?.summary?.symbol_code ??
      "cloudy";
    daily.push({
      time: day,
      tempC: t,
      condition: fromMetSymbol(sym),
      precipProb:
        entry.data.next_6_hours?.details?.probability_of_precipitation,
    });
    if (daily.length >= 7) break;
  }

  return {
    sourceId: "met-norway",
    sourceName: "MET Norway",
    sourceUrl: "https://api.met.no/",
    accent: "#34d399",
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
