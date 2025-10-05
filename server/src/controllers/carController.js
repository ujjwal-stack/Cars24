const Car = require('../models/Car');
const { validationResult } = require('express-validator');
const pricingService = require('../services/pricingService');

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      model,
      minPrice,
      maxPrice,
      year,
      fuelType,
      transmission,
      city,
      state,
      search,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    if (brand) query['basicInfo.brand'] = brand;
    if (model) query['basicInfo.model'] = { $regex: model, $options: 'i' };
    if (fuelType) query['basicInfo.fuelType'] = fuelType;
    if (transmission) query['basicInfo.transmission'] = transmission;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (year) query['basicInfo.year'] = parseInt(year);

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.askingPrice'] = {};
      if (minPrice) query['pricing.askingPrice'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.askingPrice'].$lte = parseInt(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const cars = await Car.find(query)
      .populate('sellerId', 'name phone profile.location')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Car.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cars,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('sellerId', 'name email phone profile.location createdAt');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Increment view count (don't await to avoid blocking)
    car.incrementViews().catch(err => console.error('Failed to increment views:', err));

    res.status(200).json({
      success: true,
      data: { car }
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create new car listing
// @route   POST /api/cars
// @access  Private
const createCar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const carData = {
      ...req.body,
      sellerId: req.user.userId
    };

    // Calculate estimated price
    if (carData.basicInfo && carData.pricing?.askingPrice) {
      const estimatedPrice = await pricingService.calculateCarPrice(carData.basicInfo);
      carData.pricing.estimatedPrice = estimatedPrice;
      carData.pricing.marketValue = estimatedPrice;
    }

    const car = await Car.create(carData);

    res.status(201).json({
      success: true,
      message: 'Car listed successfully',
      data: { car }
    });
  } catch (error) {
    console.error('Create car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create car listing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update car listing
// @route   PUT /api/cars/:id
// @access  Private (Owner only)
const updateCar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check ownership
    if (car.sellerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Update car
    Object.assign(car, req.body);

    // Recalculate price if basic info changed
    if (req.body.basicInfo && car.pricing?.askingPrice) {
      const estimatedPrice = await pricingService.calculateCarPrice(car.basicInfo);
      car.pricing.estimatedPrice = estimatedPrice;
      car.pricing.marketValue = estimatedPrice;
    }

    await car.save();

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: { car }
    });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete car listing
// @route   DELETE /api/cars/:id
// @access  Private (Owner only)
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check ownership
    if (car.sellerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get my car listings
// @route   GET /api/cars/my-listings
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { sellerId: req.user.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cars = await Car.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Car.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cars,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Add car to favorites
// @route   POST /api/cars/:id/favorite
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    await car.addToFavorites(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Remove car from favorites
// @route   DELETE /api/cars/:id/favorite
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    await car.removeFromFavorites(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's favorite cars
// @route   GET /api/cars/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const cars = await Car.find({
      'favorites.userId': req.user.userId,
      status: 'active'
    })
      .populate('sellerId', 'name phone')
      .sort('-favorites.addedAt')
      .lean();

    res.status(200).json({
      success: true,
      data: { cars }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get car valuation
// @route   POST /api/cars/valuation
// @access  Public
const getValuation = async (req, res) => {
  try {
    const { brand, model, year, kmsDriven, fuelType, transmission, owners } = req.body;

    if (!brand || !model || !year || !kmsDriven) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: brand, model, year, kmsDriven'
      });
    }

    const carInfo = { brand, model, year, kmsDriven, fuelType, transmission, owners };
    const estimatedPrice = await pricingService.calculateCarPrice(carInfo);

    res.status(200).json({
      success: true,
      data: {
        estimatedPrice,
        priceRange: {
          min: Math.floor(estimatedPrice * 0.9),
          max: Math.ceil(estimatedPrice * 1.1)
        },
        factors: pricingService.getPricingFactors(carInfo)
      }
    });
  } catch (error) {
    console.error('Valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate valuation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get filter options
// @route   GET /api/cars/filters
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    const brands = await Car.distinct('basicInfo.brand', { status: 'active' });
    const fuelTypes = await Car.distinct('basicInfo.fuelType', { status: 'active' });
    const transmissions = await Car.distinct('basicInfo.transmission', { status: 'active' });
    const cities = await Car.distinct('location.city', { status: 'active' });

    const priceRange = await Car.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.askingPrice' },
          maxPrice: { $max: '$pricing.askingPrice' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        brands: brands.sort(),
        fuelTypes: fuelTypes.sort(),
        transmissions: transmissions.sort(),
        cities: cities.sort(),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000000 }
      }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getMyListings,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getValuation,
  getFilterOptions
};