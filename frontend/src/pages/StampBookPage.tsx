import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { StampBookEntry } from '../types';
import styles from './stampbook.module.css';

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
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Stamp Book</h1>
          <p className={styles.pageSubtitle}>Your collection of visited Chicago spots</p>
        </div>
        {total > 0 && (
          <div className={styles.counter}>
            <span className={styles.counterNum}>{visitedCount}</span>
            <span className={styles.counterSlash}>/{total}</span>
            <p className={styles.counterLabel}>collected</p>
          </div>
        )}
      </div>

      {err && <p className={styles.errorMsg}>{err}</p>}

      {/* Progress bar */}
      {total > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span>{pct}% complete</span>
            <span>{total - visitedCount} remaining</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyCard}>
          <span className={styles.emptyIcon}>📖</span>
          <p className={styles.emptyText}>Start exploring to collect stamps</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {entries.map((entry, i) => {
            const id        = entry.pointOfInterest?.id ?? entry.id;
            const name      = entry.pointOfInterest?.poiName ?? `Location ${id}`;
            const isVisited = !!entry.visited;
            const emoji     = EMOJIS[id % EMOJIS.length];
            const date      = fmtDate(entry.visitedAt);

            return (
              <div
                key={entry.id}
                title={isVisited && date ? `Visited ${date}` : name}
                className={`${styles.stamp} ${isVisited ? styles.stampVisited : styles.stampUnvisited}`}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className={`${styles.stampCircle} ${isVisited ? styles.stampCircleVisited : styles.stampCircleUnvisited}`}>
                  {isVisited ? emoji : '🔒'}
                </div>

                <span className={`${styles.stampName} ${isVisited ? styles.stampNameVisited : styles.stampNameUnvisited}`}>
                  {name}
                </span>

                {isVisited && date && (
                  <span className={styles.stampDate}>{date}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
