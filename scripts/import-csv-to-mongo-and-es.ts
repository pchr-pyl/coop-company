/**
 * Data import script: CSV → MongoDB + Elasticsearch
 *
 * Reads `public/companies.csv`, inserts each row as a MongoDB document
 * (via Mongoose), and bulk-indexes a corresponding Elasticsearch document.
 * The MongoDB `_id` is stored as `mongodb_id` in ES for cross-reference.
 *
 * Run with:
 *   ELASTICSEARCH_URL=http://localhost:9200 \
 *   MONGODB_URI=mongodb://localhost:27017/coop_companies \
 *   npx ts-node --esm scripts/import-csv-to-mongo-and-es.ts
 *
 * Options:
 *   --drop   Drop and recreate both the MongoDB collection and the ES index
 *            before importing (use for a clean re-import).
 */

import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';
import mongoose from 'mongoose';
import * as path from 'path';
import * as readline from 'readline';

// ── Constants ────────────────────────────────────────────────────────────────

const ES_INDEX = 'coop_companies_index';
const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/coop_companies';
const CSV_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'public',
  'companies.csv',
);
const BATCH_SIZE = 100;
const DROP_MODE = process.argv.includes('--drop');

// ── Clients ──────────────────────────────────────────────────────────────────

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  ...(process.env.ELASTICSEARCH_API_KEY
    ? { auth: { apiKey: process.env.ELASTICSEARCH_API_KEY } }
    : {}),
});

// ── CSV row type ─────────────────────────────────────────────────────────────

interface CsvRow {
  company_name: string;
  industry: string;
  program: string;
  province: string;
  lat: number;
  lon: number;
}

/** Parse a single CSV data line into a typed row, or null if invalid. */
function parseLine(line: string): CsvRow | null {
  // Expected columns (7): ลำดับ, company_name, industry, program, province, lat, lon
  const cols = line.split(',');
  if (cols.length < 7) return null;
  const lat = parseFloat(cols[5]);
  const lon = parseFloat(cols[6]);
  if (isNaN(lat) || isNaN(lon)) return null;
  const name = cols[1].trim();
  if (!name) return null;
  return {
    company_name: name,
    industry: cols[2].trim(),
    program: cols[3].trim(),
    province: cols[4].trim(),
    lat,
    lon,
  };
}

// ── Mongoose model (inline, no import needed) ────────────────────────────────

const CompanySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    program: { type: String, trim: true },
    province: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    accept_interns: { type: Boolean, default: true },
    elasticsearch_id: { type: String },
  },
  { timestamps: true, collection: 'companies' },
);

const CompanyModel =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mongoose.models.Company as mongoose.Model<any>) ??
  mongoose.model('Company', CompanySchema);

// ── ES index helpers ─────────────────────────────────────────────────────────

async function recreateEsIndex(): Promise<void> {
  const mappingPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    'elasticsearch-mapping.json',
  );
  const { mappings, settings } = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8'),
  ) as { index: string; mappings: object; settings: object };

  const exists = await esClient.indices.exists({ index: ES_INDEX });
  if (exists) {
    await esClient.indices.delete({ index: ES_INDEX });
    console.log(`Deleted existing ES index "${ES_INDEX}".`);
  }
  await esClient.indices.create({ index: ES_INDEX, mappings, settings });
  console.log(`Created ES index "${ES_INDEX}".`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // 1. Connect to MongoDB
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB.');

  if (DROP_MODE) {
    await CompanyModel.deleteMany({});
    console.log('Cleared MongoDB companies collection.');
    await recreateEsIndex();
  } else {
    const exists = await esClient.indices.exists({ index: ES_INDEX });
    if (!exists) await recreateEsIndex();
  }

  // 2. Read CSV
  const fileStream = fs.createReadStream(CSV_PATH, 'utf-8');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  let imported = 0;
  let skipped = 0;

  const esBatch: object[] = [];

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // skip header

    const row = parseLine(line);
    if (!row) {
      skipped++;
      continue;
    }

    // Insert into MongoDB
    const doc = await CompanyModel.create({
      company_name: row.company_name,
      industry: row.industry,
      program: row.program,
      province: row.province,
      location: { lat: row.lat, lon: row.lon },
      accept_interns: true,
    });

    const mongoId = (doc._id as mongoose.Types.ObjectId).toString();

    // Add to ES batch
    esBatch.push(
      { index: { _index: ES_INDEX } },
      {
        company_name: row.company_name,
        industry: row.industry,
        program: row.program,
        province: row.province,
        location: { lat: row.lat, lon: row.lon },
        accept_interns: true,
        mongodb_id: mongoId,
      },
    );

    // Flush ES batch
    if (esBatch.length >= BATCH_SIZE * 2) {
      const result = await esClient.bulk({ operations: esBatch, refresh: false });
      if (result.errors) {
        console.error('Bulk ES errors on batch ending at line', lineNum);
      }
      esBatch.length = 0;
    }

    imported++;
    if (imported % 500 === 0) console.log(`  Imported ${imported} documents…`);
  }

  // Flush remaining ES batch
  if (esBatch.length > 0) {
    const result = await esClient.bulk({ operations: esBatch, refresh: true });
    if (result.errors) console.error('Bulk ES errors on final batch.');
  }

  console.log(`\nImport complete: ${imported} documents imported, ${skipped} rows skipped.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
