import type { SourceId, TempUnit } from "../types";
import { SOURCES } from "../types";

interface SourceTogglesProps {
  enabled: Set<SourceId>;
  onToggle: (id: SourceId, enabled: boolean) => void;
  unit: TempUnit;
  onUnitChange: (u: TempUnit) => void;
}

export function SourceToggles({
  enabled,
  onToggle,
  unit,
  onUnitChange,
}: SourceTogglesProps) {
  return (
    <div className="sources">
      <span className="sources-label">Sources</span>
      <div className="source-toggles">
        {SOURCES.map((s) => {
          const checked = enabled.has(s.id);
          return (
            <label
              key={s.id}
              className={`toggle${checked ? " checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(s.id, e.target.checked)}
              />
              <span className="toggle-pill">
                <span className="dot" style={{ background: s.accent }} />
                {s.name}
              </span>
            </label>
          );
        })}
      </div>
      <div className="unit-toggle" role="group" aria-label="Temperature unit">
        <button
          type="button"
          className={`unit-btn${unit === "c" ? " active" : ""}`}
          onClick={() => onUnitChange("c")}
        >
          °C
        </button>
        <button
          type="button"
          className={`unit-btn${unit === "f" ? " active" : ""}`}
          onClick={() => onUnitChange("f")}
        >
          °F
        </button>
      </div>
    </div>
  );
}
