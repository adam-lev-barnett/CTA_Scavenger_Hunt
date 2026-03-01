import React from 'react';
import { CheckInResponse } from '../types';
import './PointsGained.css';

interface PointsGainedProps {
  data: CheckInResponse;
  onClose: () => void;
}

const PointsGained: React.FC<PointsGainedProps> = ({ data, onClose }) => {
  return (
    <div className="points-modal-overlay" onClick={onClose}>
      <div className="points-modal animate-points" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="points-celebration">
          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`confetti-piece piece-${i % 5}`} />
            ))}
          </div>
          
          <div className="points-icon">
            {data.isFirstVisit ? '🎉' : '✨'}
          </div>
          
          <h2 className="points-title">
            {data.isFirstVisit ? 'First Visit!' : 'Points Earned!'}
          </h2>
          
          <div className="points-value">
            <span className="points-plus">+</span>
            <span className="points-number">{data.pointsEarned}</span>
            <span className="points-label">pts</span>
          </div>
          
          <div className="location-badge">
            <span className="location-icon">📍</span>
            <span className="location-name">{data.locationName}</span>
          </div>
          
          {data.isFirstVisit && (
            <div className="first-visit-badge">
              <span>🏅 New Stamp Earned!</span>
            </div>
          )}
          
          <div className="total-score">
            <span className="total-label">Total Score</span>
            <span className="total-value">{data.totalScore.toLocaleString()}</span>
          </div>
          
          <button className="btn btn-primary btn-lg" onClick={onClose}>
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointsGained;
