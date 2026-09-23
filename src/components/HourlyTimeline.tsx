import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Wind } from 'lucide-react';
import { WeatherData } from '../types/weather';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface HourlyTimelineProps {
  data: WeatherData;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ data }) => {
  const { hourly, units, timezone } = data;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Take the next 24 hours
  const hours24 = hourly.slice(0, 24);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Min and max temperature in next 24h for vertical proportional scaling
  const temps = hours24.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const formatHour = (isoString: string, idx: number) => {
    if (idx === 0) return 'Now';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString.split('T')[1]?.slice(0, 5) || isoString;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">24-Hour Forecast Timeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly temperature progression, precipitation risk, and wind
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            title="Scroll earlier"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            title="Scroll later"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="mt-4 flex gap-2.5 overflow-x-auto pb-3 pt-1 scroll-smooth focus:outline-none"
      >
        {hours24.map((item, idx) => {
          // Determine if day or night roughly based on hour
          const date = new Date(item.time);
          const hourNum = date.getHours();
          const isDay = hourNum >= 6 && hourNum < 20;
          const condition = getWeatherCondition(item.weatherCode, isDay);

          // Height percentage of temperature bar relative to 24h range
          const barHeightPct = Math.round(((item.temperature - minTemp) / tempRange) * 50) + 20;

          return (
            <div
              key={item.time}
              className={`flex flex-col items-center justify-between rounded-xl border p-3 min-w-[84px] sm:min-w-[92px] transition-all hover:bg-slate-800/80 ${
                idx === 0
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : 'border-slate-800/80 bg-slate-950/40'
              }`}
            >
              {/* Hour */}
              <span className="text-xs font-medium text-slate-300">
                {formatHour(item.time, idx)}
              </span>

              {/* Weather Icon */}
              <div className="my-2.5 flex h-8 w-8 items-center justify-center text-slate-200">
                <WeatherIcon name={condition.icon} size={22} />
              </div>

              {/* Temperature */}
              <div className="font-mono text-sm font-bold text-white tabular-nums">
                {item.temperature}°
              </div>

              {/* Relative Visual Temperature Pill Bar */}
              <div className="my-2 h-10 w-2 rounded-full bg-slate-800/70 flex flex-col justify-end overflow-hidden">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-cyan-500 to-amber-400"
                  style={{ height: `${barHeightPct}%` }}
                />
              </div>

              {/* Rain Probability */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 tabular-nums">
                <Droplets size={11} className="shrink-0" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Wind Speed */}
              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-slate-500 tabular-nums">
                <Wind size={10} className="shrink-0" />
                <span>{item.windSpeed}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
