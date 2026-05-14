import { useEffect, useRef, useState } from "react";
import type { Location } from "../types";
import { reverseGeocode, searchLocations } from "../services/geocoding";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
  onSelect: (loc: Location) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounced = useDebounce(query, 300);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    searchLocations(debounced, ctrl.signal)
      .then((r) => {
        setResults(r);
        setOpen(true);
        setActiveIdx(-1);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setResults([]);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [debounced]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(loc: Location) {
    onSelect(loc);
    setQuery(formatLabel(loc));
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !results.length) {
      if (e.key === "Enter" && results[0]) {
        e.preventDefault();
        pick(results[0]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = activeIdx >= 0 ? activeIdx : 0;
      const r = results[idx];
      if (r) pick(r);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setQuery(formatLabel(loc));
          onSelect(loc);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <div className="search-form" ref={wrapRef}>
      <div className="search-input-wrap">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          placeholder="Search a city, region, or place…"
          aria-label="Search location"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={`icon-btn${locating ? " loading" : ""}`}
          aria-label="Use my location"
          title="Use my location"
          onClick={useMyLocation}
          disabled={locating}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>
      {open && (loading || results.length > 0) && (
        <ul className="suggestions" role="listbox">
          {loading && <li className="suggestion muted">Searching…</li>}
          {results.map((r, i) => (
            <li
              key={`${r.latitude}-${r.longitude}-${i}`}
              className={`suggestion${i === activeIdx ? " active" : ""}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(r);
              }}
            >
              <span className="suggestion-name">{r.name}</span>
              <span className="suggestion-meta">
                {[r.admin, r.country].filter(Boolean).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatLabel(loc: Location): string {
  return [loc.name, loc.admin, loc.country].filter(Boolean).join(", ");
}
