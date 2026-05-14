import { makeOpenMeteoFetcher } from "./openMeteo";

export const fetchArpaeIcon2I = makeOpenMeteoFetcher({
  sourceId: "arpae-icon-2i",
  sourceName: "ARPAE ICON 2I",
  sourceUrl: "https://www.arpae.it/it/temi-ambientali/meteo",
  accent: "#22c55e",
  model: "italia_meteo_arpae_icon_2i",
});

export const fetchDwdIconEu = makeOpenMeteoFetcher({
  sourceId: "dwd-icon-eu",
  sourceName: "DWD ICON-EU",
  sourceUrl: "https://www.dwd.de/",
  accent: "#fbbf24",
  model: "dwd_icon_eu",
});

export const fetchEcmwfIfs = makeOpenMeteoFetcher({
  sourceId: "ecmwf-ifs",
  sourceName: "ECMWF IFS",
  sourceUrl: "https://www.ecmwf.int/",
  accent: "#ef4444",
  model: "ecmwf_ifs025",
});
