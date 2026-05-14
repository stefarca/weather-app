export type SourceId = "open-meteo" | "wttr" | "met-norway";

export type TempUnit = "c" | "f";

export interface Location {
  name: string;
  admin?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface WeatherCondition {
  /** Short human label, e.g. "Partly cloudy" */
  label: string;
  /** Emoji icon representing the condition */
  icon: string;
}

/** A single hour or day in a forecast series. */
export interface ForecastPoint {
  /** ISO timestamp */
  time: string;
  /** Temperature in Celsius */
  tempC: number;
  condition: WeatherCondition;
  /** Probability of precipitation, 0-100, if available */
  precipProb?: number;
}

export interface CurrentWeather {
  tempC: number;
  feelsLikeC?: number;
  condition: WeatherCondition;
  humidity?: number;
  windKph?: number;
  windDirDeg?: number;
  pressureHpa?: number;
  precipMm?: number;
  uvIndex?: number;
  /** When this observation/forecast point applies */
  observedAt?: string;
}

export interface SourceForecast {
  sourceId: SourceId;
  sourceName: string;
  sourceUrl: string;
  /** Brand color, used as accent in the UI */
  accent: string;
  current: CurrentWeather;
  /** Next ~24h of hourly forecast (may be shorter) */
  hourly: ForecastPoint[];
  /** Next several days of daily summary */
  daily: ForecastPoint[];
  /** Time the data was fetched */
  fetchedAt: string;
}

export interface SourceMeta {
  id: SourceId;
  name: string;
  url: string;
  accent: string;
}

export const SOURCES: readonly SourceMeta[] = [
  {
    id: "open-meteo",
    name: "Open-Meteo",
    url: "https://open-meteo.com/",
    accent: "#60a5fa",
  },
  {
    id: "wttr",
    name: "wttr.in",
    url: "https://wttr.in/",
    accent: "#f472b6",
  },
  {
    id: "met-norway",
    name: "MET Norway",
    url: "https://api.met.no/",
    accent: "#34d399",
  },
] as const;
