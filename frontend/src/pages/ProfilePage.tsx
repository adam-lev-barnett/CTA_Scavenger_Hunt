import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { Profile } from '../types';

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
      <div className="flex items-center justify-center h-64">
        {err
          ? <p className="text-sm text-red-400">{err}</p>
          : <div className="w-5 h-5 rounded-full border-2 border-cta-blue border-t-transparent animate-spin" />
        }
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-4 animate-fade-up">

      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">Your explorer identity and scores</p>
      </div>

      {/* Identity card */}
      <div className="card px-6 py-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cta-blue to-cta-purple flex items-center justify-center font-display font-bold text-xl text-white shrink-0 shadow-lg shadow-cta-blue/20">
          {initials(profile.username)}
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-white">{profile.username}</p>
          {profile.email && <p className="text-sm text-zinc-500">{profile.email}</p>}
          <p className="text-xs text-cta-blue mt-0.5">Chicago Explorer</p>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card px-5 py-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cta-yellow to-cta-orange" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">All-Time High</p>
          <p className="font-display text-3xl font-bold text-white">{profile.hiScore.toLocaleString()}</p>
          <p className="text-xs text-zinc-600 mt-0.5">points</p>
        </div>
        <div className="card px-5 py-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cta-blue to-cta-purple" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">This Week</p>
          <p className="font-display text-3xl font-bold text-white">{profile.weeklyScore.toLocaleString()}</p>
          <p className="text-xs text-zinc-600 mt-0.5">points</p>
        </div>
      </div>

      {/* Edit */}
      <div className="card px-6 py-5 space-y-4">
        <h3 className="font-display font-semibold text-sm text-white">Edit Profile</h3>

        {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{msg}</p>}

        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="flex-1">
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Your display name"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
