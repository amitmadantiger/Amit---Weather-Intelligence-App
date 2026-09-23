export interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type PrecipitationUnit = 'mm' | 'inch';

export interface WeatherSettings {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  precipitationUnit: PrecipitationUnit;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  pressureMsl: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface WeatherData {
  city: CityResult;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  units: {
    temperature: string;
    windSpeed: string;
    precipitation: string;
  };
  fetchedAt: string;
}

export type RecommendationLevel = 'optimal' | 'moderate' | 'caution' | 'unfavorable';

export interface PlanningRecommendation {
  id: string;
  category: 'outdoors' | 'commute' | 'clothing' | 'comfort' | 'planner';
  title: string;
  status: RecommendationLevel;
  badge: string;
  summary: string;
  action: string;
  highlights: string[];
  icon: string;
}

export interface ActivityScore {
  id: string;
  name: string;
  icon: string;
  score: number; // 0-100
  verdict: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  bestWindow: string;
  advice: string;
  factors: {
    temp: { status: 'good' | 'warning' | 'bad'; note: string };
    rain: { status: 'good' | 'warning' | 'bad'; note: string };
    wind: { status: 'good' | 'warning' | 'bad'; note: string };
    uv: { status: 'good' | 'warning' | 'bad'; note: string };
  };
}

export interface BestOutdoorWindow {
  startTime: string;
  endTime: string;
  summary: string;
  avgTemp: number;
  rainChance: number;
  reason: string;
}
