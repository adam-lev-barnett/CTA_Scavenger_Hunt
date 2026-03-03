import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import styles from './RegisterPage.module.css';

const LINE_COLORS: Record<string, string> = {
  red: '#c60c30', blue: '#00a1de', green: '#009b3a', purple: '#522398', orange: '#f9461c',
};

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
    <div className={styles.page}>

      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.blobTop} />
        <div className={styles.blobBottom} />

        <div className={styles.logoRow}>
          <div className={styles.logoBox}>🚇</div>
          <span className={styles.logoName}>Chica<span className={styles.logoAccent}>-Go</span></span>
        </div>

        <div className={styles.taglineSection}>
          <p className={styles.tagline}>
            Join thousands of<br />Chicago explorers.
          </p>
          <p className={styles.taglineBody}>
            Earn points at every L stop. Discover the stories behind the city's most iconic neighborhoods.
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
            <h1 className={styles.formTitle}>Create account</h1>
            <p className={styles.formSubtitle}>Start exploring Chicago today</p>
          </div>

          <div className={styles.fieldset}>
            <div>
              <label className={styles.label}>Username</label>
              <input className={styles.input} type="text" placeholder="ChicagoExplorer" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
