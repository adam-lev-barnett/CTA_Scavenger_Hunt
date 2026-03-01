import React, { useState } from 'react';
import { StampBookEntry, CTALineColor } from '../types';
import './StampBook.css';

// Mock data for demo
const mockStampBookEntries: StampBookEntry[] = [
  { id: 1, locationId: 1, locationName: 'Clark/Lake', visited: true, visitedAt: '2024-02-15T10:30:00', lineColor: 'blue', pointValue: 100 },
  { id: 2, locationId: 2, locationName: 'State/Lake', visited: true, visitedAt: '2024-02-15T11:00:00', lineColor: 'red', pointValue: 100 },
  { id: 3, locationId: 3, locationName: 'Washington/Wabash', visited: true, visitedAt: '2024-02-16T09:15:00', lineColor: 'brown', pointValue: 100 },
  { id: 4, locationId: 4, locationName: 'Adams/Wabash', visited: false, visitedAt: null, lineColor: 'green', pointValue: 100 },
  { id: 5, locationId: 5, locationName: 'Harold Washington Library', visited: true, visitedAt: '2024-02-16T10:45:00', lineColor: 'orange', pointValue: 100 },
  { id: 6, locationId: 6, locationName: 'LaSalle', visited: false, visitedAt: null, lineColor: 'blue', pointValue: 100 },
  { id: 7, locationId: 7, locationName: 'Quincy', visited: true, visitedAt: '2024-02-17T14:20:00', lineColor: 'purple', pointValue: 100 },
  { id: 8, locationId: 8, locationName: 'Jackson', visited: false, visitedAt: null, lineColor: 'red', pointValue: 100 },
  { id: 9, locationId: 9, locationName: 'Monroe', visited: true, visitedAt: '2024-02-18T08:30:00', lineColor: 'red', pointValue: 100 },
  { id: 10, locationId: 10, locationName: 'Lake', visited: false, visitedAt: null, lineColor: 'green', pointValue: 100 },
  { id: 11, locationId: 11, locationName: 'Randolph/Wabash', visited: false, visitedAt: null, lineColor: 'brown', pointValue: 100 },
  { id: 12, locationId: 12, locationName: 'Madison/Wabash', visited: true, visitedAt: '2024-02-19T16:00:00', lineColor: 'orange', pointValue: 100 },
];

const lineColors: CTALineColor[] = ['red', 'blue', 'brown', 'green', 'orange', 'purple', 'pink', 'yellow'];

const StampBook: React.FC = () => {
  const [entries] = useState<StampBookEntry[]>(mockStampBookEntries);
  const [filterLine, setFilterLine] = useState<CTALineColor | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visited' | 'unvisited'>('all');

  const filteredEntries = entries.filter((entry) => {
    const lineMatch = filterLine === 'all' || entry.lineColor === filterLine;
    const statusMatch = 
      filterStatus === 'all' || 
      (filterStatus === 'visited' && entry.visited) ||
      (filterStatus === 'unvisited' && !entry.visited);
    return lineMatch && statusMatch;
  });

  const visitedCount = entries.filter(e => e.visited).length;
  const totalCount = entries.length;
  const progressPercent = (visitedCount / totalCount) * 100;

  return (
    <div className="page stampbook-page">
      <div className="container">
        <div className="stampbook-header animate-fade-in">
          <div className="stampbook-title">
            <span className="stampbook-icon">📖</span>
            <h1>My StampBook</h1>
          </div>
          
          <div className="stampbook-progress">
            <div className="progress-stats">
              <span className="progress-count">{visitedCount} / {totalCount}</span>
              <span className="progress-label">Locations Visited</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stampbook-filters animate-fade-in">
          <div className="filter-group">
            <span className="filter-label">Filter by Line:</span>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterLine === 'all' ? 'active' : ''}`}
                onClick={() => setFilterLine('all')}
              >
                All
              </button>
              {lineColors.map((color) => (
                <button 
                  key={color}
                  className={`filter-btn line-filter ${color} ${filterLine === color ? 'active' : ''}`}
                  onClick={() => setFilterLine(color)}
                >
                  <span className={`line-badge ${color}`}></span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'visited' ? 'active' : ''}`}
                onClick={() => setFilterStatus('visited')}
              >
                ✓ Visited
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'unvisited' ? 'active' : ''}`}
                onClick={() => setFilterStatus('unvisited')}
              >
                ○ Unvisited
              </button>
            </div>
          </div>
        </div>

        <div className="stampbook-grid animate-fade-in">
          {filteredEntries.map((entry, index) => (
            <div 
              key={entry.id}
              className={`stamp-card ${entry.visited ? 'visited' : 'unvisited'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="stamp-content">
                <div className={`stamp-badge ${entry.lineColor}`}>
                  {entry.visited ? '✓' : '?'}
                </div>
                <div className="stamp-info">
                  <h3 className="stamp-name">{entry.locationName}</h3>
                  <span className={`line-indicator ${entry.lineColor}`}>
                    {entry.lineColor?.charAt(0).toUpperCase()}{entry.lineColor?.slice(1)} Line
                  </span>
                </div>
              </div>
              
              <div className="stamp-footer">
                {entry.visited ? (
                  <>
                    <span className="stamp-date">
                      {new Date(entry.visitedAt!).toLocaleDateString()}
                    </span>
                    <span className="stamp-points">+{entry.pointValue} pts</span>
                  </>
                ) : (
                  <span className="stamp-unvisited-text">Not yet visited</span>
                )}
              </div>

              {entry.visited && (
                <div className="stamp-overlay">
                  <span className="stamp-mark">VISITED</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="stampbook-empty">
            <span className="empty-icon">🔍</span>
            <p>No stations match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StampBook;
