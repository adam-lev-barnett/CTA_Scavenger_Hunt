import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { StampBookEntry } from '../types';

export default function StampBookPage() {
  const { token, userId } = useAuth();
  const [entries, setEntries] = useState<StampBookEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID missing from auth context.');
      return;
    }

    api
      .getStampBook(userId, token ?? undefined)
      .then((data) => setEntries(data))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load stamp book');
      });
  }, [token, userId]);

  return (
    <section>
      <h2>Stamp Book</h2>
      {error && <p className="error">{error}</p>}

      <div className="card">
        {entries.length === 0 ? (
          <p>No stamp entries yet.</p>
        ) : (
          <ul className="list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>
                    {entry.pointOfInterest?.name ??
                      entry.pointOfInterest?.pointName ??
                      `POI ${entry.pointOfInterest?.id ?? entry.id}`}
                  </strong>
                  <small>{entry.visitedAt ? `Visited: ${entry.visitedAt}` : 'Not visited yet'}</small>
                </div>
                <span className={entry.visited ? 'badge visited' : 'badge'}>
                  {entry.visited ? 'Visited' : 'Open'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
