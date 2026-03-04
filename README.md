# Co-op Map Thailand 🗺️

> **แผนที่เชิงโต้ตอบสำหรับค้นหาสถานประกอบการสหกิจศึกษา — มหาวิทยาลัยวลัยลักษณ์**

ระบบแผนที่ออนไลน์ที่ช่วยให้นักศึกษามหาวิทยาลัยวลัยลักษณ์ค้นหาและดูข้อมูลสถานประกอบการสหกิจศึกษาทั่วประเทศไทยได้ในที่เดียว พร้อมระบบค้นหาความเร็วสูงผ่าน Elasticsearch และแสดงผลบนแผนที่แบบ Real-time

---

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [Tech Stack](#2-tech-stack)
3. [โครงสร้างโปรเจกต์](#3-โครงสร้างโปรเจกต์)
4. [สถาปัตยกรรมระบบ](#4-สถาปัตยกรรมระบบ)
5. [Data Flow — ข้อมูลไหลอย่างไร](#5-data-flow--ข้อมูลไหลอย่างไร)
6. [รายละเอียด Component](#6-รายละเอียด-component)
7. [Elasticsearch: โครงสร้างข้อมูลและ Query](#7-elasticsearch-โครงสร้างข้อมูลและ-query)
8. [ข้อมูล CSV ที่มีอยู่](#8-ข้อมูล-csv-ที่มีอยู่)
9. [การติดตั้งและรันระบบ](#9-การติดตั้งและรันระบบ)
10. [ข้อดีของระบบ](#10-ข้อดีของระบบ)
11. [ข้อปรับปรุงและ Roadmap](#11-ข้อปรับปรุงและ-roadmap)

---

## 1. ภาพรวมระบบ

**Co-op Map Thailand** เป็น Web Application สำหรับนักศึกษาที่ต้องการค้นหาสถานประกอบการสหกิจศึกษา โดยมีฟีเจอร์หลักดังนี้:

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🗺️ แผนที่เชิงโต้ตอบ | แสดง marker ตำแหน่งสถานประกอบการบนแผนที่ประเทศไทย คลิก marker เพื่อดูรายละเอียด |
| 🔍 ค้นหาชื่อบริษัท | ค้นหาด้วยชื่อบริษัทหรือจังหวัด รองรับการพิมพ์ผิดเล็กน้อย (Fuzzy Search) |
| 🎓 กรองตามสำนักวิชา | เลือกสำนักวิชาที่สนใจ เช่น วิศวกรรมศาสตร์, สารสนเทศศาสตร์ |
| 📋 รายการบริษัท | แสดงรายการบริษัทที่กรองแล้วในรูปแบบ Card พร้อม Badge สี |
| 📍 Auto-fit bounds | แผนที่ปรับ viewport อัตโนมัติให้ครอบคลุมผลลัพธ์ทั้งหมด |

**ข้อมูล:** ปัจจุบันมีสถานประกอบการ **2,316 แห่ง** จาก **58 จังหวัด** และ **10 สำนักวิชา** ใน `public/companies.csv`

---

## 2. Tech Stack

### Frontend

| เทคโนโลยี | เวอร์ชัน | บทบาทในระบบ |
|-----------|---------|------------|
| **Next.js** | 15.3.9 (App Router) | Framework หลัก; จัดการ routing, SSR/CSR, API Routes |
| **React** | 19.0 | UI library; จัดการ state และ lifecycle ของ component |
| **TypeScript** | 5.7 | Type safety ทั้ง frontend และ backend; ลด runtime error |
| **Tailwind CSS** | 3.4 | Utility-first CSS; สร้าง UI รวดเร็วโดยไม่ต้องเขียน CSS แยก |
| **Leaflet** | 1.9.4 | Library แผนที่หลัก (JavaScript) |
| **React-Leaflet** | 5.0 | React wrapper สำหรับ Leaflet; ใช้ Component แทน imperative API |
| **Lucide React** | 0.474 | Icon library; ใช้ไอคอน Search, MapPin, Building2 ฯลฯ |

### Backend / API

| เทคโนโลยี | เวอร์ชัน | บทบาทในระบบ |
|-----------|---------|------------|
| **Next.js Route Handlers** | 15.3.9 | API endpoint (`/api/companies`) ทำงานบน Node.js runtime |
| **@elastic/elasticsearch** | 9.3.2 | Official TypeScript client สำหรับติดต่อ Elasticsearch cluster |

### Search Engine / Database

| เทคโนโลยี | บทบาทในระบบ |
|-----------|------------|
| **Elasticsearch** | เก็บข้อมูลสถานประกอบการ; ค้นหาด้วย `bool` query รวม full-text search + keyword filter + geo_point |

### Dev Tools

| เครื่องมือ | เวอร์ชัน | บทบาท |
|-----------|---------|------|
| **ESLint** | 9.0 (Next.js Strict) | Linting; ตรวจ code style และ React best practices |
| **PostCSS + Autoprefixer** | 8.5 / 10.4 | แปลง Tailwind CSS และเติม vendor prefix อัตโนมัติ |

### Map Tiles

- **OpenStreetMap** — แผนที่ฟรี open-source ไม่มีค่าใช้จ่าย ไม่ต้องใช้ API key

---

## 3. โครงสร้างโปรเจกต์

```
coop-company/
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout: HTML, metadata, Tailwind
│   ├── page.tsx                    # หน้าหลัก: จัดการ state + layout
│   ├── globals.css                 # Tailwind directives
│   └── api/
│       └── companies/
│           └── route.ts            # GET /api/companies — Elasticsearch query
│
├── components/                     # React Components (Client-side)
│   ├── FilterBar.tsx               # Form ค้นหา: keyword input + industry select
│   ├── MapComponent.tsx            # Leaflet map + markers + popups
│   └── CompanyList.tsx             # รายการบริษัทแบบ Card
│
├── types/
│   └── index.ts                    # TypeScript interfaces: Company, FilterState
│
├── scripts/
│   ├── elasticsearch-mapping.json  # Index mapping สำหรับสร้าง ES index
│   └── create-elasticsearch-index.ts  # Script: สร้าง index + seed ข้อมูลตัวอย่าง
│
├── public/
│   └── companies.csv               # ข้อมูลสถานประกอบการ 2,316 แห่ง (CSV)
│
├── src/                            # Legacy Vite/React source (ยังคงไว้อ้างอิง)
│   ├── App.jsx
│   ├── components/
│   └── utils/
│
├── next.config.ts                  # Next.js config: webpack externals สำหรับ Leaflet SSR
├── tailwind.config.js              # Tailwind content paths
├── tsconfig.json                   # TypeScript config (strict mode)
├── postcss.config.js               # PostCSS + Autoprefixer
└── package.json                    # Dependencies และ npm scripts
```

---

## 4. สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│   │  FilterBar  │   │ MapComponent │   │   CompanyList     │  │
│   │  (Client    │   │ (Client      │   │   (Client         │  │
│   │  Component) │   │  Component,  │   │   Component)      │  │
│   │             │   │  SSR = false)│   │                   │  │
│   └──────┬──────┘   └──────────────┘   └───────────────────┘  │
│          │  onFilter()        ↑ companies[]        ↑ companies[]│
│   ┌──────▼───────────────────────────────────────────────────┐ │
│   │                   app/page.tsx                           │ │
│   │   useState: searchKeyword, selectedIndustry, companies   │ │
│   │   useCallback: fetchCompanies()  →  fetch("/api/...")    │ │
│   └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                               │  HTTP GET /api/companies?keyword=&industry=
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Server (Node.js)                    │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │              app/api/companies/route.ts                  │ │
│   │                                                          │ │
│   │  1. Parse query params: keyword, industry                │ │
│   │  2. Build Elasticsearch bool query                       │ │
│   │     - multi_match (keyword → company_name, province)     │ │
│   │     - term (industry)                                    │ │
│   │  3. client.search() → map hits → Company[]              │ │
│   │  4. Return JSON { companies: Company[] }                 │ │
│   └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                               │  Elasticsearch REST API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Elasticsearch                            │
│                                                                 │
│   Index: coop_companies                                         │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ company_name (text + keyword)  │ industry (keyword)      │ │
│   │ province (keyword)             │ location (geo_point)    │ │
│   │ accept_interns (boolean)                                 │ │
│   └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### การแบ่ง Server Component vs Client Component

| Component | ประเภท | เหตุผล |
|-----------|--------|--------|
| `app/layout.tsx` | **Server Component** | ไม่ใช้ state/event; render ครั้งเดียว |
| `app/page.tsx` | **Client Component** (`'use client'`) | ใช้ `useState`, `useEffect`, `useCallback` |
| `FilterBar.tsx` | **Client Component** | ใช้ `useState` สำหรับ controlled inputs |
| `MapComponent.tsx` | **Client Component** + `ssr: false` | Leaflet ต้องการ `window` object ที่มีเฉพาะใน browser |
| `CompanyList.tsx` | **Client Component** | Props-driven, อยู่ในต้นไม้ client |
| `route.ts` | **Server** (Route Handler) | Node.js runtime; ติดต่อ Elasticsearch |

---

## 5. Data Flow — ข้อมูลไหลอย่างไร

```
1. ผู้ใช้เปิดหน้าเว็บ
       │
       ▼
2. page.tsx โหลด → useEffect เรียก fetchCompanies('', '')
       │
       ▼
3. fetch GET /api/companies  (ไม่มี filter → match_all query)
       │
       ▼
4. route.ts: สร้าง Elasticsearch query → client.search()
       │
       ▼
5. Elasticsearch คืน hits[] สูงสุด 200 รายการ
       │
       ▼
6. route.ts: map hits → Company[] → NextResponse.json({ companies })
       │
       ▼
7. page.tsx: setCompanies(data.companies) → re-render
       │
       ├──▶ MapComponent: วาง Marker ทุก company บนแผนที่
       │                   FitBoundsEffect: ปรับ viewport อัตโนมัติ
       │
       └──▶ CompanyList: แสดง Card รายการบริษัท
```

เมื่อผู้ใช้กรอก keyword / เลือก industry แล้วกด **"ค้นหา"**:

```
FilterBar.onFilter({ keyword, industry })
       │
       ▼
page.tsx: setSearchKeyword + setSelectedIndustry + fetchCompanies(keyword, industry)
       │
       ▼
GET /api/companies?keyword=ธนาคาร&industry=การบัญชีและการเงิน
       │
       ▼
bool: {
  must: [
    { multi_match: { query: "ธนาคาร", fields: ["company_name","province"], fuzziness: "AUTO" } },
    { term: { industry: "การบัญชีและการเงิน" } }
  ]
}
```

---

## 6. รายละเอียด Component

### `app/page.tsx` — หน้าหลัก (State Hub)

```
State ที่จัดการ:
  searchKeyword   (string)    — keyword ปัจจุบัน
  selectedIndustry (string)   — สำนักวิชาที่เลือก
  companies       (Company[]) — ผลลัพธ์จาก API
  loading         (boolean)   — สถานะ loading
  error           (string|null) — ข้อความ error

Layout:
  ┌─────────────────────────────────────────────┐
  │  Header (bg-blue-700)                       │
  ├─────────────────────────────────────────────┤
  │  FilterBar                                  │
  ├───────────────────────────┬─────────────────┤
  │  MapComponent (flex-1)    │  CompanyList    │
  │  min-h: 420px (mobile)    │  w-80/96 (lg)  │
  │  min-h: 600px (lg)        │  overflow-y-auto│
  └───────────────────────────┴─────────────────┘
```

### `components/FilterBar.tsx` — แถบค้นหา

- **Controlled inputs**: `keyword` (text), `industry` (select)
- **Submit**: เรียก `onFilter({ keyword, industry })`
- **Clear**: reset ทั้งคู่เป็น `''` แล้วเรียก `onFilter`
- **Loading state**: ปุ่ม "ค้นหา" แสดง "กำลังค้นหา…" และ `disabled` ระหว่างโหลด

### `components/MapComponent.tsx` — แผนที่

- โหลดผ่าน `next/dynamic` ด้วย `ssr: false` (Leaflet ต้องการ browser environment)
- `FitBoundsEffect`: `useMap()` + `useEffect` ปรับ viewport อัตโนมัติเมื่อ companies เปลี่ยน
- ไอคอน marker ใช้ CDN URL ของ Leaflet 1.9.4 (แก้ปัญหา webpack path resolution)
- Popup แสดง: ชื่อบริษัท, สำนักวิชา, จังหวัด, รับนักศึกษา (✅/❌)

### `components/CompanyList.tsx` — รายการบริษัท

- แสดง 3 states: loading / error / ผลลัพธ์
- แต่ละ Card มี Badge สีตาม `industry` (10 สี), ไอคอน MapPin + จังหวัด, Badge เขียว "รับนักศึกษา"
- นับจำนวน: "พบ X สถานประกอบการ"

---

## 7. Elasticsearch: โครงสร้างข้อมูลและ Query

### Index Mapping (`coop_companies`)

```json
{
  "mappings": {
    "properties": {
      "company_name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword", "ignore_above": 256 }
        }
      },
      "industry":       { "type": "keyword" },
      "province":       { "type": "keyword" },
      "location":       { "type": "geo_point" },
      "accept_interns": { "type": "boolean"  }
    }
  },
  "settings": { "number_of_shards": 1, "number_of_replicas": 0 }
}
```

**ทำไมใช้ `geo_point`?** — เปิดใช้งาน distance query เช่น `geo_distance` สำหรับค้นหา "บริษัทใกล้ฉัน" ในอนาคต

**ทำไม `company_name` มีทั้ง `text` และ `keyword` sub-field?**
- `text` (analyzed): ค้นหาแบบ full-text, แยกคำ, ค้นหาบางส่วนได้
- `keyword`: เรียงลำดับ, aggregation, exact match ได้

### ตัวอย่าง Query ที่ระบบสร้าง

**ค้นหาทุกรายการ (ไม่มี filter):**
```json
{ "query": { "match_all": {} }, "size": 200 }
```

**ค้นหาด้วย keyword อย่างเดียว:**
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "ธนาคาร",
            "fields": ["company_name", "province"],
            "fuzziness": "AUTO"
          }
        }
      ]
    }
  },
  "size": 200
}
```

**ค้นหาด้วยทั้ง keyword + industry:**
```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "โรงพยาบาล",
            "fields": ["company_name", "province"],
            "fuzziness": "AUTO"
          }
        },
        { "term": { "industry": "สาธารณสุขศาสตร์" } }
      ]
    }
  },
  "size": 200
}
```

---

## 8. ข้อมูล CSV ที่มีอยู่

ไฟล์ `public/companies.csv` มีข้อมูล **2,316 รายการ** (ไม่รวม header)

**คอลัมน์ใน CSV:**

| คอลัมน์ | ประเภท | ตัวอย่าง |
|---------|-------|---------|
| `ลำดับ` | Number | 1, 2, 3 … |
| `รายชื่อสถานประกอบการ` | Text | ธนาคารออมสิน สำนักงานใหญ่ |
| `สำนักวิชา` | Keyword | การบัญชีและการเงิน |
| `หลักสูตร` | Text | การเงิน, บัญชี |
| `จังหวัดที่ตั้ง` | Keyword | นครศรีธรรมราช |
| `latitude` | Float | 8.459205 |
| `longitude` | Float | 99.944961 |

**10 สำนักวิชาในข้อมูล:**

| สำนักวิชา |
|-----------|
| การจัดการ |
| การบัญชีและการเงิน |
| รัฐศาสตร์และนิติศาสตร์ |
| วิทยาศาสตร์ |
| วิศวกรรมศาสตร์และเทคโนโลยี |
| ศิลปศาสตร์ |
| สถาปัตยกรรมศาสตร์และการออกแบบ |
| สาธารณสุขศาสตร์ |
| สารสนเทศศาสตร์ |
| เทคโนโลยีการเกษตร |

---

## 9. การติดตั้งและรันระบบ

### ความต้องการ

- Node.js 18+ และ npm
- Elasticsearch 8.x หรือ 9.x (local หรือ cloud เช่น Elastic Cloud)

### ขั้นตอนการติดตั้ง

```bash
# 1. Clone และติดตั้ง dependencies
git clone <repo-url>
cd coop-company
npm install

