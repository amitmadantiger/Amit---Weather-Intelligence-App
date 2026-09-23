import { CityResult, WeatherData, WeatherSettings } from '../types/weather';

export const POPULAR_CITIES: CityResult[] = [
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
  {
    id: 5391959,
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    country: 'United States',
    country_code: 'US',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.8678,
    longitude: 151.2073,
    country: 'Australia',
    country_code: 'AU',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
];

export async function searchCities(query: string): Promise<CityResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding failed with status: ${res.status}`);
    }
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      elevation: r.elevation,
      country_code: r.country_code,
      country: r.country,
      admin1: r.admin1,
      admin2: r.admin2,
      timezone: r.timezone,
      population: r.population,
    }));
  } catch (error) {
    console.error('Error fetching city geocode:', error);
    throw error;
  }
}

export async function fetchWeatherData(
  city: CityResult,
  settings: WeatherSettings
): Promise<WeatherData> {
  const { latitude, longitude } = city;
  const { temperatureUnit, windSpeedUnit, precipitationUnit } = settings;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    precipitation_unit: precipitationUnit,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather forecast request failed with status: ${res.status}`);
  }

  const raw = await res.json();

  // Transform into normalized application model
  const current = {
    time: raw.current.time,
    temperature: Math.round(raw.current.temperature_2m * 10) / 10,
    apparentTemperature: Math.round(raw.current.apparent_temperature * 10) / 10,
    relativeHumidity: Math.round(raw.current.relative_humidity_2m),
    isDay: Boolean(raw.current.is_day),
    precipitation: raw.current.precipitation,
    weatherCode: raw.current.weather_code,
    cloudCover: raw.current.cloud_cover,
    pressureMsl: Math.round(raw.current.pressure_msl),
    windSpeed: Math.round(raw.current.wind_speed_10m * 10) / 10,
    windDirection: raw.current.wind_direction_10m,
    windGusts: Math.round(raw.current.wind_gusts_10m * 10) / 10,
  };

  // Extract next 36 hours for hourly forecasts
  const hourlyCount = Math.min(raw.hourly.time.length, 36);
  const hourly = [];
  for (let i = 0; i < hourlyCount; i++) {
    hourly.push({
      time: raw.hourly.time[i],
      temperature: Math.round(raw.hourly.temperature_2m[i] * 10) / 10,
      humidity: Math.round(raw.hourly.relative_humidity_2m[i]),
      precipitationProbability: raw.hourly.precipitation_probability[i] ?? 0,
      precipitation: raw.hourly.precipitation[i] ?? 0,
      weatherCode: raw.hourly.weather_code[i],
      windSpeed: Math.round(raw.hourly.wind_speed_10m[i] * 10) / 10,
      uvIndex: Math.round((raw.hourly.uv_index[i] ?? 0) * 10) / 10,
    });
  }

  // Daily forecast (7 days)
  const dailyCount = Math.min(raw.daily.time.length, 7);
  const daily = [];
  for (let i = 0; i < dailyCount; i++) {
    daily.push({
      date: raw.daily.time[i],
      weatherCode: raw.daily.weather_code[i],
      temperatureMax: Math.round(raw.daily.temperature_2m_max[i] * 10) / 10,
      temperatureMin: Math.round(raw.daily.temperature_2m_min[i] * 10) / 10,
      apparentTemperatureMax: Math.round(raw.daily.apparent_temperature_max[i] * 10) / 10,
      apparentTemperatureMin: Math.round(raw.daily.apparent_temperature_min[i] * 10) / 10,
      sunrise: raw.daily.sunrise[i],
      sunset: raw.daily.sunset[i],
      uvIndexMax: Math.round((raw.daily.uv_index_max[i] ?? 0) * 10) / 10,
      precipitationSum: Math.round((raw.daily.precipitation_sum[i] ?? 0) * 10) / 10,
      precipitationProbabilityMax: raw.daily.precipitation_probability_max[i] ?? 0,
      windSpeedMax: Math.round(raw.daily.wind_speed_10m_max[i] * 10) / 10,
    });
  }

  return {
    city,
    timezone: raw.timezone,
    utcOffsetSeconds: raw.utc_offset_seconds,
    current,
    hourly,
    daily,
    units: {
      temperature: raw.current_units?.temperature_2m || (temperatureUnit === 'celsius' ? '°C' : '°F'),
      windSpeed: raw.current_units?.wind_speed_10m || (windSpeedUnit === 'kmh' ? 'km/h' : 'mph'),
      precipitation: raw.current_units?.precipitation || (precipitationUnit === 'mm' ? 'mm' : 'in'),
    },
    fetchedAt: new Date().toISOString(),
  };
}

// Reverse Geocoding fallback using BigDataCloud free client-side or simple coordinates resolution
export async function getCityFromCoordinates(lat: number, lon: number): Promise<CityResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Current Location';
      return {
        id: Math.round(lat * 1000 + lon * 1000),
        name,
        latitude: lat,
        longitude: lon,
        country: data.address?.country || '',
        country_code: (data.address?.country_code || '').toUpperCase(),
        admin1: data.address?.state || data.address?.region || '',
      };
    }
  } catch {
    // If reverse geocoding is blocked by CORS/network, return coordinates format
  }

  return {
    id: Math.round(lat * 1000 + lon * 1000),
    name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    latitude: lat,
    longitude: lon,
    country: 'Detected Location',
  };
}
