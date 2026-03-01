import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { DEMO_TOKEN, DEMO_USER_ID } from '../services/demoData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login(email, password);
      login(response.token, response.userId);
      navigate('/map');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function onDemoLogin() {
    setError(null);
    login(DEMO_TOKEN, DEMO_USER_ID);
    navigate('/map');
  }

  return (
    <main className="auth-shell">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h2>Login</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="auth-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="ghost" onClick={onDemoLogin}>
            Use Demo User (Offline)
          </button>
        </div>
        <p className="hint">Use demo mode when backend/database is unavailable.</p>
        <p>
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
}
