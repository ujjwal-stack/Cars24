// server/src/services/pricingService.js
const Car = require('../models/Car');

// Base prices for different brands (in lakhs)
const BASE_PRICES = {
  'Maruti Suzuki': 5.5,
  'Hyundai': 6.5,
  'Tata': 6.0,
  'Mahindra': 7.5,
  'Honda': 8.0,
  'Toyota': 9.0,
  'Kia': 8.5,
  'Renault': 5.0,
  'Nissan': 6.0,
  'Ford': 7.0,
  'Volkswagen': 9.5,
  'Skoda': 10.0,
  'BMW': 35.0,
  'Mercedes-Benz': 40.0,
  'Audi': 38.0,
  'Jaguar': 45.0,
  'Other': 6.0
};

// Depreciation rates per year (percentage)
const DEPRECIATION_RATE = 0.15; // 15% per year

// Fuel type multipliers
const FUEL_TYPE_MULTIPLIERS = {
  'Petrol': 1.0,
  'Diesel': 1.15,
  'CNG': 0.95,
  'Electric': 1.3,
  'Hybrid': 1.25
};

// Transmission multipliers
const TRANSMISSION_MULTIPLIERS = {
  'Manual': 1.0,
  'Automatic': 1.15,
  'AMT': 1.08,
  'CVT': 1.12
};

class PricingService {
  /**
   * Calculate estimated car price based on various factors
   */
  async calculateCarPrice(carInfo) {
    try {
      const {
        brand,
        model,
        year,
        kmsDriven,
        fuelType = 'Petrol',
        transmission = 'Manual',
        owners = 1
      } = carInfo;

      // Get base price for brand
      let basePrice = (BASE_PRICES[brand] || BASE_PRICES['Other']) * 100000;

      // Calculate age depreciation
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      const depreciationFactor = Math.pow((1 - DEPRECIATION_RATE), age);
      let estimatedPrice = basePrice * depreciationFactor;

      // Apply kilometer-driven factor
      const kmFactor = this.calculateKmFactor(kmsDriven);
      estimatedPrice *= kmFactor;

      // Apply fuel type multiplier
      const fuelMultiplier = FUEL_TYPE_MULTIPLIERS[fuelType] || 1.0;
      estimatedPrice *= fuelMultiplier;

      // Apply transmission multiplier
      const transMultiplier = TRANSMISSION_MULTIPLIERS[transmission] || 1.0;
      estimatedPrice *= transMultiplier;

      // Apply owner count factor
      const ownerFactor = this.calculateOwnerFactor(owners);
      estimatedPrice *= ownerFactor;

      // Check market data for similar cars
      const marketAdjustment = await this.getMarketAdjustment(carInfo);
      estimatedPrice *= marketAdjustment;

      // Round to nearest thousand
      estimatedPrice = Math.round(estimatedPrice / 1000) * 1000;

      // Ensure minimum price
      estimatedPrice = Math.max(estimatedPrice, 50000);

      return estimatedPrice;
    } catch (error) {
      console.error('Price calculation error:', error);
      // Return a default estimated price in case of error
      return 300000;
    }
  }

  /**
   * Calculate factor based on kilometers driven
   */
  calculateKmFactor(kmsDriven) {
    if (kmsDriven < 10000) return 1.0;
    if (kmsDriven < 30000) return 0.95;
    if (kmsDriven < 50000) return 0.90;
    if (kmsDriven < 75000) return 0.85;
    if (kmsDriven < 100000) return 0.80;
    if (kmsDriven < 150000) return 0.70;
    return 0.60;
  }

  /**
   * Calculate factor based on number of owners
   */
  calculateOwnerFactor(owners) {
    switch (owners) {
      case 1: return 1.0;
      case 2: return 0.95;
      case 3: return 0.90;
      case 4: return 0.85;
      default: return 0.80;
    }
  }

  /**
   * Get market adjustment based on similar cars in database
   */
  async getMarketAdjustment(carInfo) {
    try {
      const { brand, model, year } = carInfo;
      
      // Find similar cars (same brand, similar year)
      const similarCars = await Car.find({
        'basicInfo.brand': brand,
        'basicInfo.year': { $gte: year - 2, $lte: year + 2 },
        'status': { $in: ['active', 'sold'] },
        'pricing.askingPrice': { $exists: true }
      }).limit(20).lean();

      if (similarCars.length < 3) {
        return 1.0; // Not enough data for adjustment
      }

      // Calculate average asking price
      const avgPrice = similarCars.reduce((sum, car) => 
        sum + car.pricing.askingPrice, 0) / similarCars.length;

      // Calculate expected price based on base calculation
      const basePrice = (BASE_PRICES[brand] || BASE_PRICES['Other']) * 100000;
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      const expectedPrice = basePrice * Math.pow((1 - DEPRECIATION_RATE), age);

      // Market adjustment factor
      const marketFactor = avgPrice / expectedPrice;

      // Limit adjustment to reasonable range (0.8 to 1.2)
      return Math.max(0.8, Math.min(1.2, marketFactor));

    } catch (error) {
      console.error('Market adjustment error:', error);
      return 1.0;
    }
  }

  /**
   * Get pricing factors breakdown
   */
  getPricingFactors(carInfo) {
    const { brand, year, kmsDriven, fuelType, transmission, owners } = carInfo;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    return {
      basePrice: `₹${((BASE_PRICES[brand] || BASE_PRICES['Other']) * 100000).toLocaleString('en-IN')}`,
      ageDepreciation: `${(age * DEPRECIATION_RATE * 100).toFixed(0)}% (${age} years old)`,
      kmsDriven: `${kmsDriven.toLocaleString('en-IN')} km`,
      kmFactor: `${(this.calculateKmFactor(kmsDriven) * 100).toFixed(0)}%`,
      fuelType: fuelType,
      fuelMultiplier: `${((FUEL_TYPE_MULTIPLIERS[fuelType] || 1.0) * 100).toFixed(0)}%`,
      transmission: transmission,
      transmissionMultiplier: `${((TRANSMISSION_MULTIPLIERS[transmission] || 1.0) * 100).toFixed(0)}%`,
      owners: owners,
      ownerFactor: `${(this.calculateOwnerFactor(owners) * 100).toFixed(0)}%`
    };
  }

  /**
   * Get price recommendation for selling
   */
  getPriceRecommendation(estimatedPrice) {
    return {
      recommended: Math.round(estimatedPrice),
      quick: Math.round(estimatedPrice * 0.95),
      competitive: Math.round(estimatedPrice * 1.05),
      premium: Math.round(estimatedPrice * 1.1)
    };
  }

  /**
   * Calculate price trend for a specific car type
   */
  async getPriceTrend(brand, model, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const soldCars = await Car.find({
        'basicInfo.brand': brand,
        'basicInfo.model': { $regex: model, $options: 'i' },
        'status': 'sold',
        'soldAt': { $gte: startDate },
        'soldPrice': { $exists: true }
      }).sort('soldAt').lean();

      if (soldCars.length === 0) {
        return null;
      }

      const trend = soldCars.map(car => ({
        date: car.soldAt,
        price: car.soldPrice,
        year: car.basicInfo.year,
        kmsDriven: car.basicInfo.kmsDriven
      }));

      const avgPrice = soldCars.reduce((sum, car) => sum + car.soldPrice, 0) / soldCars.length;

      return {
        trend,
        averagePrice: Math.round(avgPrice),
        totalSold: soldCars.length,
        period: `${months} months`
      };

    } catch (error) {
      console.error('Price trend error:', error);
      return null;
    }
  }
}

module.exports = new PricingService();