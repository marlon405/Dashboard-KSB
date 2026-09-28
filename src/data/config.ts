export const FIRE_CSV_URL =
  "https://raw.githubusercontent.com/Berliner-Feuerwehr/BF-Open-Data/main/Datasets/Daily_Data/BFw_mission_data_daily.csv";
export const FIRE_REPO_URL = "https://github.com/Berliner-Feuerwehr/BF-Open-Data";
export const WATER_STATION_UUID = "47d3e815-c556-4e1b-93de-9fe07329fb00";
export const WATER_STATION_NAME = "BERLIN-KÖPENICK";
export const WATER_BASE_URL = `https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/${WATER_STATION_UUID}`;
// Open-Meteo docs' Berlin example uses 52.52 N, 13.41 E.
export const WEATHER_REFERENCE = "Berlin (52,52° N, 13,41° E)";
export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max&timezone=Europe%2FBerlin&forecast_days=8";
export const REQUEST_TIMEOUT_MS = 15_000;
export const REFRESH_MS = { fire: 60 * 60_000, water: 15 * 60_000, weather: 60 * 60_000 };
export const WATER_STALE_MS = 60 * 60_000;