import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Gauge,
  Cloud,
  Compass,
  Bookmark,
  BookmarkCheck,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  data,
  isSaved,
  onToggleSave,
}) => {
  const { current, daily, city, units, timezone } = data;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const todayDaily = daily[0];

  // Format local time for the city's timezone
  let localTimeString = '';
  try {
    localTimeString = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    localTimeString = new Date().toLocaleString();
  }

  // UV index category
  const getUvCategory = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-400' };
    return { label: 'Extreme', color: 'text-purple-400' };
  };

  const uvCat = getUvCategory(todayDaily?.uvIndexMax ?? 0);

  // Daylight progress calculation
  const sunriseTime = todayDaily?.sunrise ? new Date(todayDaily.sunrise).getTime() : 0;
  const sunsetTime = todayDaily?.sunset ? new Date(todayDaily.sunset).getTime() : 0;
  const nowTime = new Date().getTime();
  let daylightPercent = 0;
  if (sunsetTime > sunriseTime) {
    daylightPercent = Math.min(
      100,
      Math.max(0, Math.round(((nowTime - sunriseTime) / (sunsetTime - sunriseTime)) * 100))
    );
  }

  const formatSunTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString.split('T')[1]?.slice(0, 5) || isoString;
    }
  };

  // Humidity comfort interpretation
  const getHumidityLabel = (hum: number) => {
    if (hum < 30) return 'Dry air';
    if (hum <= 60) return 'Comfortable';
    if (hum <= 75) return 'Moderate humidity';
    return 'Humid / muggy';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Dynamic atmospheric ambient glow */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full blur-3xl opacity-40 bg-gradient-to-br ${condition.bgGradient}`}
      />

      {/* Header Row: City, Time, and Save action */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {city.name}
            </h1>
            <button
              onClick={onToggleSave}
              title={isSaved ? 'Remove from saved cities' : 'Save this city'}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck size={20} className="text-amber-400 fill-amber-400/20" />
              ) : (
                <Bookmark size={20} />
              )}
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{[city.admin1, city.country].filter(Boolean).join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{localTimeString}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500">
              {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
            </span>
          </div>
        </div>

        {/* Condition Badge */}
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${condition.badgeClass}`}
        >
          <WeatherIcon name={condition.icon} size={16} />
          <span>{condition.label}</span>
        </div>
      </div>

      {/* Main Temperature and Visual Overview */}
      <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Big Hero Temperature */}
        <div className="md:col-span-6 flex items-baseline gap-4">
          <div className="font-mono text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white tabular-nums">
            {current.temperature}
            <span className="text-3xl sm:text-4xl lg:text-5xl font-normal text-slate-400">
              {units.temperature}
            </span>
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-slate-300">
              Feels like{' '}
              <span className="font-mono font-semibold text-white tabular-nums">
                {current.apparentTemperature}
                {units.temperature}
              </span>
            </div>
            {todayDaily && (
              <div className="flex items-center gap-3 font-mono text-xs text-slate-400 tabular-nums">
                <span className="flex items-center gap-0.5 text-rose-300">
                  <ArrowUp size={13} />
                  {todayDaily.temperatureMax}
                  {units.temperature}
                </span>
                <span className="flex items-center gap-0.5 text-cyan-300">
                  <ArrowDown size={13} />
                  {todayDaily.temperatureMin}
                  {units.temperature}
                </span>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-2 max-w-xs">{condition.description}</div>
          </div>
        </div>

        {/* Right: Sunlight progression & Quick Daylight widget */}
        <div className="md:col-span-6 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sunrise size={14} className="text-amber-400" />
              <span>Sunrise: {formatSunTime(todayDaily?.sunrise)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sunset size={14} className="text-orange-400" />
              <span>Sunset: {formatSunTime(todayDaily?.sunset)}</span>
            </div>
          </div>

          {/* Daylight progress bar */}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${daylightPercent}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-mono text-slate-500">
              <span>Dawn</span>
              <span className="text-slate-400">{current.isDay ? 'Daylight Active' : 'Night Sky'}</span>
              <span>Dusk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Telemetry Grid */}
      <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Wind & Direction */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Wind</span>
            <Wind size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {current.windSpeed}{' '}
            <span className="text-xs font-normal text-slate-400">{units.windSpeed}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <Compass
              size={12}
              style={{ transform: `rotate(${current.windDirection}deg)` }}
              className="text-cyan-400 transition-transform duration-500"
            />
            <span>Gusts {current.windGusts}</span>
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Humidity</span>
            <Droplets size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {current.relativeHumidity}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {getHumidityLabel(current.relativeHumidity)}
          </div>
        </div>

        {/* 3. UV Index */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">UV Index</span>
            <Sun size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {todayDaily?.uvIndexMax ?? 0}
          </div>
          <div className={`mt-1 text-[11px] font-medium ${uvCat.color}`}>{uvCat.label}</div>
        </div>

        {/* 4. Barometric Pressure */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pressure</span>
            <Gauge size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {current.pressureMsl}{' '}
            <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Mean Sea Level</div>
        </div>

        {/* 5. Cloud Cover */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cloud Cover</span>
            <Cloud size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {current.cloudCover}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Sky coverage</div>
        </div>

        {/* 6. Precipitation */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Precipitation</span>
            <Droplets size={15} />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-white tabular-nums">
            {current.precipitation}{' '}
            <span className="text-xs font-normal text-slate-400">{units.precipitation}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {todayDaily ? `Today: ${todayDaily.precipitationSum} ${units.precipitation}` : 'Current rate'}
          </div>
        </div>
      </div>
    </div>
  );
};
