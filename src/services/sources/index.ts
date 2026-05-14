import type { Location, SourceForecast, SourceId } from "../../types";
import { fetchOpenMeteo } from "./openMeteo";
import { fetchWttr } from "./wttr";
import { fetchMetNorway } from "./metNorway";

export type SourceFetcher = (
  loc: Location,
  signal?: AbortSignal
) => Promise<SourceForecast>;

export const SOURCE_FETCHERS: Record<SourceId, SourceFetcher> = {
  "open-meteo": fetchOpenMeteo,
  wttr: fetchWttr,
  "met-norway": fetchMetNorway,
};
