import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { DEMO_TOKEN, DEMO_USER_ID } from '../services/demoData';
import styles from './LoginPage.module.css';

const LINE_COLORS: Record<string, string> = {
  red: '#c60c30', blue: '#00a1de', green: '#009b3a', purple: '#522398', orange: '#f9461c',
};

export default function LoginPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.token, res.userId);
      navigate('/map');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* Left panel — decorative */}
      <div className={styles.leftPanel}>
        <div className={styles.blobTop} />
        <div className={styles.blobBottom} />

        <div className={styles.logoRow}>
          <div className={styles.logoBox}>🚇</div>
          <span className={styles.logoName}>Chica<span className={styles.logoAccent}>-Go</span></span>
        </div>

        <div className={styles.taglineSection}>
          <p className={styles.tagline}>
            Explore Chicago<br />one stop at a time.
          </p>
          <p className={styles.taglineBody}>
            Check in at CTA stations, discover hidden landmarks, and climb the leaderboard.
          </p>
        </div>

        <div className={styles.ctaLines}>
          {['red','blue','green','purple','orange'].map(line => (
            <div key={line} className={styles.ctaLine} style={{ backgroundColor: LINE_COLORS[line] }} />
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.rightPanel}>
        <form onSubmit={onSubmit} className={styles.form}>

          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={styles.formSubtitle}>Sign in to continue your adventure</p>
          </div>

          <div className={styles.fieldset}>
            <div>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine} />
          </div>

          <button
            type="button"
            onClick={() => { login(DEMO_TOKEN, DEMO_USER_ID); navigate('/map'); }}
            className={styles.demoBtn}
          >
            Continue in Demo Mode
          </button>

          <p className={styles.footerText}>
            No account?{' '}
            <Link to="/register" className={styles.footerLink}>Create one</Link>
          </p>
        </form>
      </div>

    </div>
  );
}
