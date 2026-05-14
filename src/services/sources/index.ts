import type { Location, SourceForecast, SourceId } from "../../types";
import { fetchOpenMeteo } from "./openMeteo";
import { fetchWttr } from "./wttr";
import { fetchMetNorway } from "./metNorway";
import { fetchArpaeIcon2I, fetchDwdIconEu, fetchEcmwfIfs } from "./italy";

export type SourceFetcher = (
  loc: Location,
  signal?: AbortSignal
) => Promise<SourceForecast>;

export const SOURCE_FETCHERS: Record<SourceId, SourceFetcher> = {
  "open-meteo": fetchOpenMeteo,
  wttr: fetchWttr,
  "met-norway": fetchMetNorway,
  "arpae-icon-2i": fetchArpaeIcon2I,
  "dwd-icon-eu": fetchDwdIconEu,
  "ecmwf-ifs": fetchEcmwfIfs,
};
