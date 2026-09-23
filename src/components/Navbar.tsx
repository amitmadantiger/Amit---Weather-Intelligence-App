import React from 'react';
import { Bookmark, RefreshCw, MapPin } from 'lucide-react';
import { WeatherSettings } from '../types/weather';

interface NavbarProps {
  settings: WeatherSettings;
  onUpdateSettings: (newSettings: Partial<WeatherSettings>) => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  activeSection,
  onSelectSection,
  savedCount,
  onOpenSavedModal,
  onRefresh,
  isLoading,
  onDetectLocation,
  isDetectingLocation,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('overview');
            }}
            className="text-base font-semibold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            Weather Intelligence
          </a>
        </div>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectSection('overview')}
            className={`transition-colors hover:text-white ${
              activeSection === 'overview' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Current & Forecast
          </button>
          <button
            onClick={() => onSelectSection('intelligence')}
            className={`transition-colors hover:text-white ${
              activeSection === 'intelligence' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Planning Guide
          </button>
          <button
            onClick={() => onSelectSection('activities')}
            className={`transition-colors hover:text-white ${
              activeSection === 'activities' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Activity Analyzer
          </button>
        </nav>

        {/* Zone 3: Primary actions & unit toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Geolocation Button */}
          <button
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            title="Use current geolocation"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <MapPin size={14} className={isDetectingLocation ? 'animate-pulse text-cyan-400' : ''} />
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Saved Cities Button */}
          <button
            onClick={onOpenSavedModal}
            title="Saved locations"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <Bookmark size={14} className={savedCount > 0 ? 'text-amber-400 fill-amber-400/20' : ''} />
            <span className="tabular-nums font-mono">{savedCount}</span>
          </button>

          {/* Unit Toggle Segmented Control */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
            <button
              onClick={() => onUpdateSettings({ temperatureUnit: 'celsius' })}
              className={`rounded-md px-2 py-1 font-mono font-medium transition-colors ${
                settings.temperatureUnit === 'celsius'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onUpdateSettings({ temperatureUnit: 'fahrenheit' })}
              className={`rounded-md px-2 py-1 font-mono font-medium transition-colors ${
                settings.temperatureUnit === 'fahrenheit'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh current forecast"
            className="rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 text-slate-300 hover:border-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};
