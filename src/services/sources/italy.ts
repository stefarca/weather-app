import { makeOpenMeteoFetcher } from "./openMeteo";

// Italy variant prioritizes a European NWP model. DWD ICON-EU (~6.5 km, full
// European coverage including the Alps and the entire Italian peninsula)
// outperforms global GFS over Italy for convective and Alpine forecasts.
export const fetchOpenMeteoItaly = makeOpenMeteoFetcher({
  sourceId: "open-meteo-it",
  sourceName: "Open-Meteo",
  sourceUrl: "https://open-meteo.com/",
  accent: "#22c55e",
  model: "dwd_icon_eu",
});
