import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Footprints,
  Bike,
  Utensils,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import {
  WeatherData,
  PlanningRecommendation,
  ActivityScore,
  BestOutdoorWindow,
} from '../types/weather';
import {
  generatePlanningRecommendations,
  computeBestOutdoorWindow,
  evaluateActivities,
} from '../utils/weatherIntelligence';
import { WeatherIcon } from './WeatherIcon';

interface IntelligencePanelProps {
  data: WeatherData;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('running');

  const recommendations: PlanningRecommendation[] = generatePlanningRecommendations(data);
  const bestWindow: BestOutdoorWindow | null = computeBestOutdoorWindow(data);
  const activities: ActivityScore[] = evaluateActivities(data);

  const activeActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];

  const filteredRecs =
    selectedCategory === 'all'
      ? recommendations
      : recommendations.filter((r) => r.category === selectedCategory);

  const getStatusIcon = (status: PlanningRecommendation['status']) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'moderate':
        return <ShieldCheck size={16} className="text-sky-400" />;
      case 'caution':
        return <AlertTriangle size={16} className="text-amber-400" />;
      case 'unfavorable':
        return <XCircle size={16} className="text-rose-400" />;
    }
  };

  const getStatusBorder = (status: PlanningRecommendation['status']) => {
    switch (status) {
      case 'optimal':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'moderate':
        return 'border-sky-500/30 bg-sky-500/5';
      case 'caution':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'unfavorable':
        return 'border-rose-500/30 bg-rose-500/5';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* 1. Best Window of the Day Spotlight Card */}
      {bestWindow && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
                <Clock size={14} />
                <span>Prime Weather Window Today</span>
              </div>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                {bestWindow.summary}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">{bestWindow.reason}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div>
                <div className="text-[11px] text-slate-400">Mean Temp</div>
                <div className="font-mono text-base font-bold text-white tabular-nums">
                  {bestWindow.avgTemp}
                  {data.units.temperature}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-[11px] text-slate-400">Rain Chance</div>
                <div className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                  {bestWindow.rainChance}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Planning Guide Recommendations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Actionable Planning Intelligence</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted advice for outdoor workouts, commute safety, wardrobe, and wellness
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 p-1 text-xs">
            {[
              { id: 'all', label: 'All Guidance' },
              { id: 'outdoors', label: 'Outdoors' },
              { id: 'commute', label: 'Commute' },
              { id: 'clothing', label: 'Wardrobe' },
              { id: 'comfort', label: 'Wellness' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition-all ${getStatusBorder(rec.status)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300">
                    <WeatherIcon name={rec.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                    {/* Zero-Pill Metadata Discipline: Clean unboxed metadata with separators */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize">{rec.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.badge}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">{getStatusIcon(rec.status)}</div>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">{rec.summary}</p>

              {/* Action takeaway box */}
              <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs text-slate-200">
                <span className="font-semibold text-cyan-400">Action: </span>
                {rec.action}
              </div>

              {/* Highlights */}
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                {rec.highlights.map((hl, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>{hl}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Activity Suitability Analyzer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-white">Activity Suitability Analyzer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an activity to test against today's rain probability, temperatures, winds, and UV
          </p>
        </div>

        {/* Activity Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {activities.map((act) => {
            const isSelected = act.id === selectedActivityId;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedActivityId(act.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-white shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <WeatherIcon name={act.icon} size={15} />
                <span>{act.name}</span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  ({act.score}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Evaluation Card for Active Activity */}
        <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/50 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-cyan-400">
                <WeatherIcon name={activeActivity.icon} size={22} />
              </div>
              <div>
                <div className="text-base font-bold text-white">{activeActivity.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Best Window:{' '}
                  <span className="font-mono text-cyan-300">{activeActivity.bestWindow}</span>
                </div>
              </div>
            </div>

            {/* Score & Verdict */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Suitability</div>
                <div className="text-sm font-semibold text-white">{activeActivity.verdict}</div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border font-mono text-lg font-bold tabular-nums ${getScoreColor(
                  activeActivity.score
                )}`}
              >
                {activeActivity.score}
              </div>
            </div>
          </div>

          {/* Advice */}
          <p className="mt-4 text-xs sm:text-sm text-slate-200">{activeActivity.advice}</p>

          {/* Factors Breakdown */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {Object.entries(activeActivity.factors).map(([factorKey, factor]) => {
              const label =
                factorKey === 'temp'
                  ? 'Temperature'
                  : factorKey === 'rain'
                  ? 'Precipitation'
                  : factorKey === 'wind'
                  ? 'Wind & Gusts'
                  : 'UV Index';

              const badgeColor =
                factor.status === 'good'
                  ? 'text-emerald-400'
                  : factor.status === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400';

              return (
                <div
                  key={factorKey}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-2.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-semibold capitalize ${badgeColor}`}>
                      {factor.status === 'good' ? 'Pass' : factor.status === 'warning' ? 'Watch' : 'Risk'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-300 truncate" title={factor.note}>
                    {factor.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
