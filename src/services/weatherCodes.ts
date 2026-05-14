import type { WeatherCondition } from "../types";

// WMO Weather interpretation codes (used by Open-Meteo).
// https://open-meteo.com/en/docs
const WMO: Record<number, WeatherCondition> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Violent showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { label: "Thunderstorm w/ hail", icon: "⛈️" },
};

export function fromWmoCode(code: number): WeatherCondition {
  return WMO[code] ?? { label: "Unknown", icon: "❓" };
}

// MET Norway symbol_code → label/icon.
// https://api.met.no/weatherapi/weathericon/2.0/documentation
// We strip _day/_night/_polartwilight suffixes.
const MET_SYMBOLS: Record<string, WeatherCondition> = {
  clearsky: { label: "Clear sky", icon: "☀️" },
  fair: { label: "Fair", icon: "🌤️" },
  partlycloudy: { label: "Partly cloudy", icon: "⛅" },
  cloudy: { label: "Cloudy", icon: "☁️" },
  fog: { label: "Fog", icon: "🌫️" },
  lightrainshowers: { label: "Light rain showers", icon: "🌦️" },
  rainshowers: { label: "Rain showers", icon: "🌧️" },
  heavyrainshowers: { label: "Heavy rain showers", icon: "🌧️" },
  lightrainshowersandthunder: { label: "Showers & thunder", icon: "⛈️" },
  rainshowersandthunder: { label: "Showers & thunder", icon: "⛈️" },
  heavyrainshowersandthunder: { label: "Storms", icon: "⛈️" },
  lightrain: { label: "Light rain", icon: "🌦️" },
  rain: { label: "Rain", icon: "🌧️" },
  heavyrain: { label: "Heavy rain", icon: "🌧️" },
  lightrainandthunder: { label: "Rain & thunder", icon: "⛈️" },
  rainandthunder: { label: "Rain & thunder", icon: "⛈️" },
  heavyrainandthunder: { label: "Storms", icon: "⛈️" },
  lightsleet: { label: "Light sleet", icon: "🌨️" },
  sleet: { label: "Sleet", icon: "🌨️" },
  heavysleet: { label: "Heavy sleet", icon: "🌨️" },
  lightsleetshowers: { label: "Sleet showers", icon: "🌨️" },
  sleetshowers: { label: "Sleet showers", icon: "🌨️" },
  heavysleetshowers: { label: "Heavy sleet showers", icon: "🌨️" },
  lightsnow: { label: "Light snow", icon: "🌨️" },
  snow: { label: "Snow", icon: "❄️" },
  heavysnow: { label: "Heavy snow", icon: "❄️" },
  lightsnowshowers: { label: "Snow showers", icon: "🌨️" },
  snowshowers: { label: "Snow showers", icon: "❄️" },
  heavysnowshowers: { label: "Heavy snow showers", icon: "❄️" },
  lightsnowandthunder: { label: "Snow & thunder", icon: "⛈️" },
  snowandthunder: { label: "Snow & thunder", icon: "⛈️" },
  heavysnowandthunder: { label: "Snow & thunder", icon: "⛈️" },
};

export function fromMetSymbol(symbol: string): WeatherCondition {
  const base = symbol.replace(/_(day|night|polartwilight)$/, "");
  return MET_SYMBOLS[base] ?? { label: "Unknown", icon: "❓" };
}

// wttr.in uses WWO condition codes; map a sensible subset.
// https://github.com/chubin/wttr.in/blob/master/share/translations
const WWO: Record<string, WeatherCondition> = {
  "113": { label: "Sunny / Clear", icon: "☀️" },
  "116": { label: "Partly cloudy", icon: "⛅" },
  "119": { label: "Cloudy", icon: "☁️" },
  "122": { label: "Overcast", icon: "☁️" },
  "143": { label: "Mist", icon: "🌫️" },
  "176": { label: "Patchy rain", icon: "🌦️" },
  "179": { label: "Patchy sleet", icon: "🌨️" },
  "182": { label: "Patchy sleet", icon: "🌨️" },
  "185": { label: "Patchy drizzle", icon: "🌦️" },
  "200": { label: "Thundery outbreaks", icon: "⛈️" },
  "227": { label: "Blowing snow", icon: "❄️" },
  "230": { label: "Blizzard", icon: "❄️" },
  "248": { label: "Fog", icon: "🌫️" },
  "260": { label: "Freezing fog", icon: "🌫️" },
  "263": { label: "Patchy light drizzle", icon: "🌦️" },
  "266": { label: "Light drizzle", icon: "🌦️" },
  "281": { label: "Freezing drizzle", icon: "🌧️" },
  "284": { label: "Freezing drizzle", icon: "🌧️" },
  "293": { label: "Patchy light rain", icon: "🌦️" },
  "296": { label: "Light rain", icon: "🌦️" },
  "299": { label: "Moderate rain", icon: "🌧️" },
  "302": { label: "Moderate rain", icon: "🌧️" },
  "305": { label: "Heavy rain", icon: "🌧️" },
  "308": { label: "Heavy rain", icon: "🌧️" },
  "311": { label: "Light freezing rain", icon: "🌧️" },
  "314": { label: "Freezing rain", icon: "🌧️" },
  "317": { label: "Light sleet", icon: "🌨️" },
  "320": { label: "Moderate sleet", icon: "🌨️" },
  "323": { label: "Patchy light snow", icon: "🌨️" },
  "326": { label: "Light snow", icon: "🌨️" },
  "329": { label: "Patchy moderate snow", icon: "🌨️" },
  "332": { label: "Moderate snow", icon: "❄️" },
  "335": { label: "Patchy heavy snow", icon: "❄️" },
  "338": { label: "Heavy snow", icon: "❄️" },
  "350": { label: "Ice pellets", icon: "❄️" },
  "353": { label: "Light rain shower", icon: "🌦️" },
  "356": { label: "Rain shower", icon: "🌧️" },
  "359": { label: "Torrential rain shower", icon: "🌧️" },
  "362": { label: "Light sleet showers", icon: "🌨️" },
  "365": { label: "Moderate sleet showers", icon: "🌨️" },
  "368": { label: "Light snow showers", icon: "🌨️" },
  "371": { label: "Heavy snow showers", icon: "❄️" },
  "374": { label: "Light ice pellets", icon: "❄️" },
  "377": { label: "Ice pellets", icon: "❄️" },
  "386": { label: "Thundery showers", icon: "⛈️" },
  "389": { label: "Thundery heavy rain", icon: "⛈️" },
  "392": { label: "Thundery snow", icon: "⛈️" },
  "395": { label: "Thundery heavy snow", icon: "⛈️" },
};

export function fromWwoCode(code: string | number): WeatherCondition {
  return WWO[String(code)] ?? { label: "Unknown", icon: "❓" };
}
