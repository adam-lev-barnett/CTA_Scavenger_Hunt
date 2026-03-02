import { BookOpen, HelpCircle, LayoutGrid, Mail, Trophy, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.06]">

      {/* Brand */}
      <Link to="/map" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-7 h-7 rounded-md bg-cta-blue flex items-center justify-center text-sm">
          🚇
        </div>
        <span className="font-display font-700 text-[15px] tracking-tight text-white">
          Chica<span className="text-cta-blue">-Go</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-0.5">
        {NAV.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150',
                active
                  ? 'text-cta-blue bg-cta-blue/10'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5',
              ].join(' ')}
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
        className="btn btn-ghost text-xs shrink-0"
      >
        Sign out
      </button>
    </header>
  );
}
