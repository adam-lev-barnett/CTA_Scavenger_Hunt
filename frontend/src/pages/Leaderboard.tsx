import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

// Mock data for demo
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 1, username: 'ChicagoMaster', weeklyScore: 2450, hiScore: 15600 },
  { rank: 2, userId: 2, username: 'LoopExplorer', weeklyScore: 2100, hiScore: 12300 },
  { rank: 3, userId: 3, username: 'WindyCityPro', weeklyScore: 1850, hiScore: 9800 },
  { rank: 4, userId: 4, username: 'TransitKing', weeklyScore: 1620, hiScore: 8400 },
  { rank: 5, userId: 5, username: 'StationHunter', weeklyScore: 1480, hiScore: 7200 },
  { rank: 6, userId: 6, username: 'CTARider', weeklyScore: 1320, hiScore: 6100 },
  { rank: 7, userId: 7, username: 'UrbanNavigator', weeklyScore: 1150, hiScore: 5500 },
  { rank: 8, userId: 8, username: 'ChiTownWalker', weeklyScore: 980, hiScore: 4800 },
  { rank: 9, userId: 9, username: 'TrainSpotter', weeklyScore: 820, hiScore: 4200 },
  { rank: 10, userId: 10, username: 'DowntownDrifter', weeklyScore: 650, hiScore: 3600 },
];

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [sortBy, setSortBy] = useState<'weekly' | 'allTime'>('weekly');

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'weekly') {
      return b.weeklyScore - a.weeklyScore;
    }
    return b.hiScore - a.hiScore;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  return (
    <div className="page leaderboard-page">
      <div className="container">
        <div className="leaderboard-header animate-fade-in">
          <div className="leaderboard-title">
            <span className="leaderboard-icon">🏆</span>
            <h1>Leaderboard</h1>
          </div>
          
          <div className="leaderboard-tabs">
            <button 
              className={`tab-btn ${sortBy === 'weekly' ? 'active' : ''}`}
              onClick={() => setSortBy('weekly')}
            >
              This Week
            </button>
            <button 
              className={`tab-btn ${sortBy === 'allTime' ? 'active' : ''}`}
              onClick={() => setSortBy('allTime')}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="podium animate-fade-in">
          {sortedLeaderboard.slice(0, 3).map((entry, index) => (
            <div 
              key={entry.userId}
              className={`podium-item place-${index + 1}`}
            >
              <div className="podium-avatar">
                <span className="avatar-emoji">
                  {index === 0 ? '👑' : index === 1 ? '⭐' : '✨'}
                </span>
              </div>
              <div className="podium-rank">{getRankIcon(index + 1)}</div>
              <div className="podium-name">{entry.username}</div>
              <div className="podium-score">
                {sortBy === 'weekly' ? entry.weeklyScore : entry.hiScore} pts
              </div>
              <div className={`podium-stand ${getRankClass(index + 1)}`}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard Table */}
        <div className="leaderboard-table animate-fade-in">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-player">Player</div>
            <div className="col-weekly">Weekly</div>
            <div className="col-alltime">All Time</div>
          </div>
          
          {sortedLeaderboard.map((entry, index) => (
            <div 
              key={entry.userId}
              className={`table-row ${entry.userId === user?.id ? 'current-user' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`col-rank ${getRankClass(index + 1)}`}>
                <span className="rank-icon">{getRankIcon(index + 1)}</span>
              </div>
              <div className="col-player">
                <div className="player-avatar">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <span className="player-name">{entry.username}</span>
                {entry.userId === user?.id && (
                  <span className="you-badge">You</span>
                )}
              </div>
              <div className="col-weekly">
                <span className="score-value">{entry.weeklyScore.toLocaleString()}</span>
                <span className="score-label">pts</span>
              </div>
              <div className="col-alltime">
                <span className="score-value">{entry.hiScore.toLocaleString()}</span>
                <span className="score-label">pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Reset Notice */}
        <div className="reset-notice animate-fade-in">
          <span className="notice-icon">⏰</span>
          <span>Weekly scores reset every Monday at midnight</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
