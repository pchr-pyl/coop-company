/**
 * GET /api/companies  (legacy — kept for backward compatibility)
 *
 * Prefer /api/companies/search for new queries; it supports province filter,
 * geo-distance, and the Thai-language analyzer.
 */

import { getElasticsearchClient, ES_INDEX } from '@/lib/elasticsearch';
import { NextRequest, NextResponse } from 'next/server';
import type { Company } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const industry = searchParams.get('industry')?.trim() ?? '';

  try {
    const client = getElasticsearchClient();

    const mustClauses: object[] = [];

    if (keyword) {
      mustClauses.push({
        multi_match: {
          query: keyword,
          fields: ['company_name', 'province'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (industry) {
      mustClauses.push({ term: { industry } });
    }

    const query =
      mustClauses.length > 0
        ? { bool: { must: mustClauses } }
        : { match_all: {} };

    const response = await client.search<Record<string, unknown>>({
      index: ES_INDEX,
      size: 200,
      query,
    });

    const companies: Company[] = response.hits.hits
      .filter((hit) => hit._source !== undefined)
      .map((hit) => {
        const src = hit._source!;
        const loc = src['location'] as { lat: number; lon: number } | undefined;
        return {
          id: hit._id ?? '',
          company_name: String(src['company_name'] ?? ''),
          industry: String(src['industry'] ?? ''),
          program: src['program'] ? String(src['program']) : undefined,
          province: String(src['province'] ?? ''),
          location: { lat: loc?.lat ?? 0, lon: loc?.lon ?? 0 },
          accept_interns: Boolean(src['accept_interns'] ?? false),
        };
      });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('[/api/companies] Elasticsearch query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies from search index.' },
      { status: 502 },
    );
  }
}
