import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { LeaderboardEntry } from '../types';
import styles from './LeaderboardPage.module.css';

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
    <div className={styles.page}>

      <div>
        <h1 className={styles.pageTitle}>Rankings</h1>
        <p className={styles.pageSubtitle}>This week's top Chicago explorers</p>
      </div>

      {err && <p className={styles.errorMsg}>{err}</p>}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>No scores yet — be the first!</p>
        </div>
      ) : (
        <>
          {/* Top 3 */}
          {entries.length >= 2 && (
            <div className={styles.top3Grid}>
              {/* 2nd */}
              {entries[1] && (
                <div className={styles.podiumCard} style={{ animationDelay: '60ms' }}>
                  <span className={styles.podiumMedal}>{MEDAL[1]}</span>
                  <span className={styles.podiumRank}>#2</span>
                  <span className={styles.podiumName}>{entries[1].username}</span>
                  <span className={styles.podiumScore}>{entries[1].weeklyScore.toLocaleString()}</span>
                </div>
              )}
              {/* 1st — taller */}
              {entries[0] && (
                <div className={`${styles.podiumCard} ${styles.podiumCard1st}`} style={{ animationDelay: '0ms' }}>
                  <span className={styles.podiumMedal1st}>{MEDAL[0]}</span>
                  <span className={`${styles.podiumRank} ${styles.podiumRank1st}`}>#1</span>
                  <span className={styles.podiumName}>{entries[0].username}</span>
                  <span className={`${styles.podiumScore} ${styles.podiumScore1st}`}>{entries[0].weeklyScore.toLocaleString()}</span>
                </div>
              )}
              {/* 3rd */}
              {entries[2] && (
                <div className={styles.podiumCard} style={{ animationDelay: '120ms' }}>
                  <span className={styles.podiumMedal}>{MEDAL[2]}</span>
                  <span className={styles.podiumRank}>#3</span>
                  <span className={styles.podiumName}>{entries[2].username}</span>
                  <span className={styles.podiumScore}>{entries[2].weeklyScore.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Rest of the list */}
          {entries.length > 3 && (
            <div className={styles.restList}>
              {entries.slice(3).map((e, i) => {
                const rank = e.rank ?? i + 4;
                const pct  = Math.round((e.weeklyScore / maxScore) * 100);
                return (
                  <div key={`${e.username}-${i}`} className={styles.restRow}>
                    <span className={styles.restRank}>#{rank}</span>
                    <span className={styles.restName}>{e.username}</span>
                    <div className={styles.restRight}>
                      <div className={styles.scoreBarWrapper}>
                        <div className={styles.scoreBarFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.restScore}>{e.weeklyScore.toLocaleString()}</span>
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
