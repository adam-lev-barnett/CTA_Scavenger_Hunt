import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function RegisterPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.register(username, email, password);
      login(res.token, res.userId);
      navigate('/map');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-zinc-900 border-r border-white/[0.06] relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cta-blue/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-cta-purple/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-cta-blue flex items-center justify-center">🚇</div>
          <span className="font-display font-bold text-white tracking-tight">Chica<span className="text-cta-blue">-Go</span></span>
        </div>

        <div className="relative space-y-4">
          <p className="text-4xl font-display font-bold text-white leading-tight">
            Join thousands of<br />Chicago explorers.
          </p>
          <p className="text-zinc-400 text-base max-w-sm leading-relaxed">
            Earn points at every L stop. Discover the stories behind the city's most iconic neighborhoods.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          {['red','blue','green','purple','orange'].map(line => (
            <div key={line} className={`h-1 flex-1 rounded-full bg-cta-${line} opacity-70`} />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 animate-fade-up">

          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Create account</h1>
            <p className="text-sm text-zinc-500">Start exploring Chicago today</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Username</label>
              <input className="input" type="text" placeholder="ChicagoExplorer" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link to="/login" className="text-cta-blue hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
