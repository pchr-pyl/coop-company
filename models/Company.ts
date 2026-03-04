/**
 * Mongoose schema for cooperative-education company profiles.
 *
 * MongoDB is the primary store for complete company data (rich text, contacts,
 * benefits, etc.).  Elasticsearch mirrors a subset of these fields for fast
 * full-text and geo-spatial queries.  The `elasticsearch_id` field enables
 * lookups in either direction.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

// ── Embedded sub-documents ──────────────────────────────────────────────────

interface IContact {
  phone?: string;
  email?: string;
  website?: string;
}

interface ILocation {
  /** WGS-84 latitude */
  lat: number;
  /** WGS-84 longitude */
  lon: number;
}

// ── Main document interface ─────────────────────────────────────────────────

export interface ICompany extends Document {
  /** Thai company name — e.g. "ธนาคารออมสิน สำนักงานใหญ่ และสาขา" */
  company_name: string;
  /** Faculty/industry key — matches `สำนักวิชา` in the CSV */
  industry: string;
  /** Study programme — matches `หลักสูตร` in the CSV */
  program?: string;
  /** Thai province or country name */
  province: string;
  /** WGS-84 coordinates */
  location: ILocation;
  /** Whether this company currently accepts intern students */
  accept_interns: boolean;
  /** Long-form description (supports rich text / Markdown) */
  description?: string;
  /** Physical address */
  address?: string;
  /** Contact information */
  contact?: IContact;
  /** List of offered benefits / welfare items */
  benefits?: string[];
  /** Rough company size band */
  company_size?: 'small' | 'medium' | 'large' | 'enterprise';
  /** Year the company was founded */
  established_year?: number;
  /** Cross-reference to the Elasticsearch document `_id` */
  elasticsearch_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema definition ───────────────────────────────────────────────────────

const ContactSchema = new Schema<IContact>(
  {
    phone: { type: String },
    email: { type: String },
    website: { type: String },
  },
  { _id: false },
);

const LocationSchema = new Schema<ILocation>(
  {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { _id: false },
);

const CompanySchema = new Schema<ICompany>(
  {
    company_name: { type: String, required: true, index: true, trim: true },
    industry: { type: String, required: true, index: true, trim: true },
    program: { type: String, trim: true },
    province: { type: String, required: true, index: true, trim: true },
    location: { type: LocationSchema, required: true },
    accept_interns: { type: Boolean, default: true, index: true },
    description: { type: String },
    address: { type: String },
    contact: { type: ContactSchema },
    benefits: [{ type: String }],
    company_size: {
      type: String,
      enum: ['small', 'medium', 'large', 'enterprise'],
    },
    established_year: { type: Number },
    elasticsearch_id: { type: String, index: true, sparse: true },
  },
  {
    timestamps: true,
    collection: 'companies',
  },
);

// ── Model (singleton-safe for Next.js hot-reload) ───────────────────────────

const Company: Model<ICompany> =
  (mongoose.models.Company as Model<ICompany>) ??
  mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
