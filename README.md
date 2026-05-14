# Skycast

A modern, multi-source weather app. Search any location and compare forecasts side-by-side from:

- **[Open-Meteo](https://open-meteo.com/)** — open weather forecast API
- **[wttr.in](https://wttr.in/)** — console-friendly weather service (JSON mode)
- **[MET Norway](https://api.met.no/)** — Norwegian Meteorological Institute

All three are free and require no API key.

## Stack

- Vite + React 18 + TypeScript
- Plain CSS (glassmorphism, no UI library)
- Deployed as a static site to GitHub Pages via GitHub Actions

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
npm run preview
```

## Deploy

The included workflow at `.github/workflows/deploy.yml` builds and publishes
the site to GitHub Pages on every push to `main`.

To enable it:

1. Push the project to GitHub.
2. In the repo settings, go to **Pages → Build and deployment → Source** and
   choose **GitHub Actions**.
3. The next push to `main` will publish the site to
   `https://<your-user>.github.io/<repo-name>/`.

The base path for the build is set automatically from `GITHUB_REPOSITORY` in
`vite.config.ts`, so no manual configuration is needed.

## Project layout

```
src/
  components/        UI components (SearchBar, SourceToggles, WeatherCard)
  services/
    geocoding.ts     Open-Meteo geocoding (forward + reverse)
    weatherCodes.ts  Code-to-icon/label maps (WMO, MET, WWO)
    sources/         One module per weather provider
  hooks/             useDebounce
  utils/format.ts    Temperature / time / wind formatting
  types.ts           Shared types and source registry
  App.tsx            Top-level component and orchestration
  main.tsx           Entry point
  styles.css         All styling
```

## Adding a new source

1. Create `src/services/sources/<name>.ts` exporting an async function with the
   signature `(loc: Location, signal?: AbortSignal) => Promise<SourceForecast>`.
2. Add an entry to `SOURCES` in `src/types.ts` and to `SOURCE_FETCHERS` in
   `src/services/sources/index.ts`.

The UI will pick it up automatically (toggle pill + result card).
