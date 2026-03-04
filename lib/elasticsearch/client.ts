import { Client } from '@elastic/elasticsearch';

// ─────────────────────────────────────────────────────────────────────────────
// Elasticsearch Client Configuration
// ─────────────────────────────────────────────────────────────────────────────

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;

// Singleton pattern for Elasticsearch client
let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (esClient) {
    return esClient;
  }

  const clientConfig: any = {
    node: ELASTICSEARCH_NODE,
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
  };

  // Authentication: API Key takes precedence over username/password
  if (ELASTICSEARCH_API_KEY) {
    clientConfig.auth = {
      apiKey: ELASTICSEARCH_API_KEY,
    };
  } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
    clientConfig.auth = {
      username: ELASTICSEARCH_USERNAME,
      password: ELASTICSEARCH_PASSWORD,
    };
  }

  esClient = new Client(clientConfig);

  return esClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// Index Management
// ─────────────────────────────────────────────────────────────────────────────

export const COMPANY_INDEX = 'coop_companies_index';

export async function ensureIndexExists(): Promise<void> {
  const client = getElasticsearchClient();

  try {
    const exists = await client.indices.exists({ index: COMPANY_INDEX });

    if (!exists) {
      console.log(`Creating index: ${COMPANY_INDEX}`);
      
      // Load mapping from JSON file
      const mapping = await import('./mappings/coop-companies-mapping.json');
      
      await client.indices.create({
        index: COMPANY_INDEX,
        body: mapping,
      });

      console.log(`Index ${COMPANY_INDEX} created successfully`);
    }
  } catch (error) {
    console.error('Error ensuring index exists:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────

export async function checkElasticsearchHealth(): Promise<boolean> {
  try {
    const client = getElasticsearchClient();
    const health = await client.cluster.health();
    return health.status === 'green' || health.status === 'yellow';
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    return false;
  }
}

export default getElasticsearchClient;
