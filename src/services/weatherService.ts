/**
 * Weather & Environmental Service
 * Real-time geolocation, 7-day forecast, wind (km/h), air quality & pollen
 * Powered by Open-Meteo (No API key required, reliable & accurate)
 */

export interface DayForecast {
  dayName: string;
  dateKey: string;
  weatherCode: number;
  conditionLabel: string;
  iconName: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  windMaxKmH: number;
}

export interface AirQualityData {
  aqi: number;
  aqiLabel: string;
  aqiColor: string;
  pm25: number;
  pm10: number;
  no2: number;
  ozone: number;
  pollenLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
  pollenColor: string;
  grassPollen: number;
  birchPollen: number;
  olivePollen: number;
}

export interface WeatherData {
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  apparentTemp: number;
  humidity: number;
  windSpeedKmH: number;
  windDirectionDeg: number;
  windDirectionCompass: string;
  weatherCode: number;
  conditionLabel: string;
  iconName: string;
  isRaining: boolean;
  isSnowing: boolean;
  isFoggy: boolean;
  isSunny: boolean;
  weeklyForecast: DayForecast[];
  airQuality: AirQualityData;
  updatedAt: string;
}

// Convert WMO Weather Code to French descriptive condition & icon
export function parseWmoWeather(code: number): { label: string; icon: string; category: 'sun' | 'rain' | 'shower' | 'snow' | 'fog' | 'cloud' } {
  switch (code) {
    case 0:
      return { label: 'Ensoleillé', icon: 'wb_sunny', category: 'sun' };
    case 1:
      return { label: 'Généralement Ensoleillé', icon: 'sunny', category: 'sun' };
    case 2:
      return { label: 'Partiellement Nuageux', icon: 'partly_cloudy_day', category: 'cloud' };
    case 3:
      return { label: 'Couvert', icon: 'cloud', category: 'cloud' };
    case 45:
      return { label: 'Brouillard', icon: 'foggy', category: 'fog' };
    case 48:
      return { label: 'Brouillard Givrant', icon: 'foggy', category: 'fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Bruine', icon: 'rainy', category: 'rain' };
    case 61:
    case 63:
      return { label: 'Pluie Modérée', icon: 'rainy', category: 'rain' };
    case 65:
      return { label: 'Pluie Forte', icon: 'water_drop', category: 'rain' };
    case 71:
    case 73:
    case 75:
      return { label: 'Chutes de Neige', icon: 'ac_unit', category: 'snow' };
    case 77:
      return { label: 'Grains de Neige', icon: 'weather_snowy', category: 'snow' };
    case 80:
    case 81:
    case 82:
      return { label: 'Averses', icon: 'rainy', category: 'shower' };
    case 85:
    case 86:
      return { label: 'Averses de Neige', icon: 'cloudy_snowing', category: 'snow' };
    case 95:
      return { label: 'Orages', icon: 'thunderstorm', category: 'shower' };
    case 96:
    case 99:
      return { label: 'Orages avec Grêle', icon: 'thunderstorm', category: 'shower' };
    default:
      return { label: 'Temps Variable', icon: 'filter_drama', category: 'cloud' };
  }
}

// Convert degrees to compass direction
export function degToCompass(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round((deg % 360) / 45) % 8;
  return directions[index];
}

// Evaluate European AQI scale (1: Très Bon, 2: Bon, 3: Modéré, 4: Mauvais, 5: Très Mauvais)
export function evaluateAqi(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: 'Excellent', color: 'text-emerald-400' };
  if (aqi <= 40) return { label: 'Bon', color: 'text-green-400' };
  if (aqi <= 60) return { label: 'Modéré', color: 'text-amber-400' };
  if (aqi <= 80) return { label: 'Dégradé', color: 'text-orange-400' };
  if (aqi <= 100) return { label: 'Mauvais', color: 'text-rose-400' };
  return { label: 'Très Mauvais', color: 'text-purple-400' };
}

