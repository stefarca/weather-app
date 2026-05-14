import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { SourceToggles } from "./components/SourceToggles";
import { CountrySelector } from "./components/CountrySelector";
import { WeatherCard } from "./components/WeatherCard";
import { SOURCE_FETCHERS } from "./services/sources";
import type {
  CountryId,
  Location,
  SourceForecast,
  SourceId,
  TempUnit,
} from "./types";
import { SOURCES } from "./types";

type CardState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: SourceForecast };

function sourcesForCountry(country: CountryId) {
  return SOURCES.filter((s) => s.country === country);
}

export default function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [country, setCountry] = useState<CountryId>("global");
  const [enabled, setEnabled] = useState<Set<SourceId>>(
    () => new Set(sourcesForCountry("global").map((s) => s.id))
  );
  const [unit, setUnit] = useState<TempUnit>("c");
  const [cards, setCards] = useState<Record<SourceId, CardState | undefined>>(
    {} as Record<SourceId, CardState | undefined>
  );

  const countrySources = useMemo(() => sourcesForCountry(country), [country]);

  useEffect(() => {
    if (!location) return;
    const enabledIds = countrySources
      .map((s) => s.id)
      .filter((id) => enabled.has(id));
    if (!enabledIds.length) {
      setCards({} as Record<SourceId, CardState | undefined>);
      return;
    }

    const ctrl = new AbortController();
    setCards((prev) => {
      const next = { ...prev };
      for (const id of enabledIds) next[id] = { status: "loading" };
      return next;
    });

    for (const id of enabledIds) {
      const fetcher = SOURCE_FETCHERS[id];
      fetcher(location, ctrl.signal)
        .then((data) => {
          setCards((prev) => ({ ...prev, [id]: { status: "ready", data } }));
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setCards((prev) => ({
            ...prev,
            [id]: {
              status: "error",
              error: err instanceof Error ? err.message : String(err),
            },
          }));
        });
    }

    return () => ctrl.abort();
  }, [location, enabled, countrySources]);

  function toggleSource(id: SourceId, on: boolean) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function changeCountry(next: CountryId) {
    if (next === country) return;
    setCountry(next);
    setEnabled(new Set(sourcesForCountry(next).map((s) => s.id)));
  }

  const visibleSources = useMemo(
    () => countrySources.filter((s) => enabled.has(s.id)),
    [countrySources, enabled]
  );

  return (
    <>
      <div className="bg-gradient" aria-hidden="true" />
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>

      <main className="app">
        <header className="hero">
          <h1 className="brand">
            <span className="brand-icon" aria-hidden="true">⛅</span>
            <span>Skycast</span>
          </h1>
          <p className="tagline">
            Compare weather forecasts from multiple trusted sources.
          </p>
        </header>

        <section className="search-panel glass">
          <SearchBar onSelect={setLocation} />
          <CountrySelector value={country} onChange={changeCountry} />
          <SourceToggles
            sources={countrySources}
            enabled={enabled}
            onToggle={toggleSource}
            unit={unit}
            onUnitChange={setUnit}
          />
        </section>

        {location && (
          <section className="location-header">
            <h2>
              {location.name}
              {location.admin ? `, ${location.admin}` : ""}
              {location.country ? `, ${location.country}` : ""}
            </h2>
            <p>
              {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
              {location.timezone ? ` · ${location.timezone}` : ""}
            </p>
          </section>
        )}

        {!location && (
          <section className="empty-state glass">
            <div className="empty-icon" aria-hidden="true">🌍</div>
            <h3>Search a location to begin</h3>
            <p>
              Try "Lisbon", "Tokyo", or use the location button to detect
              where you are.
            </p>
          </section>
        )}

        {location && visibleSources.length === 0 && (
          <section className="empty-state glass">
            <div className="empty-icon" aria-hidden="true">🔌</div>
            <h3>No sources selected</h3>
            <p>Enable at least one source above to see forecasts.</p>
          </section>
        )}

        {location && visibleSources.length > 0 && (
          <section className="results">
            {visibleSources.map((s) => (
              <WeatherCard
                key={s.id}
                source={s}
                unit={unit}
                state={cards[s.id] ?? { status: "loading" }}
              />
            ))}
          </section>
        )}

        <footer className="footer">
          <p>
            Data:{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener">
              Open-Meteo
            </a>{" "}
            ·{" "}
            <a href="https://wttr.in/" target="_blank" rel="noopener">
              wttr.in
            </a>{" "}
            ·{" "}
            <a href="https://api.met.no/" target="_blank" rel="noopener">
              MET Norway
            </a>{" "}
            ·{" "}
            <a href="https://www.arpae.it/" target="_blank" rel="noopener">
              ARPAE
            </a>{" "}
            ·{" "}
            <a href="https://www.dwd.de/" target="_blank" rel="noopener">
              DWD
            </a>{" "}
            ·{" "}
            <a href="https://www.ecmwf.int/" target="_blank" rel="noopener">
              ECMWF
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
