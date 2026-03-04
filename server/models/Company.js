const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  // Original CSV fields
  ลำดับ: {
    type: Number,
    required: true,
    index: true
  },
  รายชื่อสถานประกอบการ: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  สำนักวิชา: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  หลักสูตร: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  จังหวัดที่ตั้ง: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  
  // New fields for enhanced functionality
  businessType: {
    type: String,
    trim: true,
    default: null
  },
  companySize: {
    type: String,
    enum: ['SME', 'Large Enterprise', 'Startup', 'Government', 'Non-Profit', null],
    default: null
  },
  website: {
    type: String,
    trim: true,
    default: null
  },
  contactEmail: {
    type: String,
    trim: true,
    default: null
  },
  contactPhone: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for full-text search
CompanySchema.index({
  รายชื่อสถานประกอบการ: 'text',
  สำนักวิชา: 'text',
  หลักสูตร: 'text',
  จังหวัดที่ตั้ง: 'text',
  businessType: 'text',
  description: 'text'
});

// Create geospatial index for location-based queries
CompanySchema.index({ latitude: 1, longitude: 1 });

// Compound indexes for common queries
CompanySchema.index({ สำนักวิชา: 1, หลักสูตร: 1 });
CompanySchema.index({ จังหวัดที่ตั้ง: 1, สำนักวิชา: 1 });

module.exports = mongoose.model('Company', CompanySchema);
