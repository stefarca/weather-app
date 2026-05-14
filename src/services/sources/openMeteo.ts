import type {
  CurrentWeather,
  ForecastPoint,
  Location,
  SourceForecast,
  SourceId,
} from "../../types";
import { fromWmoCode } from "../weatherCodes";

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    pressure_msl?: number;
    precipitation?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max?: number[];
  };
}

export interface OpenMeteoVariantConfig {
  sourceId: SourceId;
  sourceName: string;
  sourceUrl: string;
  accent: string;
  /** Open-Meteo `models=` parameter, e.g. "italia_meteo_arpae_icon_2i" */
  model?: string;
}

export function makeOpenMeteoFetcher(
  cfg: OpenMeteoVariantConfig
): (loc: Location, signal?: AbortSignal) => Promise<SourceForecast> {
  return async (loc, signal) => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", loc.latitude.toString());
    url.searchParams.set("longitude", loc.longitude.toString());
    url.searchParams.set("timezone", "auto");
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "pressure_msl",
        "precipitation",
      ].join(",")
    );
    url.searchParams.set(
      "hourly",
      "temperature_2m,weather_code,precipitation_probability"
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
    );
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("forecast_days", "7");
    if (cfg.model) url.searchParams.set("models", cfg.model);

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${cfg.sourceName} HTTP ${res.status}`);
    const data: OpenMeteoResponse = await res.json();

    const cur = data.current;
    if (!cur) throw new Error(`${cfg.sourceName}: no current data`);

    const current: CurrentWeather = {
      tempC: cur.temperature_2m,
      feelsLikeC: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      condition: fromWmoCode(cur.weather_code),
      windKph: cur.wind_speed_10m,
      windDirDeg: cur.wind_direction_10m,
      pressureHpa: cur.pressure_msl,
      precipMm: cur.precipitation,
      observedAt: cur.time,
    };

    const hourly: ForecastPoint[] = [];
    if (data.hourly) {
      const now = Date.now();
      const len = data.hourly.time.length;
      for (let i = 0; i < len; i++) {
        const t = data.hourly.time[i]!;
        const dt = new Date(t).getTime();
        if (dt < now - 60 * 60 * 1000) continue;
        const temp = data.hourly.temperature_2m[i];
        const code = data.hourly.weather_code[i];
        if (temp == null || code == null || Number.isNaN(temp)) continue;
        hourly.push({
          time: t,
          tempC: temp,
          condition: fromWmoCode(code),
          precipProb: data.hourly.precipitation_probability?.[i],
        });
        if (hourly.length >= 24) break;
      }
    }

    const daily: ForecastPoint[] = [];
    if (data.daily) {
      const len = data.daily.time.length;
      for (let i = 0; i < len; i++) {
        const max = data.daily.temperature_2m_max[i];
        const min = data.daily.temperature_2m_min[i];
        const code = data.daily.weather_code[i];
        if (max == null || min == null || code == null) continue;
        daily.push({
          time: data.daily.time[i]!,
          tempC: (max + min) / 2,
          condition: fromWmoCode(code),
          precipProb: data.daily.precipitation_probability_max?.[i],
        });
      }
    }

    return {
      sourceId: cfg.sourceId,
      sourceName: cfg.sourceName,
      sourceUrl: cfg.sourceUrl,
      accent: cfg.accent,
      current,
      hourly,
      daily,
      fetchedAt: new Date().toISOString(),
    };
  };
}

export const fetchOpenMeteo = makeOpenMeteoFetcher({
  sourceId: "open-meteo",
  sourceName: "Open-Meteo",
  sourceUrl: "https://open-meteo.com/",
  accent: "#60a5fa",
});