# 2. สร้างไฟล์ environment variables
cp .env.local.example .env.local   # หรือสร้างใหม่
```

สร้างไฟล์ `.env.local`:
```env
ELASTICSEARCH_URL=http://localhost:9200
# ELASTICSEARCH_API_KEY=your_api_key_here   (ถ้าใช้ authentication)
```

```bash
# 3. สร้าง Elasticsearch index และ seed ข้อมูลตัวอย่าง
npx ts-node --esm scripts/create-elasticsearch-index.ts

# 4. Import ข้อมูลจาก CSV เข้า Elasticsearch (ดูหัวข้อ Import Data)

# 5. รัน Development server
npm run dev
# เปิด http://localhost:3000
```

### npm Scripts

| คำสั่ง | ผลลัพธ์ |
|--------|---------|
| `npm run dev` | รัน Next.js development server (localhost:3000) |
| `npm run build` | Build production สำหรับ deploy |
| `npm run start` | รัน production server (ต้อง build ก่อน) |
| `npm run lint` | ตรวจ code ด้วย ESLint |

### Import CSV Data เข้า Elasticsearch

สร้างสคริปต์นำเข้าข้อมูลจาก `public/companies.csv`:

```typescript
// scripts/import-csv.ts
import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';
import Papa from 'papaparse';

