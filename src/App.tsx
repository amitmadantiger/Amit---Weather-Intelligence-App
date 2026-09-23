/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CityResult,
  WeatherData,
  WeatherSettings,
} from './types/weather';
import {
  fetchWeatherData,
  POPULAR_CITIES,
  getCityFromCoordinates,
} from './services/openMeteo';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyTimeline } from './components/HourlyTimeline';
import { SevenDayForecast } from './components/SevenDayForecast';
import { IntelligencePanel } from './components/IntelligencePanel';
import { SavedCitiesModal } from './components/SavedCitiesModal';
import { Loader2, AlertCircle, RefreshCw, Sparkles, MapPin } from 'lucide-react';

export default function App() {
  // Saved settings in localStorage
  const [settings, setSettings] = useState<WeatherSettings>(() => {
    try {
      const saved = localStorage.getItem('wi_settings');
      return saved
        ? JSON.parse(saved)
        : { temperatureUnit: 'celsius', windSpeedUnit: 'kmh', precipitationUnit: 'mm' };
    } catch {
      return { temperatureUnit: 'celsius', windSpeedUnit: 'kmh', precipitationUnit: 'mm' };
    }
  });

  // Saved bookmark cities
  const [savedCities, setSavedCities] = useState<CityResult[]>(() => {
    try {
      const saved = localStorage.getItem('wi_saved_cities');
      return saved ? JSON.parse(saved) : [POPULAR_CITIES[0], POPULAR_CITIES[1]];
    } catch {
      return [POPULAR_CITIES[0], POPULAR_CITIES[1]];
    }
  });

  // Current active city
  const [currentCity, setCurrentCity] = useState<CityResult>(() => {
    try {
      const saved = localStorage.getItem('wi_last_city');
      return saved ? JSON.parse(saved) : POPULAR_CITIES[0]; // New York
    } catch {
      return POPULAR_CITIES[0];
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const overviewRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  // Save settings when changed
  const updateSettings = (newSettings: Partial<WeatherSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('wi_settings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Toggle saving current city
  const toggleSaveCity = (city: CityResult) => {
    setSavedCities((prev) => {
      const exists = prev.some((c) => c.id === city.id);
      let updated: CityResult[];
      if (exists) {
        updated = prev.filter((c) => c.id !== city.id);
      } else {
        updated = [...prev, city];
      }
      try {
        localStorage.setItem('wi_saved_cities', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Load weather for city
  const loadWeather = useCallback(
    async (city: CityResult) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherData(city, settings);
        setWeatherData(data);
        setCurrentCity(city);
        try {
          localStorage.setItem('wi_last_city', JSON.stringify(city));
        } catch (e) {
          console.error(e);
        }
      } catch (err: any) {
        console.error('Failed to load weather data:', err);
        setError(err?.message || 'Could not fetch weather data from Open-Meteo. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [settings]
  );

  // Fetch when currentCity or unit settings change
  useEffect(() => {
    loadWeather(currentCity);
  }, [currentCity.id, settings.temperatureUnit, settings.windSpeedUnit, settings.precipitationUnit]);

  // Handle section scrolling
  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    if (section === 'overview') {
      overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'intelligence') {
      intelligenceRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'activities') {
      activitiesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const detectedCity = await getCityFromCoordinates(latitude, longitude);
          loadWeather(detectedCity);
        } catch (err) {
          console.error('Failed to resolve coordinates', err);
          const fallbackCity: CityResult = {
            id: Math.round(latitude * 1000 + longitude * 1000),
            name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            latitude,
            longitude,
            country: 'My Location',
          };
          loadWeather(fallbackCity);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsDetectingLocation(false);
        setError('Location permission denied or unavailable. Please search manually.');
      },
      { timeout: 8000 }
    );
  };

  const isCurrentCitySaved = savedCities.some((c) => c.id === currentCity.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        settings={settings}
        onUpdateSettings={updateSettings}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        savedCount={savedCities.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onRefresh={() => loadWeather(currentCity)}
        isLoading={isLoading}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
      />

      {/* Main Content Viewport */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Search & Quick City Discovery Section */}
        <section className="space-y-4">
          <SearchBar
            onSelectCity={(city) => loadWeather(city)}
            currentCityName={currentCity.name}
          />
        </section>

        {/* Error Alert State */}
        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadWeather(currentCity)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-1 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton View */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 size={36} className="animate-spin text-cyan-400" />
            <p className="text-sm font-medium">Fetching real-time weather from Open-Meteo...</p>
          </div>
        )}

        {/* Populated State */}
        {weatherData && (
          <div className="space-y-6">
            {/* 1. Overview & Current Conditions */}
            <div ref={overviewRef} className="space-y-6">
              <CurrentWeather
                data={weatherData}
                isSaved={isCurrentCitySaved}
                onToggleSave={() => toggleSaveCity(currentCity)}
              />

              {/* 24-Hour Hourly Timeline */}
              <HourlyTimeline data={weatherData} />

              {/* 7-Day Meteorological Forecast */}
              <SevenDayForecast data={weatherData} />
            </div>

            {/* 2. Weather Intelligence & Planning Engine */}
            <div ref={intelligenceRef} className="pt-2">
              <div ref={activitiesRef}>
                <IntelligencePanel data={weatherData} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Saved Cities Modal */}
      <SavedCitiesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedCities={savedCities}
        onSelectCity={(city) => loadWeather(city)}
        onRemoveCity={(id) => {
          const updated = savedCities.filter((c) => c.id !== id);
          setSavedCities(updated);
          localStorage.setItem('wi_saved_cities', JSON.stringify(updated));
        }}
        currentCityId={currentCity.id}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Weather Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Accurate meteorological data powered by Open-Meteo</span>
          </div>
          <div className="text-slate-500">
            Open-Meteo Geocoding & Forecast APIs
          </div>
        </div>
      </footer>
    </div>
  );
}
