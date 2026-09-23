import React from 'react';
import { X, Trash2, MapPin, Bookmark } from 'lucide-react';
import { CityResult } from '../types/weather';

interface SavedCitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCities: CityResult[];
  onSelectCity: (city: CityResult) => void;
  onRemoveCity: (cityId: number) => void;
  currentCityId?: number;
}

export const SavedCitiesModal: React.FC<SavedCitiesModalProps> = ({
  isOpen,
  onClose,
  savedCities,
  onSelectCity,
  onRemoveCity,
  currentCityId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Saved Locations</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
          {savedCities.length > 0 ? (
            savedCities.map((city) => {
              const isCurrent = city.id === currentCityId;
              const locationContext = [city.admin1, city.country].filter(Boolean).join(', ');

              return (
                <div
                  key={city.id}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                    isCurrent
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="flex flex-1 items-center gap-3 text-left overflow-hidden"
                  >
                    <MapPin
                      size={16}
                      className={isCurrent ? 'text-cyan-400 shrink-0' : 'text-slate-500 shrink-0'}
                    />
                    <div className="truncate">
                      <div className="font-semibold text-white text-sm truncate">{city.name}</div>
                      <div className="text-xs text-slate-400 truncate">{locationContext}</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onRemoveCity(city.id)}
                    title="Remove from saved"
                    className="ml-2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <Bookmark size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">No saved locations yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Click the bookmark icon on any city forecast to save it for quick reference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
