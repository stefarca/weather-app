import type {
  CurrentWeather,
  ForecastPoint,
  Location,
  SourceForecast,
  WeatherCondition,
} from "../../types";

// OpenWeather "main" group → emoji. Their `weather[].description` is already
// human-readable (and localizable via `lang=`), so we only synthesize an icon
// here and reuse the API's description verbatim.
const ICON_BY_MAIN: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "🌨️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

function toCondition(
  main: string | undefined,
  description: string | undefined
): WeatherCondition {
  const label = description
    ? description.charAt(0).toUpperCase() + description.slice(1)
    : (main ?? "Unknown");
  return {
    label,
    icon: (main && ICON_BY_MAIN[main]) ?? "❓",
  };
}

interface OwmWeather {
  main: string;
  description: string;
}

interface OwmCurrentResponse {
  dt: number;
  main: {
    temp: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather: OwmWeather[];
  wind?: { speed?: number; deg?: number };
  rain?: { "1h"?: number };
  snow?: { "1h"?: number };
}

interface OwmForecastEntry {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: OwmWeather[];
  pop?: number; // 0–1
}

interface OwmForecastResponse {
  list: OwmForecastEntry[];
  city: { timezone: number };
}

// `lang=it` returns pre-translated Italian condition descriptions, matching
// the use case called out for the Italy section.
const LANG = "it";

export async function fetchOpenWeather(
  loc: Location,
  signal?: AbortSignal
): Promise<SourceForecast> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error(
      "OpenWeather: missing API key (set VITE_OPENWEATHER_API_KEY in .env)"
    );
  }

  const base = "https://api.openweathermap.org/data/2.5";
  const params = new URLSearchParams({
    lat: loc.latitude.toFixed(4),
    lon: loc.longitude.toFixed(4),
    units: "metric",
    lang: LANG,
    appid: apiKey,
  });

  const [curRes, fcRes] = await Promise.all([
    fetch(`${base}/weather?${params}`, { signal }),
    fetch(`${base}/forecast?${params}`, { signal }),
  ]);
  if (!curRes.ok) throw new Error(`OpenWeather HTTP ${curRes.status}`);
  if (!fcRes.ok) throw new Error(`OpenWeather HTTP ${fcRes.status}`);

  const cur: OwmCurrentResponse = await curRes.json();
  const fc: OwmForecastResponse = await fcRes.json();

  const curW = cur.weather[0];
  const current: CurrentWeather = {
    tempC: cur.main.temp,
    feelsLikeC: cur.main.feels_like,
    humidity: cur.main.humidity,
    condition: toCondition(curW?.main, curW?.description),
    windKph:
      cur.wind?.speed != null
        ? Math.round(cur.wind.speed * 3.6 * 10) / 10
        : undefined,
    windDirDeg: cur.wind?.deg,
    pressureHpa: cur.main.pressure,
    precipMm: cur.rain?.["1h"] ?? cur.snow?.["1h"],
    observedAt: new Date(cur.dt * 1000).toISOString(),
  };

  // Hourly: forecast endpoint gives 3-hour steps; surface up to 24h (8 steps).
  const now = Date.now();
  const hourly: ForecastPoint[] = [];
  for (const entry of fc.list) {
    const dt = entry.dt * 1000;
    if (dt < now - 60 * 60 * 1000) continue;
    const w = entry.weather[0];
    hourly.push({
      time: new Date(dt).toISOString(),
      tempC: entry.main.temp,
      condition: toCondition(w?.main, w?.description),
      precipProb: entry.pop != null ? Math.round(entry.pop * 100) : undefined,
    });
    if (hourly.length >= 8) break;
  }

  // Daily: aggregate 3-hour steps by local date, prefer the midday entry.
  const tzOffsetMs = (fc.city.timezone ?? 0) * 1000;
  type DayAgg = {
    min: number;
    max: number;
    pop: number;
    midday?: OwmForecastEntry;
    middayScore: number;
  };
  const byDay = new Map<string, DayAgg>();
  for (const entry of fc.list) {
    const localMs = entry.dt * 1000 + tzOffsetMs;
    const localDate = new Date(localMs);
    const dayKey = localDate.toISOString().slice(0, 10);
    const hour = localDate.getUTCHours();
    const score = Math.abs(hour - 12);
    const existing = byDay.get(dayKey);
    if (!existing) {
      byDay.set(dayKey, {
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        pop: entry.pop ?? 0,
        midday: entry,
        middayScore: score,
      });
    } else {
      existing.min = Math.min(existing.min, entry.main.temp_min);
      existing.max = Math.max(existing.max, entry.main.temp_max);
      existing.pop = Math.max(existing.pop, entry.pop ?? 0);
      if (score < existing.middayScore) {
        existing.midday = entry;
        existing.middayScore = score;
      }
    }
  }
  const daily: ForecastPoint[] = [];
  for (const [day, agg] of byDay) {
    const w = agg.midday?.weather[0];
    daily.push({
      time: day,
      tempC: (agg.min + agg.max) / 2,
      condition: toCondition(w?.main, w?.description),
      precipProb: Math.round(agg.pop * 100),
    });
    if (daily.length >= 7) break;
  }

  return {
    sourceId: "openweather",
    sourceName: "OpenWeather",
    sourceUrl: "https://openweathermap.org/",
    accent: "#ef4444",
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