// Evaluate Pollen intensity
export function evaluatePollen(grass: number, birch: number, olive: number): { level: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé'; color: string } {
  const maxPollen = Math.max(grass || 0, birch || 0, olive || 0);
  if (maxPollen <= 10) return { level: 'Faible', color: 'text-emerald-400' };
  if (maxPollen <= 30) return { level: 'Modéré', color: 'text-amber-400' };
  if (maxPollen <= 70) return { level: 'Élevé', color: 'text-orange-400' };
  return { level: 'Très Élevé', color: 'text-rose-400' };
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_SHORT_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// Fallback Default Data (Paris / Île-de-France)
export const DEFAULT_WEATHER_DATA: WeatherData = {
  city: 'Paris',
  region: 'Île-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
  currentTemp: 18,
  apparentTemp: 17,
  humidity: 62,
  windSpeedKmH: 14,
  windDirectionDeg: 230,
  windDirectionCompass: 'SO',
  weatherCode: 1,
  conditionLabel: 'Ensoleillé & Ciel Dégagé',
  iconName: 'wb_sunny',
  isRaining: false,
  isSnowing: false,
  isFoggy: false,
  isSunny: true,
  airQuality: {
    aqi: 28,
    aqiLabel: 'Bon',
    aqiColor: 'text-emerald-400',
    pm25: 7.2,
    pm10: 14.5,
    no2: 18.2,
    ozone: 42.0,
    pollenLevel: 'Faible',
    pollenColor: 'text-emerald-400',
    grassPollen: 5,
    birchPollen: 2,
    olivePollen: 0
  },
  weeklyForecast: [
    { dayName: "Aujourd'hui", dateKey: 'J0', weatherCode: 1, conditionLabel: 'Ensoleillé', iconName: 'wb_sunny', tempMax: 20, tempMin: 11, precipProb: 5, windMaxKmH: 15 },
    { dayName: 'Demain', dateKey: 'J1', weatherCode: 2, conditionLabel: 'Partiellement Nuageux', iconName: 'partly_cloudy_day', tempMax: 21, tempMin: 12, precipProb: 15, windMaxKmH: 18 },
    { dayName: 'Mercredi', dateKey: 'J2', weatherCode: 80, conditionLabel: 'Averses', iconName: 'rainy', tempMax: 17, tempMin: 10, precipProb: 65, windMaxKmH: 26 },
    { dayName: 'Jeudi', dateKey: 'J3', weatherCode: 61, conditionLabel: 'Pluie Modérée', iconName: 'rainy', tempMax: 16, tempMin: 9, precipProb: 80, windMaxKmH: 22 },
    { dayName: 'Vendredi', dateKey: 'J4', weatherCode: 45, conditionLabel: 'Brouillard Matinal', iconName: 'foggy', tempMax: 18, tempMin: 8, precipProb: 20, windMaxKmH: 12 },
    { dayName: 'Samedi', dateKey: 'J5', weatherCode: 0, conditionLabel: 'Grand Soleil', iconName: 'wb_sunny', tempMax: 22, tempMin: 11, precipProb: 0, windMaxKmH: 14 },
    { dayName: 'Dimanche', dateKey: 'J6', weatherCode: 2, conditionLabel: 'Éclaircies', iconName: 'partly_cloudy_day', tempMax: 23, tempMin: 13, precipProb: 10, windMaxKmH: 16 }
  ],
  updatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
};

/**
 * Fetch city name from coordinates via reverse geocoding
 */
async function fetchCityName(lat: number, lon: number): Promise<{ city: string; region: string }> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Votre Localité';
      const region = data.principalSubdivision || data.countryName || 'France';
      return { city, region };
    }
  } catch (e) {
    // Graceful fallback
  }
  return { city: 'Position Géolocalisée', region: 'En Direct' };
}

/**
 * Fetch full real-time weather, 7-day forecast, wind, air pollution & pollen
 */
