import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, History, Globe2 } from 'lucide-react';
import { CityResult } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/openMeteo';

interface SearchBarProps {
  onSelectCity: (city: CityResult) => void;
  currentCityName?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectCity, currentCityName }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentCities, setRecentCities] = useState<CityResult[]>(() => {
    try {
      const stored = localStorage.getItem('wi_recent_cities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search via Open-Meteo Geocoding API
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed);
        setResults(data);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Failed to search cities', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);

    // Save to recents
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('wi_recent_cities', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-cyan-400" />
          ) : (
            <Search size={18} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any city or region (e.g. Kyoto, Seattle, Munich)..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 shadow-lg shadow-black/20 focus:border-cyan-500/60 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500/60 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 tracking-wider">
                MATCHING CITIES (OPEN-METEO)
              </div>
              {results.map((city, idx) => {
                const isSelected = idx === selectedIndex;
                const locationContext = [city.admin1, city.country].filter(Boolean).join(', ');

                return (
                  <button
                    key={`${city.id}-${idx}`}
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected ? 'bg-cyan-500/15 text-white' : 'text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <MapPin size={16} className={isSelected ? 'text-cyan-400 shrink-0' : 'text-slate-500 shrink-0'} />
                      <div className="truncate">
                        <span className="font-medium text-white">{city.name}</span>
                        {locationContext && (
                          <span className="ml-2 text-xs text-slate-400 truncate">{locationContext}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs font-mono text-slate-500 tabular-nums">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No matching locations found for "{query}".
            </div>
          ) : (
            <div className="space-y-3 p-2">
              {recentCities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400">
                    <History size={12} />
                    <span>Recent Searches</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {recentCities.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(c)}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
                      >
                        {c.name}
                        {c.country_code ? `, ${c.country_code}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400">
                  <Globe2 size={12} />
                  <span>Popular Global Destinations</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c)}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        c.name.toLowerCase() === currentCityName?.toLowerCase()
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
