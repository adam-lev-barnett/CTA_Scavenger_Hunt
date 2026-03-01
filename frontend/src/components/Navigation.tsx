import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🚇</span>
          <span className="logo-text">Chica-Go!</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">🗺️</span>
                <span>Map</span>
              </Link>
              <Link 
                to="/stampbook" 
                className={`nav-link ${isActive('/stampbook') ? 'active' : ''}`}
              >
                <span className="nav-icon">📖</span>
                <span>StampBook</span>
              </Link>
              <Link 
                to="/leaderboard" 
                className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏆</span>
                <span>Leaderboard</span>
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <span className="nav-icon">👤</span>
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="nav-user">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-score">{user.weeklyScore} pts</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
