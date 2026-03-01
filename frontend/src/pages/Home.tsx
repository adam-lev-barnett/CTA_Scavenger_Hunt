import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <div className="hero-logo">🚇</div>
          <h1 className="hero-title">Chica-Go!</h1>
          <p className="hero-subtitle">
            The ultimate Chicago L Train scavenger hunt. Visit stations, collect stamps, 
            earn points, and explore the city like never before.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Start Exploring
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="hero-decoration">
          <div className="train-lines">
            <div className="line red"></div>
            <div className="line blue"></div>
            <div className="line brown"></div>
            <div className="line green"></div>
            <div className="line orange"></div>
            <div className="line purple"></div>
            <div className="line pink"></div>
            <div className="line yellow"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title animate-fade-in">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">🚉</div>
              <h3>Visit Stations</h3>
              <p>Travel to CTA L train stations around Chicago's famous Loop</p>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">📍</div>
              <h3>Check In</h3>
              <p>When you arrive, check in to earn points and collect stamps</p>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">📖</div>
              <h3>Build Your Collection</h3>
              <p>Fill your stamp book with visits to all the Loop stations</p>
            </div>
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">🏆</div>
              <h3>Compete</h3>
              <p>Climb the weekly leaderboard and earn achievements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Lines Section */}
      <section className="lines-section">
        <div className="container">
          <h2 className="section-title animate-fade-in">All 8 CTA Lines</h2>
          <div className="lines-grid">
            {[
              { color: 'red', name: 'Red', stations: 'Howard to 95th/Dan Ryan' },
              { color: 'blue', name: 'Blue', stations: "O'Hare to Forest Park" },
              { color: 'brown', name: 'Brown', stations: 'Kimball to Loop' },
              { color: 'green', name: 'Green', stations: 'Harlem to Cottage Grove/Ashland' },
              { color: 'orange', name: 'Orange', stations: 'Midway to Loop' },
              { color: 'purple', name: 'Purple', stations: 'Linden to Loop (Express)' },
              { color: 'pink', name: 'Pink', stations: '54th/Cermak to Loop' },
              { color: 'yellow', name: 'Yellow', stations: 'Skokie to Howard' },
            ].map((line) => (
              <div key={line.color} className={`line-badge-card ${line.color}`}>
                <div className={`line-circle ${line.color}`}></div>
                <div className="line-info">
                  <span className="line-name">{line.name} Line</span>
                  <span className="line-route">{line.stations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="container">
          <div className="cta-content animate-fade-in">
            <h2>Ready to explore Chicago?</h2>
            <p>Join thousands of urban explorers discovering the city one station at a time.</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Your Adventure
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
