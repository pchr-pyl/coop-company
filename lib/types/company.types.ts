// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript Types for Company Domain
// ─────────────────────────────────────────────────────────────────────────────

export type Region = 'North' | 'Northeast' | 'Central' | 'East' | 'South' | 'West';

export type CompanySize = 'Startup' | 'SME' | 'Large' | 'Enterprise';

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  lineId?: string;
}

export interface InternshipPosition {
  title: string;
  department: string;
  slots: number;
  requirements?: string[];
  duration?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanySearchResult {
  id: string;
  companyId: string;
  companyName: string;
  companyNameEn?: string;
  faculty: string;
  program: string;
  province: string;
  region: Region;
  address: string;
  location: GeoLocation;
  contactInfo: ContactInfo;
  industry?: string;
  companySize?: CompanySize;
  internshipPositions: InternshipPosition[];
  tags: string[];
  description?: string;
  benefits?: string[];
  isActive: boolean;
  isPremium: boolean;
  rating?: number;
  reviewCount: number;
  distance?: number; // Distance in kilometers (if geo query)
  score?: number; // Elasticsearch relevance score
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  keyword?: string;
  faculty?: string;
  program?: string;
  province?: string;
  region?: Region;
  industry?: string;
  companySize?: CompanySize;
  tags?: string[];
  isPremium?: boolean;
  minRating?: number;
  userLocation?: {
    lat: number;
    lon: number;
    maxDistanceKm?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  success: boolean;
  data: CompanySearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  aggregations?: {
    faculties: Array<{ key: string; count: number }>;
    provinces: Array<{ key: string; count: number }>;
    regions: Array<{ key: string; count: number }>;
    industries: Array<{ key: string; count: number }>;
  };
  took?: number; // Query execution time in ms
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Elasticsearch Query Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ElasticsearchQuery {
  bool: {
    must?: any[];
    should?: any[];
    filter?: any[];
    must_not?: any[];
  };
}

export interface ElasticsearchSort {
  [key: string]: {
    order: 'asc' | 'desc';
    mode?: string;
    unit?: string;
  };
}
