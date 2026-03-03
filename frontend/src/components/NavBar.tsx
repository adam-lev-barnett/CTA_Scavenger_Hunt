import { BookOpen, HelpCircle, LayoutGrid, Mail, Trophy, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './navbar.module.css';

const NAV = [
  { to: '/map',         label: 'Explore',    Icon: LayoutGrid },
  { to: '/stampbook',   label: 'Stamps',     Icon: BookOpen   },
  { to: '/leaderboard', label: 'Rankings',   Icon: Trophy     },
  { to: '/profile',     label: 'Profile',    Icon: User       },
  { to: '/about',       label: 'About',      Icon: HelpCircle },
  { to: '/contact',     label: 'Contact',    Icon: Mail       },
];

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { logout }   = useAuth();

  return (
    <header className={styles.header}>

      {/* Brand */}
      <Link to="/map" className={styles.brand}>
        <div className={styles.logoBox}>🚇</div>
        <span className={styles.brandName}>
          Chica<span className={styles.brandAccent}>-Go</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${active ? styles.navLinkActive : styles.navLinkInactive}`}
            >
              <Icon size={13} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className={styles.signOut}
      >
        Sign out
      </button>
    </header>
  );
}
