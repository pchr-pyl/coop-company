/**
 * Elasticsearch index creation and seed script.
 *
 * Creates `coop_companies_index` with the mapping in
 * `scripts/elasticsearch-mapping.json` and seeds a few sample documents.
 *
 * Run with:
 *   ELASTICSEARCH_URL=http://localhost:9200 npx ts-node --esm scripts/create-elasticsearch-index.ts
 *
 * Required environment variables:
 *   ELASTICSEARCH_URL    – e.g. http://localhost:9200
 *   ELASTICSEARCH_API_KEY – optional API key for authenticated clusters
 */

import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';
import * as path from 'path';

const INDEX_NAME = 'coop_companies_index';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  ...(process.env.ELASTICSEARCH_API_KEY
    ? { auth: { apiKey: process.env.ELASTICSEARCH_API_KEY } }
    : {}),
});

async function createIndex(): Promise<void> {
  const exists = await client.indices.exists({ index: INDEX_NAME });
  if (exists) {
    console.log(`Index "${INDEX_NAME}" already exists – skipping creation.`);
    return;
  }

  const mappingPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    'elasticsearch-mapping.json',
  );
  const { mappings, settings } = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8'),
  ) as { index: string; mappings: object; settings: object };

  await client.indices.create({ index: INDEX_NAME, mappings, settings });
  console.log(`Index "${INDEX_NAME}" created successfully.`);
}

async function seedSampleData(): Promise<void> {
  const sampleDocs = [
    {
      company_name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร สาขาต่างๆ',
      industry: 'การบัญชีและการเงิน',
      program: 'การเงิน',
      province: 'ปัตตานี',
      location: { lat: 6.854087, lon: 101.216555 },
      accept_interns: true,
    },
    {
      company_name: 'ธนาคารออมสิน สำนักงานใหญ่ และสาขา',
      industry: 'การบัญชีและการเงิน',
      program: 'การเงิน',
      province: 'นครศรีธรรมราช',
      location: { lat: 8.459205, lon: 99.944961 },
      accept_interns: true,
    },
    {
      company_name: 'บริษัท คิงเพาเวอร์ อินเตอร์เนชั่นแนล จำกัด',
      industry: 'การจัดการ',
      program: 'การจัดการ',
      province: 'กรุงเทพมหานคร',
      location: { lat: 13.781385, lon: 100.469559 },
      accept_interns: true,
    },
    {
      company_name: 'มหาวิทยาลัยวลัยลักษณ์',
      industry: 'การศึกษา',
      program: 'การบริหาร',
      province: 'นครศรีธรรมราช',
      location: { lat: 8.6428, lon: 99.8973 },
      accept_interns: true,
    },
  ];

  const operations = sampleDocs.flatMap((doc) => [
    { index: { _index: INDEX_NAME } },
    doc,
  ]);

  const result = await client.bulk({ operations, refresh: true });
  if (result.errors) {
    console.error('Bulk indexing encountered errors:', result.items);
  } else {
    console.log(`Seeded ${sampleDocs.length} sample documents into "${INDEX_NAME}".`);
  }
}

async function main(): Promise<void> {
  try {
    await createIndex();
    await seedSampleData();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
