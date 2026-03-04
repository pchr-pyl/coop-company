import { Client } from '@elastic/elasticsearch';
import { NextRequest, NextResponse } from 'next/server';
import type { Company } from '@/types';

const INDEX_NAME = 'coop_companies';

function getClient(): Client {
  return new Client({
    node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
    ...(process.env.ELASTICSEARCH_API_KEY
      ? { auth: { apiKey: process.env.ELASTICSEARCH_API_KEY } }
      : {}),
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const industry = searchParams.get('industry')?.trim() ?? '';

  try {
    const client = getClient();

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
      index: INDEX_NAME,
      size: 200,
      query,
    });

    const companies: Company[] = response.hits.hits
      .filter((hit) => hit._source !== undefined)
      .map((hit) => {
        const src = hit._source!;
        const locationRaw = src['location'] as
          | { lat: number; lon: number }
          | undefined;
        return {
          id: hit._id ?? '',
          company_name: String(src['company_name'] ?? ''),
          industry: String(src['industry'] ?? ''),
          province: String(src['province'] ?? ''),
          location: {
            lat: locationRaw?.lat ?? 0,
            lon: locationRaw?.lon ?? 0,
          },
          accept_interns: Boolean(src['accept_interns'] ?? false),
        };
      });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Elasticsearch query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies from search index.' },
      { status: 502 },
    );
  }
}
