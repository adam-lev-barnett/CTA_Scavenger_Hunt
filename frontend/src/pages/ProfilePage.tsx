import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { Profile } from '../types';

export default function ProfilePage() {
  const { token, userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID missing from auth context.');
      return;
    }

    api
      .getProfile(userId, token ?? undefined)
      .then((data) => {
        setProfile(data);
        setUsername(data.username);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load profile');
      });
  }, [token, userId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userId) {
      setError('User ID missing from auth context.');
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const updated = await api.updateUsername(userId, username, token ?? undefined);
      setProfile(updated);
      setMessage('Username updated.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update username');
    }
  }

  return (
    <section>
      <h2>Profile</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card">
        {profile ? (
          <>
            <p>
              <strong>Hi Score:</strong> {profile.hiScore}
            </p>
            <p>
              <strong>Weekly Score:</strong> {profile.weeklyScore}
            </p>

            <form className="inline-form" onSubmit={onSubmit}>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </section>
  );
}
