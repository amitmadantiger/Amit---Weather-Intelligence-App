import React, { useState } from 'react';
import {
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WeatherData, DailyForecastItem } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface SevenDayForecastProps {
  data: WeatherData;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ data }) => {
  const { daily, units, timezone } = data;
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Overall min and max of the entire week for proportional temperature bar
  const weekMins = daily.map((d) => d.temperatureMin);
  const weekMaxs = daily.map((d) => d.temperatureMax);
  const globalMin = Math.min(...weekMins);
  const globalMax = Math.max(...weekMaxs);
  const globalRange = Math.max(1, globalMax - globalMin);

  const formatDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

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

  const toggleExpand = (date: string) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">7-Day Meteorological Outlook</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily temperature spectrum, precipitation volume, and sunlight cycles
          </p>
        </div>
      </div>

      {/* Daily Rows */}
      <div className="mt-4 space-y-2">
        {daily.map((day: DailyForecastItem, idx: number) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          const isExpanded = expandedDay === day.date;

          // Compute left offset and width for the temperature range bar
          const leftPct = Math.round(((day.temperatureMin - globalMin) / globalRange) * 100);
          const widthPct = Math.max(
            8,
            Math.round(((day.temperatureMax - day.temperatureMin) / globalRange) * 100)
          );

          return (
            <div
              key={day.date}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-slate-700 bg-slate-800/60'
                  : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40'
              }`}
            >
              <button
                onClick={() => toggleExpand(day.date)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left focus:outline-none"
              >
                {/* Day & Date */}
                <div className="w-24 sm:w-28 shrink-0">
                  <div className="text-sm font-semibold text-white">
                    {formatDayName(day.date, idx)}
                  </div>
                  <div className="text-xs text-slate-400">{formatDateLabel(day.date)}</div>
                </div>

                {/* Weather Condition Icon & Label */}
                <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-300">
                    <WeatherIcon name={condition.icon} size={18} />
                  </div>
                  <span className="text-xs text-slate-300 truncate">{condition.label}</span>
                </div>

                {/* Rain Probability */}
                <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-mono text-cyan-400 tabular-nums">
                  <Droplets size={12} className="shrink-0" />
                  <span>{day.precipitationProbabilityMax}%</span>
                </div>

                {/* Relative Temperature Range Bar */}
                <div className="hidden sm:flex flex-1 items-center gap-3 px-2">
                  <span className="w-9 text-right font-mono text-xs text-cyan-300 tabular-nums">
                    {day.temperatureMin}°
                  </span>
                  <div className="relative h-2 flex-1 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                    />
                  </div>
                  <span className="w-9 text-left font-mono text-xs text-rose-300 tabular-nums">
                    {day.temperatureMax}°
                  </span>
                </div>

                {/* Mobile Fallback Min/Max */}
                <div className="flex sm:hidden items-center gap-2 text-xs font-mono tabular-nums">
                  <span className="text-cyan-300">{day.temperatureMin}°</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-300">{day.temperatureMax}°</span>
                </div>

                {/* Expand Chevron */}
                <div className="text-slate-500 pl-1">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 px-4 py-3 bg-slate-950/60 rounded-b-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sunrise size={15} className="text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[11px] text-slate-400">Sunrise</div>
                        <div className="font-mono tabular-nums">{formatSunTime(day.sunrise)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Sunset size={15} className="text-orange-400 shrink-0" />
                      <div>
                        <div className="text-[11px] text-slate-400">Sunset</div>
                        <div className="font-mono tabular-nums">{formatSunTime(day.sunset)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Sun size={15} className="text-yellow-400 shrink-0" />
                      <div>
                        <div className="text-[11px] text-slate-400">Peak UV Index</div>
                        <div className="font-mono tabular-nums">{day.uvIndexMax}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Wind size={15} className="text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-[11px] text-slate-400">Max Gust / Wind</div>
                        <div className="font-mono tabular-nums">
                          {day.windSpeedMax} {units.windSpeed}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs text-slate-400">
                    <div>
                      Expected precipitation volume:{' '}
                      <span className="font-mono font-medium text-white tabular-nums">
                        {day.precipitationSum} {units.precipitation}
                      </span>
                    </div>
                    <div>
                      Feels like:{' '}
                      <span className="font-mono text-slate-300 tabular-nums">
                        {day.apparentTemperatureMin}° – {day.apparentTemperatureMax}°
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
