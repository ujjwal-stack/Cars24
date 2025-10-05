// client/src/pages/SellCar.js
import React, { useState } from 'react';
import { CarForm } from '../components/car/CarForm';
import { CarValuation } from '../components/car/CarValuation';

export const SellCar = () => {
  const [showValuation, setShowValuation] = useState(true);

  return (
    <div className="sell-car-page">
      <div className="container">
        <div className="page-header">
          <h1>Sell Your Car</h1>
          <p>List your car and get the best price in minutes</p>
        </div>

        <div className="sell-car-content">
          {showValuation ? (
            <div className="valuation-section">
              <CarValuation />
              <div className="action-center">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => setShowValuation(false)}
                >
                  Continue to List Your Car
                </button>
              </div>
            </div>
          ) : (
            <CarForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default SellCar;