const client = new Client({ node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200' });

const csv = fs.readFileSync('public/companies.csv', 'utf-8');
const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

const operations = data.flatMap((row: any) => [
  { index: { _index: 'coop_companies' } },
  {
    company_name: row['รายชื่อสถานประกอบการ'],
    industry: row['สำนักวิชา'],
    province: row['จังหวัดที่ตั้ง'],
    location: { lat: parseFloat(row['latitude']), lon: parseFloat(row['longitude']) },
    accept_interns: true,
  },
]);

await client.bulk({ operations, refresh: true });
console.log(`Imported ${data.length} companies`);
```

---

## 10. ข้อดีของระบบ

### ✅ ด้านสถาปัตยกรรมและโค้ด

| ข้อดี | รายละเอียด |
|------|-----------|
| **Type Safety แบบ End-to-End** | TypeScript ทั้ง frontend และ API route; interface `Company` และ `FilterState` ใช้ร่วมกันทั้งระบบ ลด runtime error |
| **SSR + CSR ผสมกันอย่างถูกต้อง** | `layout.tsx` เป็น Server Component (เร็ว, SEO-friendly), `page.tsx` เป็น Client Component เฉพาะส่วนที่ต้องการ interactivity |
| **Leaflet SSR-safe** | ใช้ `next/dynamic` + `ssr: false` ป้องกัน `window is not defined` error ที่พบบ่อยในโปรเจกต์ Next.js + Leaflet |
| **State Management เรียบง่าย** | ไม่ต้องใช้ Redux หรือ Zustand; `useState` + `useCallback` ใน page เดียวเพียงพอ เข้าใจง่าย maintenance ง่าย |
| **Error Handling ครบถ้วน** | API คืน 502 เมื่อ ES ไม่ตอบสนอง; UI แสดง error message แยกจาก loading/empty state |

### ✅ ด้าน Search Engine

| ข้อดี | รายละเอียด |
|------|-----------|
| **Full-text Search** | `multi_match` ค้นหาทั้ง `company_name` และ `province` พร้อมกัน |
| **Fuzzy Search** | `fuzziness: "AUTO"` ทนต่อการพิมพ์ผิดเล็กน้อย เช่น "ธนาครออมสิน" หา "ธนาคารออมสิน" เจอ |
| **`geo_point` พร้อมสำหรับอนาคต** | Field `location` สามารถใช้ `geo_distance` query ค้นหาบริษัทใกล้ตำแหน่งผู้ใช้ได้ทันที |
| **`bool` query ยืดหยุ่น** | รวม full-text + exact match ใน query เดียว ขยาย filter เพิ่มได้ง่าย |

### ✅ ด้าน UX และ UI

| ข้อดี | รายละเอียด |
|------|-----------|
| **Responsive Design** | Layout ปรับตัวจาก mobile (แผนที่อยู่บน, list อยู่ล่าง) เป็น desktop (แผนที่ซ้าย, list ขวา) |
| **Auto-fit Bounds** | แผนที่ปรับ viewport ครอบคลุมผลลัพธ์ทั้งหมดอัตโนมัติ ไม่ต้อง zoom เอง |
| **Visual Feedback** | ปุ่ม disabled ระหว่าง loading, spinner text, badge สีต่าง ๆ ตามสำนักวิชา |
| **Popup ครบถ้วน** | คลิก marker ดูชื่อบริษัท, สำนักวิชา, จังหวัด, สถานะรับนักศึกษาได้ทันที |

### ✅ ด้าน Security

| ข้อดี | รายละเอียด |
|------|-----------|
| **ไม่มี CVE ที่รู้จัก** | Next.js 15.3.9 และ @elastic/elasticsearch 9.3.2 ผ่านการตรวจ GitHub Advisory Database |
| **API Key ผ่าน Environment Variable** | `ELASTICSEARCH_API_KEY` ไม่ถูก hardcode ในโค้ด |
| **ไม่มี Raw Query Injection** | ใช้ Official Elasticsearch client; ไม่ต่อ string เข้า query โดยตรง |

---

## 11. ข้อปรับปรุงและ Roadmap

### 🔴 สิ่งที่ควรทำก่อน (Critical)

| รายการ | รายละเอียด |
|--------|-----------|
| **Import CSV → Elasticsearch** | ข้อมูล 2,316 รายการใน `public/companies.csv` ยังไม่ได้ import เข้า ES index; ต้องสร้าง import script ก่อนระบบจะแสดงข้อมูลจริง |
| **Environment ชัดเจน** | เพิ่มไฟล์ `.env.local.example` เพื่อให้ developer ใหม่รู้ว่าต้องกำหนดตัวแปรอะไร |
| **สำนักวิชาใน FilterBar ไม่ตรง** | `FilterBar.tsx` มี hardcoded list 10 สำนักวิชาที่ชื่อต่างจากใน CSV บางรายการ (เช่น "วิศวกรรมศาสตร์" vs "วิศวกรรมศาสตร์และเทคโนโลยี") ควรดึงจาก ES aggregation แทน |

### 🟡 ควรปรับปรุงระยะกลาง

| รายการ | รายละเอียด |
|--------|-----------|
| **Marker Clustering** | เมื่อมีข้อมูล 2,316 จุด แผนที่จะช้าและดู messy; ใช้ `react-leaflet-cluster` เพื่อ group marker ที่อยู่ใกล้กัน |
| **Dynamic Industry List** | ดึงรายการสำนักวิชาจาก Elasticsearch aggregation (`terms` agg บน `industry` field) แทน hardcode |
| **Pagination / Infinite Scroll** | ปัจจุบัน return สูงสุด 200 รายการ; ถ้าข้อมูลมากควรใช้ pagination หรือ scroll-based loading |
| **Loading Skeleton** | เพิ่ม skeleton placeholder ใน `CompanyList` ระหว่าง loading แทนข้อความ "กำลังโหลด" เพื่อ UX ที่ดีขึ้น |
| **Debounce Search** | ค้นหา real-time ทุก keystroke โดยไม่ต้องกดปุ่ม (ใช้ `useDebounce` 300ms) |

### 🟢 Feature เพิ่มเติมในอนาคต

| Feature | รายละเอียด |
|---------|-----------|
| **ค้นหาบริษัทใกล้ฉัน** | ใช้ `navigator.geolocation` + Elasticsearch `geo_distance` query |
| **กรองตามหลักสูตร** | เพิ่ม filter `หลักสูตร` (course) ซึ่งมีอยู่ใน CSV แล้ว |
| **กรองตาม `accept_interns`** | toggle "แสดงเฉพาะที่รับนักศึกษา" |
| **Custom Marker สี** | แสดง marker สีต่างกันตามสำนักวิชา (เหมือน legacy `src/` ที่มีอยู่) |
| **Share / Permalink** | บันทึก filter ลงใน URL query string เพื่อ share ลิงก์ผลการค้นหาได้ |
| **รายละเอียดบริษัท (Detail Page)** | หน้า `/company/[id]` แสดงข้อมูลเต็ม เช่น ที่อยู่, ช่องทางการติดต่อ, จำนวนรับ |
| **Admin Panel** | หน้าจัดการข้อมูล: เพิ่ม/แก้ไข/ลบสถานประกอบการ พร้อม authentication |
| **Docker Compose** | ไฟล์ `docker-compose.yml` สำหรับ spin up Next.js + Elasticsearch ด้วยคำสั่งเดียว |
| **ภาษาอังกฤษ (i18n)** | รองรับ 2 ภาษา ไทย/อังกฤษ ด้วย `next-intl` |

---

## ตัวอย่าง `.env.local`

```env
# Elasticsearch connection
ELASTICSEARCH_URL=http://localhost:9200

# Optional: API key authentication (Elastic Cloud หรือ secured cluster)
# ELASTICSEARCH_API_KEY=VnVhQ2ZHY0JDZGViZWtD...
```

---

*Built with ❤️ for Walailak University students seeking co-op opportunities.*

