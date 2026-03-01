import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  // Mock achievements for demo
  const achievements = [
    { id: 1, name: 'First Steps', description: 'Visit your first station', icon: '👟', earned: true },
    { id: 2, name: 'Loop Master', description: 'Visit all Loop stations', icon: '🔄', earned: false },
    { id: 3, name: 'Early Bird', description: 'Check in before 7 AM', icon: '🌅', earned: true },
    { id: 4, name: 'Night Owl', description: 'Check in after 10 PM', icon: '🦉', earned: false },
    { id: 5, name: 'Red Line Rider', description: 'Visit all Red Line stations', icon: '🔴', earned: true },
    { id: 6, name: 'Blue Line Rider', description: 'Visit all Blue Line stations', icon: '🔵', earned: false },
  ];

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="page profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header animate-fade-in">
          <div className="profile-avatar">
            <span className="avatar-letter">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-joined">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats animate-fade-in">
          <div className="profile-stat">
            <span className="stat-icon">🏆</span>
            <div className="stat-details">
              <span className="stat-value">{user.hiScore.toLocaleString()}</span>
              <span className="stat-label">High Score</span>
            </div>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">⚡</span>
            <div className="stat-details">
              <span className="stat-value">{user.weeklyScore.toLocaleString()}</span>
              <span className="stat-label">This Week</span>
            </div>
          </div>
          <div className="profile-stat">
            <span className="stat-icon">🏅</span>
            <div className="stat-details">
              <span className="stat-value">{earnedCount}/{achievements.length}</span>
              <span className="stat-label">Achievements</span>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="achievements-section animate-fade-in">
          <h2>🎖️ Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                </div>
                {achievement.earned ? (
                  <span className="earned-badge">✓</span>
                ) : (
                  <span className="locked-badge">🔒</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links animate-fade-in">
          <h2>Quick Links</h2>
          <div className="links-grid">
            <button className="link-card" onClick={() => navigate('/stampbook')}>
              <span className="link-icon">📖</span>
              <span className="link-text">View StampBook</span>
            </button>
            <button className="link-card" onClick={() => navigate('/leaderboard')}>
              <span className="link-icon">🏆</span>
              <span className="link-text">Leaderboard</span>
            </button>
            <button className="link-card" onClick={() => navigate('/dashboard')}>
              <span className="link-icon">🗺️</span>
              <span className="link-text">Explore Map</span>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="account-actions animate-fade-in">
          <button className="btn btn-danger btn-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
