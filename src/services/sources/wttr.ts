import type {
  CurrentWeather,
  ForecastPoint,
  Location,
  SourceForecast,
} from "../../types";
import { fromWwoCode } from "../weatherCodes";

interface WttrCurrent {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  weatherCode: string;
  windspeedKmph: string;
  winddirDegree: string;
  pressure: string;
  precipMM: string;
  uvIndex: string;
  observation_time: string;
}

interface WttrHourly {
  time: string; // "0", "300", "600", ..., "2100"
  tempC: string;
  weatherCode: string;
  chanceofrain: string;
}

interface WttrDay {
  date: string;
  avgtempC: string;
  hourly: WttrHourly[];
}

interface WttrResponse {
  current_condition?: WttrCurrent[];
  weather?: WttrDay[];
}

function hourTimeToISO(date: string, t: string): string {
  // wttr.in encodes times like "0", "300", "600", … "2100"
  const padded = t.padStart(4, "0");
  const hh = padded.slice(0, 2);
  const mm = padded.slice(2, 4);
  return `${date}T${hh}:${mm}:00`;
}

export async function fetchWttr(
  loc: Location,
  signal?: AbortSignal
): Promise<SourceForecast> {
  const q = `${loc.latitude},${loc.longitude}`;
  const url = `https://wttr.in/${encodeURIComponent(q)}?format=j1`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`wttr.in HTTP ${res.status}`);
  const data: WttrResponse = await res.json();

  const cur = data.current_condition?.[0];
  if (!cur) throw new Error("wttr.in: no current data");

  const current: CurrentWeather = {
    tempC: Number(cur.temp_C),
    feelsLikeC: Number(cur.FeelsLikeC),
    humidity: Number(cur.humidity),
    condition: fromWwoCode(cur.weatherCode),
    windKph: Number(cur.windspeedKmph),
    windDirDeg: Number(cur.winddirDegree),
    pressureHpa: Number(cur.pressure),
    precipMm: Number(cur.precipMM),
    uvIndex: Number(cur.uvIndex),
    observedAt: cur.observation_time,
  };

  const now = Date.now();
  const hourly: ForecastPoint[] = [];
  for (const day of data.weather ?? []) {
    for (const h of day.hourly ?? []) {
      const iso = hourTimeToISO(day.date, h.time);
      const dt = new Date(iso).getTime();
      if (dt < now - 60 * 60 * 1000) continue;
      hourly.push({
        time: iso,
        tempC: Number(h.tempC),
        condition: fromWwoCode(h.weatherCode),
        precipProb: Number(h.chanceofrain),
      });
      if (hourly.length >= 24) break;
    }
    if (hourly.length >= 24) break;
  }

  const daily: ForecastPoint[] = (data.weather ?? []).map((d) => {
    // pick a midday hourly entry for the condition
    const mid = d.hourly.find((h) => h.time === "1200") ?? d.hourly[0]!;
    return {
      time: d.date,
      tempC: Number(d.avgtempC),
      condition: fromWwoCode(mid.weatherCode),
      precipProb: Number(mid.chanceofrain),
    };
  });

  return {
    sourceId: "wttr",
    sourceName: "wttr.in",
    sourceUrl: "https://wttr.in/",
    accent: "#f472b6",
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
