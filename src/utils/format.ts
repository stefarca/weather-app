import type { TempUnit } from "../types";

export function cToUnit(c: number, unit: TempUnit): number {
  return unit === "f" ? c * 9 / 5 + 32 : c;
}

export function formatTemp(c: number, unit: TempUnit, digits = 0): string {
  if (Number.isNaN(c)) return "—";
  const v = cToUnit(c, unit);
  return `${v.toFixed(digits)}°${unit.toUpperCase()}`;
}

export function formatHour(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(undefined, { hour: "numeric" });
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function formatWindDir(deg?: number): string {
  if (deg == null || Number.isNaN(deg)) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx] ?? "";
}
