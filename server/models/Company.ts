import mongoose, { Schema, Document, Model } from 'mongoose';

// ── TypeScript interfaces ────────────────────────────────────────────────────

export interface ICompany extends Document {
  ลำดับ: number;
  รายชื่อสถานประกอบการ: string;
  สำนักวิชา: string;
  หลักสูตร: string;
  จังหวัดที่ตั้ง: string;
  latitude: number;
  longitude: number;
  businessType?: string | null;
  companySize?: 'SME' | 'Large Enterprise' | 'Startup' | 'Government' | 'Non-Profit' | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  description?: string | null;
  isActive: boolean;
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema definition ────────────────────────────────────────────────────────

const CompanySchema = new Schema<ICompany>(
  {
    ลำดับ: { type: Number, required: true, index: true },
    รายชื่อสถานประกอบการ: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    สำนักวิชา: { type: String, required: true, trim: true, index: true },
    หลักสูตร: { type: String, required: true, trim: true, index: true },
    จังหวัดที่ตั้ง: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    businessType: { type: String, trim: true, default: null },
    companySize: {
      type: String,
      enum: ['SME', 'Large Enterprise', 'Startup', 'Government', 'Non-Profit', null],
      default: null,
    },
    website: { type: String, trim: true, default: null },
    contactEmail: { type: String, trim: true, default: null },
    contactPhone: { type: String, trim: true, default: null },
    description: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Text index for full-text search
CompanySchema.index({
  รายชื่อสถานประกอบการ: 'text',
  สำนักวิชา: 'text',
  หลักสูตร: 'text',
  จังหวัดที่ตั้ง: 'text',
  businessType: 'text',
  description: 'text',
});

// Geospatial index for location-based queries
CompanySchema.index({ latitude: 1, longitude: 1 });

// Compound indexes for common queries
CompanySchema.index({ สำนักวิชา: 1, หลักสูตร: 1 });
CompanySchema.index({ จังหวัดที่ตั้ง: 1, สำนักวิชา: 1 });

// ── Model (singleton-safe) ───────────────────────────────────────────────────

const Company: Model<ICompany> =
  (mongoose.models['Company'] as Model<ICompany>) ??
  mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
