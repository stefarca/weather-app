import type { CountryId } from "../types";
import { COUNTRIES } from "../types";

interface CountrySelectorProps {
  value: CountryId;
  onChange: (c: CountryId) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  return (
    <div className="country-selector" role="group" aria-label="Region">
      <span className="sources-label">Region</span>
      <div className="country-pills">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`country-pill${value === c.id ? " active" : ""}`}
            onClick={() => onChange(c.id)}
            aria-pressed={value === c.id}
          >
            <span className="country-flag" aria-hidden="true">
              {c.flag}
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
