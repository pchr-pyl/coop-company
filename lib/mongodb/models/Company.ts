import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface IContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  lineId?: string;
}

export interface IInternshipPosition {
  title: string;
  department: string;
  slots: number;
  requirements?: string[];
  duration?: string; // e.g., "4 months", "1 semester"
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ICompany extends Document {
  companyId: string; // Unique business identifier
  companyName: string;
  companyNameEn?: string;
  faculty: string;
  program: string;
  province: string;
  region: 'North' | 'Northeast' | 'Central' | 'East' | 'South' | 'West';
  address: string;
  location: ILocation;
  contactInfo: IContactInfo;
  industry?: string;
  companySize?: 'Startup' | 'SME' | 'Large' | 'Enterprise';
  internshipPositions: IInternshipPosition[];
  tags: string[];
  description?: string;
  benefits?: string[];
  isActive: boolean;
  isPremium: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastVerifiedAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mongoose Schema
// ─────────────────────────────────────────────────────────────────────────────

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9\-\+\(\)\s]+$/, 'Invalid phone format'],
    },
    website: {
      type: String,
      trim: true,
    },
    lineId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const InternshipPositionSchema = new Schema<IInternshipPosition>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    slots: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    requirements: [String],
    duration: String,
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords: number[]) {
          return (
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 && // longitude
            coords[1] >= -90 &&
            coords[1] <= 90 // latitude
          );
        },
        message: 'Invalid coordinates format [lng, lat]',
      },
    },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompany>(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    companyNameEn: {
      type: String,
      trim: true,
      index: 'text',
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      enum: ['North', 'Northeast', 'Central', 'East', 'South', 'West'],
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: LocationSchema,
      required: true,
      index: '2dsphere', // Geospatial index for proximity queries
    },
    contactInfo: {
      type: ContactInfoSchema,
      default: {},
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    companySize: {
      type: String,
      enum: ['Startup', 'SME', 'Large', 'Enterprise'],
    },
    internshipPositions: {
      type: [InternshipPositionSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    benefits: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastVerifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'companies',
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes (Compound indexes for common queries)
// ─────────────────────────────────────────────────────────────────────────────

CompanySchema.index({ faculty: 1, program: 1 });
CompanySchema.index({ province: 1, isActive: 1 });
CompanySchema.index({ region: 1, isActive: 1 });
CompanySchema.index({ isPremium: -1, rating: -1 });
CompanySchema.index({ tags: 1, isActive: 1 });
CompanySchema.index({ createdAt: -1 });

// Text search index (for full-text search fallback)
CompanySchema.index({
  companyName: 'text',
  companyNameEn: 'text',
  description: 'text',
});

// ─────────────────────────────────────────────────────────────────────────────
// Virtual Properties
// ─────────────────────────────────────────────────────────────────────────────

CompanySchema.virtual('latitude').get(function () {
  return this.location?.coordinates[1];
});

CompanySchema.virtual('longitude').get(function () {
  return this.location?.coordinates[0];
});

// ─────────────────────────────────────────────────────────────────────────────
// Instance Methods
// ─────────────────────────────────────────────────────────────────────────────

CompanySchema.methods.toElasticsearch = function () {
  return {
    companyId: this.companyId,
    companyName: this.companyName,
    companyNameEn: this.companyNameEn,
    faculty: this.faculty,
    program: this.program,
    province: this.province,
    region: this.region,
    address: this.address,
    location: {
      lat: this.location.coordinates[1],
      lon: this.location.coordinates[0],
    },
    contactInfo: this.contactInfo,
    industry: this.industry,
    companySize: this.companySize,
    internshipPositions: this.internshipPositions,
    tags: this.tags,
    isActive: this.isActive,
    isPremium: this.isPremium,
    rating: this.rating,
    reviewCount: this.reviewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastVerifiedAt: this.lastVerifiedAt,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Static Methods
// ─────────────────────────────────────────────────────────────────────────────

CompanySchema.statics.findByProximity = function (
  longitude: number,
  latitude: number,
  maxDistanceKm: number = 50
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceKm * 1000, // Convert to meters
      },
    },
    isActive: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Model Export (Singleton pattern for Next.js hot reload)
// ─────────────────────────────────────────────────────────────────────────────

const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
