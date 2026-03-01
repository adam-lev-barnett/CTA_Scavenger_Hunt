import React, { useState } from 'react';
import { TrainStation, CheckInResponse, CTALineColor } from '../types';
import { useAuth } from '../context/AuthContext';
import PointsGained from '../components/PointsGained';
import './Dashboard.css';

// Mock stations for demo
const mockStations: TrainStation[] = [
  { id: 1, name: 'Clark/Lake', pointValue: 100, latitude: 41.8859, longitude: -87.6308, description: 'Major hub station', nearbyLocations: [2, 3], lineColor: 'blue', isHub: true },
  { id: 2, name: 'State/Lake', pointValue: 100, latitude: 41.8856, longitude: -87.6276, description: 'Near State Street shopping', nearbyLocations: [1, 4], lineColor: 'red', isHub: false },
  { id: 3, name: 'Washington/Wabash', pointValue: 100, latitude: 41.8824, longitude: -87.6258, description: 'Newest Loop station', nearbyLocations: [1, 5], lineColor: 'brown', isHub: false },
  { id: 4, name: 'Adams/Wabash', pointValue: 100, latitude: 41.8797, longitude: -87.6258, description: 'Near Art Institute', nearbyLocations: [2, 5], lineColor: 'green', isHub: false },
  { id: 5, name: 'Harold Washington Library', pointValue: 100, latitude: 41.8763, longitude: -87.6283, description: 'Near the main library', nearbyLocations: [3, 4], lineColor: 'orange', isHub: false },
  { id: 6, name: 'LaSalle', pointValue: 100, latitude: 41.8767, longitude: -87.6325, description: 'Financial district', nearbyLocations: [7], lineColor: 'blue', isHub: false },
  { id: 7, name: 'Quincy', pointValue: 100, latitude: 41.8787, longitude: -87.6339, description: 'Historic station architecture', nearbyLocations: [6, 8], lineColor: 'purple', isHub: false },
  { id: 8, name: 'Jackson', pointValue: 100, latitude: 41.8777, longitude: -87.6276, description: 'Near Willis Tower', nearbyLocations: [7], lineColor: 'red', isHub: false },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedStation, setSelectedStation] = useState<TrainStation | null>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsData, setPointsData] = useState<CheckInResponse | null>(null);
  const [filterLine, setFilterLine] = useState<CTALineColor | 'all'>('all');

  const filteredStations = filterLine === 'all' 
    ? mockStations 
    : mockStations.filter(s => s.lineColor === filterLine);

  const handleCheckIn = (station: TrainStation) => {
    // Simulate check-in
    const mockResponse: CheckInResponse = {
      pointsEarned: station.pointValue,
      totalScore: (user?.weeklyScore || 0) + station.pointValue,
      isFirstVisit: Math.random() > 0.5,
      locationName: station.name,
    };
    
    setPointsData(mockResponse);
    setShowPointsModal(true);
    setSelectedStation(null);
  };

  const lineColors: CTALineColor[] = ['red', 'blue', 'brown', 'green', 'orange', 'purple', 'pink', 'yellow'];

  return (
    <div className="page dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="welcome-section">
            <h1>Welcome, {user?.username}!</h1>
            <p>Explore Chicago's Loop and collect stamps</p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-info">
                <span className="stat-value">{user?.weeklyScore || 0}</span>
                <span className="stat-label">This Week</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏆</span>
              <div className="stat-info">
                <span className="stat-value">{user?.hiScore || 0}</span>
                <span className="stat-label">High Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section animate-fade-in">
          <div className="map-header">
            <h2>🗺️ The Loop Stations</h2>
            <div className="line-filters">
              <button 
                className={`line-filter-btn ${filterLine === 'all' ? 'active' : ''}`}
                onClick={() => setFilterLine('all')}
              >
                All
              </button>
              {lineColors.map((color) => (
                <button 
                  key={color}
                  className={`line-filter-btn ${color} ${filterLine === color ? 'active' : ''}`}
                  onClick={() => setFilterLine(color)}
                />
              ))}
            </div>
          </div>

          {/* Simplified Map View */}
          <div className="map-container">
            <div className="map-placeholder">
              <div className="cta-map">
                {/* Visual representation of CTA Loop */}
                <svg viewBox="0 0 400 300" className="loop-svg">
                  {/* Loop track */}
                  <rect x="50" y="50" width="300" height="200" fill="none" stroke="#444" strokeWidth="8" rx="10" />
                  
                  {/* Station markers */}
                  {filteredStations.map((station, index) => {
                    // Position stations around the loop
                    const positions = [
                      { x: 100, y: 50 },  // Top left
                      { x: 200, y: 50 },  // Top center
                      { x: 300, y: 50 },  // Top right
                      { x: 350, y: 150 }, // Right middle
                      { x: 300, y: 250 }, // Bottom right
                      { x: 200, y: 250 }, // Bottom center
                      { x: 100, y: 250 }, // Bottom left
                      { x: 50, y: 150 },  // Left middle
                    ];
                    const pos = positions[index % positions.length];
                    
                    return (
                      <g 
                        key={station.id} 
                        className="station-marker"
                        onClick={() => setSelectedStation(station)}
                      >
                        <circle 
                          cx={pos.x} 
                          cy={pos.y} 
                          r="15" 
                          className={`station-dot ${station.lineColor}`}
                        />
                        <text 
                          x={pos.x} 
                          y={pos.y + 30} 
                          textAnchor="middle" 
                          className="station-label"
                        >
                          {station.name.split('/')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Stations List */}
        <div className="stations-section animate-fade-in">
          <h2>📍 Nearby Stations</h2>
          <div className="stations-grid">
            {filteredStations.map((station) => (
              <div 
                key={station.id}
                className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                onClick={() => setSelectedStation(station)}
              >
                <div className={`station-line-indicator ${station.lineColor}`}></div>
                <div className="station-content">
                  <div className="station-header">
                    <h3>{station.name}</h3>
                    {station.isHub && <span className="hub-badge">Hub</span>}
                  </div>
                  <p className="station-description">{station.description}</p>
                  <div className="station-footer">
                    <span className="station-points">{station.pointValue} pts</span>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckIn(station);
                      }}
                    >
                      Check In
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station Detail Modal */}
        {selectedStation && (
          <div className="station-detail-overlay" onClick={() => setSelectedStation(null)}>
            <div className="station-detail-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedStation(null)}>×</button>
              
              <div className={`detail-header ${selectedStation.lineColor}`}>
                <h2>{selectedStation.name}</h2>
                <span className="detail-line-badge">
                  {selectedStation.lineColor.charAt(0).toUpperCase() + selectedStation.lineColor.slice(1)} Line
                </span>
              </div>
              
              <div className="detail-body">
                <p className="detail-description">{selectedStation.description}</p>
                
                <div className="detail-info">
                  <div className="info-item">
                    <span className="info-icon">🎯</span>
                    <span className="info-label">Points</span>
                    <span className="info-value">{selectedStation.pointValue}</span>
                  </div>
                  {selectedStation.isHub && (
                    <div className="info-item">
                      <span className="info-icon">🚉</span>
                      <span className="info-label">Type</span>
                      <span className="info-value">Hub Station</span>
                    </div>
                  )}
                </div>
                
                {selectedStation.nearbyLocations.length > 0 && (
                  <div className="nearby-section">
                    <h4>Nearby Points of Interest</h4>
                    <div className="nearby-list">
                      {selectedStation.nearbyLocations.map((locId) => {
                        const nearbyStation = mockStations.find(s => s.id === locId);
                        return nearbyStation ? (
                          <div key={locId} className="nearby-item">
                            <span className={`nearby-dot ${nearbyStation.lineColor}`}></span>
                            <span>{nearbyStation.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn btn-primary btn-lg btn-block"
                  onClick={() => handleCheckIn(selectedStation)}
                >
                  🎯 Check In Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Points Gained Modal */}
        {showPointsModal && pointsData && (
          <PointsGained 
            data={pointsData} 
            onClose={() => setShowPointsModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
