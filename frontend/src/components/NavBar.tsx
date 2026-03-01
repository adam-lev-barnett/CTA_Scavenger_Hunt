import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/map', label: 'Map' },
  { to: '/stampbook', label: 'Stamp Book' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="nav-bar">
      <h1>CTA Scavenger Hunt</h1>
      <nav>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        className="ghost"
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Logout
      </button>
    </header>
  );
}
