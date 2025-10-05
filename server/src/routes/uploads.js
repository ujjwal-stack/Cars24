// server/src/routes/uploads.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadCarImages, uploadSingleImage, uploadDocument } = require('../middleware/upload');
const {
  uploadCarImages: uploadCarImagesController,
  deleteCarImage,
  uploadAvatar,
  uploadDocument: uploadDocumentController
} = require('../controllers/uploadController');

const router = express.Router();

// Upload car images
router.post('/car-images', protect, (req, res, next) => {
  uploadCarImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadCarImagesController);

// Delete car image
router.delete('/car-images/:publicId', protect, deleteCarImage);

// Upload avatar
router.post('/avatar', protect, (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadAvatar);

// Upload document
router.post('/document', protect, (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadDocumentController);

module.exports = router;