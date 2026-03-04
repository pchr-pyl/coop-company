/** A cooperative-education company returned by the search API. */
export interface Company {
  /** Elasticsearch document `_id` */
  id: string;
  company_name: string;
  industry: string;
  /** Study programme (หลักสูตร) */
  program?: string;
  province: string;
  location: {
    lat: number;
    lon: number;
  };
  accept_interns: boolean;
  /** Long-form description (may be undefined for legacy data) */
  description?: string;
  /** Physical address */
  address?: string;
  /** Elasticsearch relevance score */
  score?: number;
  /** Human-readable distance from the user's location, e.g. "12.3 กม." */
  distance?: string;
}

/** Filter parameters shared between FilterBar and the search API. */
export interface FilterState {
  keyword: string;
  industry: string;
  province: string;
  /** User's latitude (set by geolocation "Near Me" feature) */
  userLat?: number;
  /** User's longitude (set by geolocation "Near Me" feature) */
  userLon?: number;
  /** Geo-search radius in kilometres (default: 50) */
  radiusKm: number;
}
