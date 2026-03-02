import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { LeaderboardEntry } from '../types';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { token }  = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [err,     setErr]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard(token ?? undefined)
      .then(setEntries)
      .catch(e => setErr(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);

  const maxScore = entries[0]?.weeklyScore ?? 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-up">

      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Rankings</h1>
        <p className="text-sm text-zinc-500 mt-1">This week's top Chicago explorers</p>
      </div>

      {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{err}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 rounded-full border-2 border-cta-blue border-t-transparent animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">No scores yet — be the first!</p>
        </div>
      ) : (
        <>
          {/* Top 3 */}
          {entries.length >= 2 && (
            <div className="grid grid-cols-3 gap-3 items-end">
              {/* 2nd */}
              {entries[1] && (
                <div className="card px-4 py-5 flex flex-col items-center gap-1 text-center" style={{ animationDelay: '60ms' }}>
                  <span className="text-2xl">{MEDAL[1]}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mt-1">#2</span>
                  <span className="font-display font-semibold text-sm text-white truncate w-full">{entries[1].username}</span>
                  <span className="font-display font-bold text-lg text-zinc-300">{entries[1].weeklyScore.toLocaleString()}</span>
                </div>
              )}
              {/* 1st — taller */}
              {entries[0] && (
                <div className="card px-4 py-7 flex flex-col items-center gap-1 text-center border-cta-blue/25 bg-cta-blue/5" style={{ animationDelay: '0ms' }}>
                  <span className="text-3xl">{MEDAL[0]}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-1">#1</span>
                  <span className="font-display font-semibold text-sm text-white truncate w-full">{entries[0].username}</span>
                  <span className="font-display font-bold text-2xl text-cta-blue">{entries[0].weeklyScore.toLocaleString()}</span>
                </div>
              )}
              {/* 3rd */}
              {entries[2] && (
                <div className="card px-4 py-5 flex flex-col items-center gap-1 text-center" style={{ animationDelay: '120ms' }}>
                  <span className="text-2xl">{MEDAL[2]}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mt-1">#3</span>
                  <span className="font-display font-semibold text-sm text-white truncate w-full">{entries[2].username}</span>
                  <span className="font-display font-bold text-lg text-zinc-300">{entries[2].weeklyScore.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Rest of the list */}
          {entries.length > 3 && (
            <div className="card divide-y divide-white/[0.04]">
              {entries.slice(3).map((e, i) => {
                const rank = e.rank ?? i + 4;
                const pct  = Math.round((e.weeklyScore / maxScore) * 100);
                return (
                  <div key={`${e.username}-${i}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <span className="font-display font-bold text-sm text-zinc-600 w-6 shrink-0">#{rank}</span>
                    <span className="font-medium text-sm text-zinc-300 flex-1">{e.username}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-cta-blue/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-display font-semibold text-sm text-white tabular-nums">{e.weeklyScore.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
