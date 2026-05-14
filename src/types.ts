export type SourceId =
  | "open-meteo"
  | "wttr"
  | "met-norway"
  | "open-meteo-it"
  | "meteoblue"
  | "openweather";

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
    id: "open-meteo-it",
    name: "Open-Meteo",
    url: "https://open-meteo.com/",
    accent: "#22c55e",
    country: "italy",
    blurb:
      "DWD ICON-EU + MeteoFrance AROME — Alpine terrain, local convective storms.",
  },
  {
    id: "meteoblue",
    name: "Meteoblue",
    url: "https://www.meteoblue.com/",
    accent: "#fbbf24",
    country: "italy",
    blurb:
      "NEMS / mB MULTIMODEL — hyper-local microclimates (coastal & mountainous).",
  },
  {
    id: "openweather",
    name: "OpenWeather",
    url: "https://openweathermap.org/",
    accent: "#ef4444",
    country: "italy",
    blurb:
      "ECMWF-driven — pre-translated Italian descriptions for mobile apps.",
  },
] as const;
