import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { LeaderboardEntry } from '../types';

export default function LeaderboardPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getLeaderboard(token ?? undefined)
      .then((data) => setEntries(data))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load leaderboard');
      });
  }, [token]);

  return (
    <section>
      <h2>Leaderboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        {entries.length === 0 ? (
          <p>No leaderboard data yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Weekly Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={`${entry.username}-${index}`}>
                  <td>{entry.rank ?? index + 1}</td>
                  <td>{entry.username}</td>
                  <td>{entry.weeklyScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