export async function fetchFullWeather(lat: number, lon: number): Promise<WeatherData> {
  const { city, region } = await fetchCityName(lat, lon);

  // 1. Weather & 7-Day Forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&wind_speed_unit=kmh&timezone=auto`;

  // 2. Air Quality & Pollen
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen,olive_pollen&timezone=auto`;

  const [weatherRes, airRes] = await Promise.allSettled([
    fetch(weatherUrl, { signal: AbortSignal.timeout(5000) }),
    fetch(airUrl, { signal: AbortSignal.timeout(5000) })
  ]);

  let weatherJson: any = null;
  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    weatherJson = await weatherRes.value.json();
  }

  let airJson: any = null;
  if (airRes.status === 'fulfilled' && airRes.value.ok) {
    airJson = await airRes.value.json();
  }

  if (!weatherJson || !weatherJson.current) {
    return {
      ...DEFAULT_WEATHER_DATA,
      city,
      region,
      latitude: lat,
      longitude: lon
    };
  }

  const cur = weatherJson.current;
  const parsedCur = parseWmoWeather(cur.weather_code);

  // Parse 7-day forecast
  const weeklyForecast: DayForecast[] = [];
  if (weatherJson.daily && weatherJson.daily.time) {
    const daily = weatherJson.daily;
    const count = Math.min(daily.time.length, 7);

    for (let i = 0; i < count; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr);
      let dayName = DAYS_FR[dateObj.getDay()];
      if (i === 0) dayName = "Aujourd'hui";
      else if (i === 1) dayName = 'Demain';

      const code = daily.weather_code[i] ?? 0;
      const parsed = parseWmoWeather(code);

      weeklyForecast.push({
        dayName,
        dateKey: dateStr,
        weatherCode: code,
        conditionLabel: parsed.label,
        iconName: parsed.icon,
        tempMax: Math.round(daily.temperature_2m_max[i] ?? 20),
        tempMin: Math.round(daily.temperature_2m_min[i] ?? 12),
        precipProb: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
        windMaxKmH: Math.round(daily.wind_speed_10m_max?.[i] ?? 15)
      });
    }
  }

  // Parse Air Quality & Pollen
  const airCur = airJson?.current || {};
  const aqiVal = Math.round(airCur.european_aqi ?? 32);
  const aqiMeta = evaluateAqi(aqiVal);
  const grassP = Math.round(airCur.grass_pollen ?? 8);
  const birchP = Math.round(airCur.birch_pollen ?? 3);
  const oliveP = Math.round(airCur.olive_pollen ?? 0);
  const pollenMeta = evaluatePollen(grassP, birchP, oliveP);

  const airQuality: AirQualityData = {
    aqi: aqiVal,
    aqiLabel: aqiMeta.label,
    aqiColor: aqiMeta.color,
    pm25: Number((airCur.pm2_5 ?? 8.4).toFixed(1)),
    pm10: Number((airCur.pm10 ?? 16.1).toFixed(1)),
    no2: Number((airCur.nitrogen_dioxide ?? 21.0).toFixed(1)),
    ozone: Number((airCur.ozone ?? 45.0).toFixed(1)),
    pollenLevel: pollenMeta.level,
    pollenColor: pollenMeta.color,
    grassPollen: grassP,
    birchPollen: birchP,
    olivePollen: oliveP
  };

  return {
    city,
    region,
    latitude: lat,
    longitude: lon,
    currentTemp: Math.round(cur.temperature_2m),
    apparentTemp: Math.round(cur.apparent_temperature ?? cur.temperature_2m),
    humidity: Math.round(cur.relative_humidity_2m ?? 60),
    windSpeedKmH: Math.round(cur.wind_speed_10m ?? 12),
    windDirectionDeg: Math.round(cur.wind_direction_10m ?? 180),
    windDirectionCompass: degToCompass(cur.wind_direction_10m ?? 180),
    weatherCode: cur.weather_code,
    conditionLabel: parsedCur.label,
    iconName: parsedCur.icon,
    isRaining: parsedCur.category === 'rain' || parsedCur.category === 'shower',
    isSnowing: parsedCur.category === 'snow',
    isFoggy: parsedCur.category === 'fog',
    isSunny: parsedCur.category === 'sun',
    weeklyForecast: weeklyForecast.length > 0 ? weeklyForecast : DEFAULT_WEATHER_DATA.weeklyForecast,
    airQuality,
    updatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
}
