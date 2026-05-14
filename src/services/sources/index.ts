import type { Location, SourceForecast, SourceId } from "../../types";
import { fetchOpenMeteo } from "./openMeteo";
import { fetchWttr } from "./wttr";
import { fetchMetNorway } from "./metNorway";
import { fetchOpenMeteoItaly } from "./italy";
import { fetchMeteoblue } from "./meteoblue";
import { fetchOpenWeather } from "./openWeather";

export type SourceFetcher = (
  loc: Location,
  signal?: AbortSignal
) => Promise<SourceForecast>;

export const SOURCE_FETCHERS: Record<SourceId, SourceFetcher> = {
  "open-meteo": fetchOpenMeteo,
  wttr: fetchWttr,
  "met-norway": fetchMetNorway,
  "open-meteo-it": fetchOpenMeteoItaly,
  meteoblue: fetchMeteoblue,
  openweather: fetchOpenWeather,
};
