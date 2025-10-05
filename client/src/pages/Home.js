// client/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Buy & Sell Used Cars with Confidence
            </h1>
            <p className="hero-subtitle">
              India's most trusted platform for pre-owned vehicles. Get instant valuation, 
              hassle-free paperwork, and doorstep delivery.
            </p>
            <div className="hero-actions">
              <Link to="/buy-cars" className="btn btn-primary btn-large">
                Buy a Car
              </Link>
              <Link to="/sell-car" className="btn btn-secondary btn-large">
                Sell Your Car
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="car-placeholder">
              {/* Placeholder for car image */}
              <div className="car-icon">🚗</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Cars24?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>Get the best price for your car with our AI-powered valuation system</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Quality Inspection</h3>
              <p>Every car undergoes a comprehensive 200-point inspection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Hassle-free Paperwork</h3>
              <p>We handle all documentation and RC transfer processes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Doorstep Service</h3>
              <p>Car pickup and delivery at your convenience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Cars Sold</p>
            </div>
            <div className="stat-item">
              <h3>25+</h3>
              <p>Cities</p>
            </div>
            <div className="stat-item">
              <h3>4.5★</h3>
              <p>Customer Rating</p>
            </div>
            <div className="stat-item">
              <h3>30 Min</h3>
              <p>Instant Valuation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of satisfied customers who trust Cars24</p>
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Today
              </Link>
            </div>
          </div>
        </section>

      )}



    </div>
  );
};

export default Home;