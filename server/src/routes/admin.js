// server/src/routes/admin.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllCars,
  updateCarStatus,
  getAllTransactions,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Car management
router.get('/cars', getAllCars);
router.put('/cars/:id/status', updateCarStatus);

// Transaction management
router.get('/transactions', getAllTransactions);

module.exports = router;