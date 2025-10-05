// server/src/models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  basicInfo: {
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      enum: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 
             'Kia', 'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda', 
             'BMW', 'Mercedes-Benz', 'Audi', 'Jaguar', 'Other']
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      maxlength: [50, 'Model name cannot exceed 50 characters']
    },
    variant: {
      type: String,
      required: [true, 'Variant is required'],
      trim: true,
      maxlength: [100, 'Variant name cannot exceed 100 characters']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1990, 'Year cannot be before 1990'],
      max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
    },
    transmission: {
      type: String,
      required: [true, 'Transmission is required'],
      enum: ['Manual', 'Automatic', 'AMT', 'CVT']
    },
    kmsDriven: {
      type: Number,
      required: [true, 'Kilometers driven is required'],
      min: [0, 'Kilometers driven cannot be negative'],
      max: [500000, 'Kilometers driven seems too high']
    },
    owners: {
      type: Number,
      required: [true, 'Number of owners is required'],
      min: [1, 'At least 1 owner is required'],
      max: [5, 'Maximum 5 owners allowed']
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    }
  },
  pricing: {
    askingPrice: {
      type: Number,
      required: [true, 'Asking price is required'],
      min: [10000, 'Price must be at least ₹10,000'],
      max: [10000000, 'Price cannot exceed ₹1 Crore']
    },
    estimatedPrice: {
      type: Number,
      default: null
    },
    marketValue: {
      type: Number,
      default: null
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    trim: true
  },
  features: [{
    category: {
      type: String,
      enum: ['Safety', 'Comfort', 'Technology', 'Performance', 'Exterior', 'Interior']
    },
    items: [String]
  }],
  documents: [{
    type: {
      type: String,
      enum: ['rc', 'insurance', 'puc', 'service_history', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiryDate: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid pincode']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: {
      type: String,
      trim: true
    }
  },
  condition: {
    overall: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      required: [true, 'Overall condition is required']
    },
    exterior: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    interior: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    engine: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    tyres: {
      type: String,
      enum: ['New', 'Good', 'Average', 'Needs Replacement']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'inactive', 'under_inspection'],
    default: 'draft'
  },
  inspectionReport: {
    completed: {
      type: Boolean,
      default: false
    },
    reportUrl: String,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    completedAt: Date,
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  soldAt: Date,
  soldPrice: Number,
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for seller details
carSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for primary image
carSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for favorite count
carSchema.virtual('favoriteCount').get(function() {
  return this.favorites.length;
});

// Index for better query performance
carSchema.index({ 'basicInfo.brand': 1, 'basicInfo.model': 1 });
carSchema.index({ 'pricing.askingPrice': 1 });
carSchema.index({ 'location.city': 1, 'location.state': 1 });
carSchema.index({ status: 1 });
carSchema.index({ sellerId: 1 });
carSchema.index({ createdAt: -1 });

// Text index for search functionality
carSchema.index({
  'basicInfo.brand': 'text',
  'basicInfo.model': 'text',
  'basicInfo.variant': 'text',
  'description': 'text'
});

// Pre-save middleware
carSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let hasPrimary = false;
    this.images.forEach(img => {
      if (img.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else if (img.isPrimary && hasPrimary) {
        img.isPrimary = false;
      }
    });
    
    // If no primary image, make first image primary
    if (!hasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Method to increment views
carSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Method to add to favorites
carSchema.methods.addToFavorites = function(userId) {
  if (!this.favorites.some(fav => fav.userId.toString() === userId.toString())) {
    this.favorites.push({ userId });
    return this.save();
  }
  return this;
};

// Method to remove from favorites
carSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(fav => fav.userId.toString() !== userId.toString());
  return this.save();
};

// Method to mark as sold
carSchema.methods.markAsSold = function(soldPrice, soldTo) {
  this.status = 'sold';
  this.soldAt = new Date();
  this.soldPrice = soldPrice;
  this.soldTo = soldTo;
  return this.save();
};

module.exports = mongoose.model('Car', carSchema);