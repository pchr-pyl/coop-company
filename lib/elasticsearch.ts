import { Client } from '@elastic/elasticsearch';

/**
 * Primary Elasticsearch index name for cooperative-education companies.
 * An enhanced mapping (Thai analyzer, geo_point, mongodb_id) is defined in
 * `scripts/elasticsearch-mapping.json`.
 */
export const ES_INDEX = 'coop_companies_index';

declare global {
  // Preserve the client across Next.js hot-reloads in development.
  // eslint-disable-next-line no-var
  var __esClient: Client | undefined;
}

/** Returns the singleton Elasticsearch client, creating it on first call. */
export function getElasticsearchClient(): Client {
  if (!global.__esClient) {
    global.__esClient = new Client({
      node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
      ...(process.env.ELASTICSEARCH_API_KEY
        ? { auth: { apiKey: process.env.ELASTICSEARCH_API_KEY } }
        : {}),
    });
  }
  return global.__esClient;
}
