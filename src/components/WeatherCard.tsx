import type { SourceForecast, SourceMeta, TempUnit } from "../types";
import {
  formatDay,
  formatHour,
  formatTemp,
  formatWindDir,
} from "../utils/format";

interface WeatherCardProps {
  source: SourceMeta;
  unit: TempUnit;
  state:
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "ready"; data: SourceForecast };
}

export function WeatherCard({ source, unit, state }: WeatherCardProps) {
  return (
    <article
      className="card glass"
      style={{ ["--accent" as string]: source.accent }}
    >
      <header className="card-header">
        <span className="card-source">
          <span className="dot" style={{ background: source.accent }} />
          <a href={source.url} target="_blank" rel="noopener">
            {source.name}
          </a>
        </span>
        {state.status === "ready" && (
          <span className="card-fetched">
            updated {new Date(state.data.fetchedAt).toLocaleTimeString()}
          </span>
        )}
      </header>

      {state.status === "loading" && (
        <div className="card-body">
          <div className="skeleton skeleton-temp" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-row" />
        </div>
      )}

      {state.status === "error" && (
        <div className="card-body card-error">
          <div className="card-error-icon">⚠️</div>
          <p>Couldn't load this source.</p>
          <p className="error-detail">{state.error}</p>
        </div>
      )}

      {state.status === "ready" && (
        <div className="card-body">
          <div className="current">
            <div className="current-icon" aria-hidden="true">
              {state.data.current.condition.icon}
            </div>
            <div className="current-main">
              <div className="current-temp">
                {formatTemp(state.data.current.tempC, unit)}
              </div>
              <div className="current-label">
                {state.data.current.condition.label}
              </div>
              {state.data.current.feelsLikeC != null && (
                <div className="current-feels">
                  Feels like {formatTemp(state.data.current.feelsLikeC, unit)}
                </div>
              )}
            </div>
          </div>

          <div className="stats">
            {state.data.current.humidity != null && (
              <Stat label="Humidity" value={`${Math.round(state.data.current.humidity)}%`} />
            )}
            {state.data.current.windKph != null && (
              <Stat
                label="Wind"
                value={`${Math.round(state.data.current.windKph)} km/h ${formatWindDir(state.data.current.windDirDeg)}`}
              />
            )}
            {state.data.current.precipMm != null && (
              <Stat
                label="Precip"
                value={`${state.data.current.precipMm.toFixed(1)} mm`}
              />
            )}
            {state.data.current.pressureHpa != null && (
              <Stat
                label="Pressure"
                value={`${Math.round(state.data.current.pressureHpa)} hPa`}
              />
            )}
            {state.data.current.uvIndex != null &&
              !Number.isNaN(state.data.current.uvIndex) && (
                <Stat label="UV" value={state.data.current.uvIndex.toFixed(0)} />
              )}
          </div>

          {state.data.hourly.length > 0 && (
            <div className="strip">
              <div className="strip-title">Next hours</div>
              <div className="strip-row">
                {state.data.hourly.slice(0, 12).map((h) => (
                  <div className="strip-item" key={h.time}>
                    <div className="strip-time">{formatHour(h.time)}</div>
                    <div className="strip-icon" aria-hidden="true">
                      {h.condition.icon}
                    </div>
                    <div className="strip-temp">
                      {formatTemp(h.tempC, unit)}
                    </div>
                    {h.precipProb != null && h.precipProb > 0 && (
                      <div className="strip-precip">
                        💧 {Math.round(h.precipProb)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.data.daily.length > 0 && (
            <div className="strip">
              <div className="strip-title">Next days</div>
              <div className="strip-row">
                {state.data.daily.slice(0, 7).map((d) => (
                  <div className="strip-item" key={d.time}>
                    <div className="strip-time">{formatDay(d.time)}</div>
                    <div className="strip-icon" aria-hidden="true">
                      {d.condition.icon}
                    </div>
                    <div className="strip-temp">
                      {formatTemp(d.tempC, unit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
