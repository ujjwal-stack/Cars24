// server/src/routes/cars.js
const express = require('express');
const { body } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/auth');
const {
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
} = require('../controllers/carController');

const router = express.Router();

// Basic car validation rules for Phase 1
const carValidation = [
  body('basicInfo.brand')
    .notEmpty()
    .isIn(['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota',
      'Kia', 'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda',
      'BMW', 'Mercedes-Benz', 'Audi', 'Jaguar', 'Other'])
    .withMessage('Please select a valid brand'),
  body('basicInfo.model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters'),
  body('basicInfo.variant')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant must be between 1 and 100 characters'),
  body('basicInfo.year')
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage('Please enter a valid year'),
  body('basicInfo.fuelType')
    .isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'])
    .withMessage('Please select a valid fuel type'),
  body('basicInfo.transmission')
    .isIn(['Manual', 'Automatic', 'AMT', 'CVT'])
    .withMessage('Please select a valid transmission'),
  body('basicInfo.kmsDriven')
    .isInt({ min: 0, max: 500000 })
    .withMessage('Kilometers driven must be between 0 and 500000'),
  body('basicInfo.owners')
    .isInt({ min: 1, max: 5 })
    .withMessage('Number of owners must be between 1 and 5'),
  body('basicInfo.color')
    .trim()
    .notEmpty()
    .withMessage('Color is required'),
  body('pricing.askingPrice')
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage('Price must be between ₹10,000 and ₹1 Crore'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Please enter a valid pincode')
];

/*// Temporary basic controllers for Phase 1
 const getCars = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get cars endpoint - Phase 1',
      data: {
        cars: [],
        total: 0,
        page: 1,
        pages: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars'
    });
  }
};

const getCarById = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Get car by ID endpoint - Phase 1',
      data: {
        car: null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car details'
    });
  }
};

const createCar = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Create car endpoint - Phase 1 (placeholder)',
      data: {
        car: req.body
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create car listing'
    });
  }
};

// Routes
router.get('/', optionalAuth, getCars);
router.get('/:id', optionalAuth, getCarById);
router.post('/', protect, carValidation, createCar);

module.exports = router; */

const valuationValidation = [
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage('Please enter a valid year'),
  body('kmsDriven')
    .isInt({ min: 0, max: 500000 })
    .withMessage('Kilometers driven must be between 0 and 500000')
];

/* // Public routes
router.get('/', optionalAuth, getCars);
router.get('/filters', getFilterOptions);
router.get('/:id', optionalAuth, getCarById);
router.post('/valuation', valuationValidation, getValuation);

// Protected routes
router.post('/', protect, carValidation, createCar);
router.put('/:id', protect, carValidation, updateCar);
router.delete('/:id', protect, deleteCar);
router.get('/user/my-listings', protect, getMyListings);
router.get('/user/favorites', protect, getFavorites);
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);

module.exports = router; */

// ==========================================
// IMPORTANT: Specific routes MUST come BEFORE dynamic routes like /:id
// ==========================================

// Public routes - Specific paths first
router.get('/filters', getFilterOptions);
router.post('/valuation', valuationValidation, getValuation);

// Protected routes - Specific paths
router.get('/my-listings', protect, getMyListings);
router.get('/favorites', protect, getFavorites);

// Public routes - Collection
router.get('/', optionalAuth, getCars);

// Protected routes - Actions
router.post('/', protect, carValidation, createCar);

// Favorite routes - Must come before /:id to avoid conflicts
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);

// Dynamic ID routes - MUST BE LAST
router.get('/:id', optionalAuth, getCarById);
router.put('/:id', protect, carValidation, updateCar);
router.delete('/:id', protect, deleteCar);

module.exports = router;