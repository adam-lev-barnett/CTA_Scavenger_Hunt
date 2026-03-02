import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { StampBookEntry } from '../types';

const EMOJIS = ['🏛️','🌉','🎭','🌆','🎨','🌿','🎪','🏙️','⚡','🚂','🦅','🌊','🗺️','🔮','🎯'];

function fmtDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StampBookPage() {
  const { token, userId } = useAuth();
  const [entries, setEntries] = useState<StampBookEntry[]>([]);
  const [err,     setErr]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setErr('No user ID'); setLoading(false); return; }
    api.getStampBook(userId, token ?? undefined)
      .then(setEntries)
      .catch(e => setErr(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token, userId]);

  const visitedCount = entries.filter(e => e.visited).length;
  const total        = entries.length;
  const pct          = total ? Math.round((visitedCount / total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Stamp Book</h1>
          <p className="text-sm text-zinc-500 mt-1">Your collection of visited Chicago spots</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <span className="font-display text-3xl font-bold text-white">{visitedCount}</span>
            <span className="text-zinc-600 text-lg font-medium">/{total}</span>
            <p className="text-xs text-zinc-600 mt-0.5">collected</p>
          </div>
        )}
      </div>

      {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{err}</p>}

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-xs text-zinc-600 mb-2">
            <span>{pct}% complete</span>
            <span>{total - visitedCount} remaining</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cta-blue rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 rounded-full border-2 border-cta-blue border-t-transparent animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="text-3xl mb-3">📖</p>
          <p className="text-zinc-500 text-sm">Start exploring to collect stamps</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {entries.map((entry, i) => {
            const id        = entry.pointOfInterest?.id ?? entry.id;
            const name      = entry.pointOfInterest?.name ?? entry.pointOfInterest?.pointName ?? `Location ${id}`;
            const isVisited = !!entry.visited;
            const emoji     = EMOJIS[id % EMOJIS.length];
            const date      = fmtDate(entry.visitedAt);

            return (
              <div
                key={entry.id}
                title={isVisited && date ? `Visited ${date}` : name}
                className={[
                  'flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all duration-200 animate-fade-up',
                  isVisited
                    ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                    : 'bg-zinc-900/40 border-zinc-800/60 opacity-50',
                ].join(' ')}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className={[
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2',
                  isVisited ? 'border-cta-blue/30 bg-cta-blue/8' : 'border-zinc-700 grayscale',
                ].join(' ')}>
                  {isVisited ? emoji : '🔒'}
                </div>

                <span className={[
                  'text-[11px] font-medium leading-tight line-clamp-2',
                  isVisited ? 'text-zinc-300' : 'text-zinc-600',
                ].join(' ')}>
                  {name}
                </span>

                {isVisited && date && (
                  <span className="text-[10px] text-zinc-600">{date}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
