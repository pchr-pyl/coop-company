/**
 * GET /api/companies/search
 *
 * Enterprise search endpoint — acts as an API gateway to Elasticsearch.
 * Accepted query parameters:
 *   keyword  – full-text search (company name, province, programme, description)
 *   industry – exact faculty/industry filter
 *   province – exact province/country filter
 *   lat      – user latitude  (enables geo-distance filter + sort)
 *   lon      – user longitude (enables geo-distance filter + sort)
 *   radius   – geo search radius, e.g. "50km" (default: "50km")
 *
 * This route will be replaced by a Kotlin/Spring Boot microservice in
 * production; the response shape must remain stable.
 */

import { getElasticsearchClient, ES_INDEX } from '@/lib/elasticsearch';
import { NextRequest, NextResponse } from 'next/server';
import type { Company } from '@/types';

const MAX_RESULTS = 200;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;

  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const industry = searchParams.get('industry')?.trim() ?? '';
  const province = searchParams.get('province')?.trim() ?? '';
  const latRaw = searchParams.get('lat');
  const lonRaw = searchParams.get('lon');
  const radius = searchParams.get('radius') ?? '50km';

  const lat = latRaw !== null ? parseFloat(latRaw) : NaN;
  const lon = lonRaw !== null ? parseFloat(lonRaw) : NaN;
  const hasGeo = !isNaN(lat) && !isNaN(lon);

  try {
    const client = getElasticsearchClient();

    // ── Query clauses ────────────────────────────────────────────────────────
    const mustClauses: object[] = [];
    const filterClauses: object[] = [];

    if (keyword) {
      mustClauses.push({
        multi_match: {
          query: keyword,
          // company_name standard^3 > company_name Thai tokenizer^2 > others^1
          fields: [
            'company_name^3',
            'company_name.thai^2',
            'province.text',
            'program',
            'description',
          ],
          fuzziness: 'AUTO',
          type: 'best_fields',
        },
      });
    }

    if (industry) {
      filterClauses.push({ term: { industry } });
    }

    if (province) {
      // `province` field is keyword type — exact match
      filterClauses.push({ term: { province } });
    }

    if (hasGeo) {
      filterClauses.push({
        geo_distance: {
          distance: radius,
          location: { lat, lon },
        },
      });
    }

    const query: object =
      mustClauses.length > 0 || filterClauses.length > 0
        ? {
            bool: {
              ...(mustClauses.length > 0 ? { must: mustClauses } : {}),
              ...(filterClauses.length > 0 ? { filter: filterClauses } : {}),
            },
          }
        : { match_all: {} };

    // ── Sort ─────────────────────────────────────────────────────────────────
    // Priority: geo distance > relevance score > alphabetical
    const sortClauses: object[] = [];

    if (hasGeo) {
      sortClauses.push({
        _geo_distance: {
          location: { lat, lon },
          order: 'asc',
          unit: 'km',
          mode: 'min',
          distance_type: 'arc',
        },
      });
    } else if (!keyword) {
      // No relevance scoring active — fall back to alphabetical
      sortClauses.push({ 'company_name.keyword': { order: 'asc' } });
    }

    // ── Execute ──────────────────────────────────────────────────────────────
    const response = await client.search<Record<string, unknown>>({
      index: ES_INDEX,
      size: MAX_RESULTS,
      query,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(sortClauses.length > 0 ? { sort: sortClauses as any } : {}),
    });

    // ── Map response ─────────────────────────────────────────────────────────
    const companies: Company[] = response.hits.hits
      .filter((hit) => hit._source !== undefined)
      .map((hit) => {
        const src = hit._source!;
        const loc = src['location'] as { lat: number; lon: number } | undefined;

        // `hit.sort[0]` is the geo distance in km when _geo_distance is the
        // first (and only) sort criterion.
        const sortValues = hit.sort as (number | null)[] | undefined;
        const distanceKm =
          hasGeo && sortValues?.[0] != null
            ? sortValues[0]
            : undefined;

        return {
          id: hit._id ?? '',
          company_name: String(src['company_name'] ?? ''),
          industry: String(src['industry'] ?? ''),
          program: src['program'] ? String(src['program']) : undefined,
          province: String(src['province'] ?? ''),
          location: { lat: loc?.lat ?? 0, lon: loc?.lon ?? 0 },
          accept_interns: Boolean(src['accept_interns'] ?? false),
          description: src['description']
            ? String(src['description'])
            : undefined,
          address: src['address'] ? String(src['address']) : undefined,
          score: hit._score ?? undefined,
          distance:
            distanceKm != null
              ? `${distanceKm.toFixed(1)} กม.`
              : undefined,
        };
      });

    const totalHits = response.hits.total;
    const total =
      typeof totalHits === 'number' ? totalHits : (totalHits?.value ?? 0);

    return NextResponse.json({ companies, total });
  } catch (error) {
    console.error('[/api/companies/search] Elasticsearch query failed:', error);
    return NextResponse.json(
      { error: 'Search service is temporarily unavailable. Please try again later.' },
      { status: 502 },
    );
  }
}
