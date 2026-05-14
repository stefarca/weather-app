export type SourceId =
  | "open-meteo"
  | "wttr"
  | "met-norway"
  | "arpae-icon-2i"
  | "dwd-icon-eu"
  | "ecmwf-ifs";

export type CountryId = "global" | "italy";

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
  country: CountryId;
  /** Short blurb shown as tooltip / aria description */
  blurb?: string;
}

export interface CountryMeta {
  id: CountryId;
  label: string;
  flag: string;
}

export const COUNTRIES: readonly CountryMeta[] = [
  { id: "global", label: "Global", flag: "🌍" },
  { id: "italy", label: "Italy", flag: "🇮🇹" },
] as const;

export const SOURCES: readonly SourceMeta[] = [
  {
    id: "open-meteo",
    name: "Open-Meteo",
    url: "https://open-meteo.com/",
    accent: "#60a5fa",
    country: "global",
    blurb: "Aggregated multi-model forecast.",
  },
  {
    id: "wttr",
    name: "wttr.in",
    url: "https://wttr.in/",
    accent: "#f472b6",
    country: "global",
    blurb: "Console-friendly weather service.",
  },
  {
    id: "met-norway",
    name: "MET Norway",
    url: "https://api.met.no/",
    accent: "#34d399",
    country: "global",
    blurb: "Norwegian Meteorological Institute.",
  },
  {
    id: "arpae-icon-2i",
    name: "ARPAE ICON 2I",
    url: "https://www.arpae.it/it/temi-ambientali/meteo",
    accent: "#22c55e",
    country: "italy",
    blurb: "Italian high-resolution model (ARPAE Emilia-Romagna).",
  },
  {
    id: "dwd-icon-eu",
    name: "DWD ICON-EU",
    url: "https://www.dwd.de/",
    accent: "#fbbf24",
    country: "italy",
    blurb: "European model from Deutscher Wetterdienst.",
  },
  {
    id: "ecmwf-ifs",
    name: "ECMWF IFS",
    url: "https://www.ecmwf.int/",
    accent: "#ef4444",
    country: "italy",
    blurb: "European Centre for Medium-Range Weather Forecasts.",
  },
] as const;
