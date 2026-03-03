import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { Profile } from '../types';
import styles from './ProfilePage.module.css';

function initials(name: string) {
  return name.split(/[\s_-]/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('');
}

export default function ProfilePage() {
  const { token, userId } = useAuth();
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [err,      setErr]      = useState<string | null>(null);
  const [msg,      setMsg]      = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!userId) { setErr('No user ID'); return; }
    api.getProfile(userId, token ?? undefined)
      .then(d => { setProfile(d); setUsername(d.username); })
      .catch(e => setErr(e instanceof Error ? e.message : 'Failed to load profile'));
  }, [token, userId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setErr(null); setMsg(null); setSaving(true);
    try {
      const updated = await api.updateUsername(userId, username, token ?? undefined);
      setProfile(updated);
      setMsg('Username updated');
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className={styles.loadingScreen}>
        {err
          ? <p className={styles.loadingError}>{err}</p>
          : <div className={styles.spinner} />
        }
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>Your explorer identity and scores</p>
      </div>

      {/* Identity card */}
      <div className={styles.identityCard}>
        <div className={styles.avatar}>{initials(profile.username)}</div>
        <div>
          <p className={styles.profileName}>{profile.username}</p>
          {profile.email && <p className={styles.profileEmail}>{profile.email}</p>}
          <p className={styles.profileBadge}>Chicago Explorer</p>
        </div>
      </div>

      {/* Scores */}
      <div className={styles.scoresGrid}>
        <div className={`${styles.scoreCard} ${styles.scoreCardYellow}`}>
          <p className={styles.scoreStat}>All-Time High</p>
          <p className={styles.scoreValue}>{profile.hiScore.toLocaleString()}</p>
          <p className={styles.scoreLabel}>points</p>
        </div>
        <div className={`${styles.scoreCard} ${styles.scoreCardBlue}`}>
          <p className={styles.scoreStat}>This Week</p>
          <p className={styles.scoreValue}>{profile.weeklyScore.toLocaleString()}</p>
          <p className={styles.scoreLabel}>points</p>
        </div>
      </div>

      {/* Edit */}
      <div className={styles.editCard}>
        <h3 className={styles.editTitle}>Edit Profile</h3>

        {err && <p className={styles.errorMsg}>{err}</p>}
        {msg && <p className={styles.successMsg}>{msg}</p>}

        <form onSubmit={onSubmit} className={styles.editForm}>
          <div className={styles.formField}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Your display name"
            />
          </div>
          <div className={styles.submitWrapper}>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? '…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
