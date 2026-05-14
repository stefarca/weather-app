import type {
  CurrentWeather,
  ForecastPoint,
  Location,
  SourceForecast,
  WeatherCondition,
} from "../../types";

// Meteoblue "pictocode" → label/icon. Pictocodes 1–17 cover day variants;
// night variants share the same code with `isdaylight=0`. We use a single map
// keyed by code since the labels are time-of-day-agnostic.
// https://content.meteoblue.com/en/specifications/standards/symbols-and-pictograms
const PICTO: Record<number, WeatherCondition> = {
  1: { label: "Clear sky", icon: "☀️" },
  2: { label: "Mostly clear", icon: "🌤️" },
  3: { label: "Partly cloudy", icon: "⛅" },
  4: { label: "Overcast", icon: "☁️" },
  5: { label: "Fog", icon: "🌫️" },
  6: { label: "Overcast w/ rain", icon: "🌧️" },
  7: { label: "Mixed rain & snow", icon: "🌨️" },
  8: { label: "Overcast w/ snow", icon: "🌨️" },
  9: { label: "Rain showers", icon: "🌦️" },
  10: { label: "Rain & snow showers", icon: "🌨️" },
  11: { label: "Snow showers", icon: "🌨️" },
  12: { label: "Light rain", icon: "🌦️" },
  13: { label: "Light snow", icon: "🌨️" },
  14: { label: "Partly cloudy w/ showers", icon: "🌦️" },
  15: { label: "Thunderstorm", icon: "⛈️" },
  16: { label: "Partly cloudy w/ snow", icon: "🌨️" },
  17: { label: "Cloudy w/ thunderstorm", icon: "⛈️" },
};

function fromPictocode(code: number | undefined): WeatherCondition {
  if (code == null) return { label: "Unknown", icon: "❓" };
  return PICTO[code] ?? { label: "Unknown", icon: "❓" };
}

interface MeteoblueResponse {
  metadata?: { timezone_abbrevation?: string };
  data_current?: {
    time?: string;
    temperature?: number;
    felttemperature?: number;
    relativehumidity?: number;
    windspeed?: number; // m/s
    winddirection?: number;
    sealevelpressure?: number;
    precipitation?: number;
    pictocode?: number;
  };
  data_1h?: {
    time: string[];
    temperature: number[];
    pictocode: number[];
    precipitation_probability?: number[];
  };
  data_day?: {
    time: string[];
    temperature_max: number[];
    temperature_min: number[];
    pictocode: number[];
    precipitation_probability?: number[];
  };
}

export async function fetchMeteoblue(
  loc: Location,
  signal?: AbortSignal
): Promise<SourceForecast> {
  const apiKey = import.meta.env.VITE_METEOBLUE_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error(
      "Meteoblue: missing API key (set VITE_METEOBLUE_API_KEY in .env)"
    );
  }

  const url = new URL("https://my.meteoblue.com/packages/basic-1h_basic-day");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("lat", loc.latitude.toFixed(4));
  url.searchParams.set("lon", loc.longitude.toFixed(4));
  url.searchParams.set("format", "json");
  url.searchParams.set("temperature", "C");
  url.searchParams.set("windspeed", "ms-1");
  url.searchParams.set("timeformat", "iso8601");
  url.searchParams.set("tz", "auto");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Meteoblue HTTP ${res.status}`);
  const data: MeteoblueResponse = await res.json();

  const cur = data.data_current;
  const firstHour = data.data_1h?.time?.[0];
  const firstHourTemp = data.data_1h?.temperature?.[0];
  const firstHourCode = data.data_1h?.pictocode?.[0];

  // Meteoblue free packages do not always include `data_current`; fall back to
  // the first hourly entry so we still render something useful.
  const current: CurrentWeather = cur
    ? {
        tempC: cur.temperature ?? Number.NaN,
        feelsLikeC: cur.felttemperature,
        humidity: cur.relativehumidity,
        condition: fromPictocode(cur.pictocode),
        windKph:
          cur.windspeed != null
            ? Math.round(cur.windspeed * 3.6 * 10) / 10
            : undefined,
        windDirDeg: cur.winddirection,
        pressureHpa: cur.sealevelpressure,
        precipMm: cur.precipitation,
        observedAt: cur.time,
      }
    : {
        tempC: firstHourTemp ?? Number.NaN,
        condition: fromPictocode(firstHourCode),
        observedAt: firstHour,
      };

  const hourly: ForecastPoint[] = [];
  if (data.data_1h) {
    const now = Date.now();
    const len = data.data_1h.time.length;
    for (let i = 0; i < len; i++) {
      const t = data.data_1h.time[i]!;
      const dt = new Date(t).getTime();
      if (dt < now - 60 * 60 * 1000) continue;
      const temp = data.data_1h.temperature[i];
      const code = data.data_1h.pictocode[i];
      if (temp == null || code == null) continue;
      hourly.push({
        time: t,
        tempC: temp,
        condition: fromPictocode(code),
        precipProb: data.data_1h.precipitation_probability?.[i],
      });
      if (hourly.length >= 24) break;
    }
  }

  const daily: ForecastPoint[] = [];
  if (data.data_day) {
    const len = data.data_day.time.length;
    for (let i = 0; i < len; i++) {
      const max = data.data_day.temperature_max[i];
      const min = data.data_day.temperature_min[i];
      const code = data.data_day.pictocode[i];
      if (max == null || min == null || code == null) continue;
      daily.push({
        time: data.data_day.time[i]!,
        tempC: (max + min) / 2,
        condition: fromPictocode(code),
        precipProb: data.data_day.precipitation_probability?.[i],
      });
    }
  }

  return {
    sourceId: "meteoblue",
    sourceName: "Meteoblue",
    sourceUrl: "https://www.meteoblue.com/",
    accent: "#fbbf24",
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
