import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';

// 1. Province Coordinates Map
const provinceCoordinates = {
  'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
  'นนทบุรี': { lat: 13.8621, lng: 100.5144 },
  'ปทุมธานี': { lat: 14.0208, lng: 100.5251 },
  'สมุทรปราการ': { lat: 13.6057, lng: 100.6784 },
  'สมุทรสาคร': { lat: 13.5474, lng: 100.2744 },
  'นครปฐม': { lat: 13.8196, lng: 100.0443 },
  'พระนครศรีอยุธยา': { lat: 14.3692, lng: 100.5878 },
  'อ่างทอง': { lat: 14.5896, lng: 100.4550 },
  'ลพบุรี': { lat: 14.7981, lng: 100.6537 },
  'สิงห์บุรี': { lat: 14.8936, lng: 100.4046 },
  'ชัยนาท': { lat: 15.1855, lng: 100.1251 },
  'สระบุรี': { lat: 14.5289, lng: 100.9109 },
  'ราชบุรี': { lat: 13.5283, lng: 99.8135 },
  'กาญจนบุรี': { lat: 14.0228, lng: 99.5328 },
  'สุพรรณบุรี': { lat: 14.4746, lng: 100.1177 },
  'นครสวรรค์': { lat: 15.6930, lng: 100.1226 },
  'อุทัยธานี': { lat: 15.3833, lng: 100.0250 },
  'ชัยภูมิ': { lat: 15.8069, lng: 102.0305 },
  'สระแก้ว': { lat: 13.8240, lng: 102.0640 },
  'ปราจีนบุรี': { lat: 14.0509, lng: 101.3683 },
  'ฉะเชิงเทรา': { lat: 13.6904, lng: 101.0779 },
  'นครนายก': { lat: 14.2066, lng: 101.2130 },
  'เพชรบุรี': { lat: 13.1119, lng: 99.9390 },
  'ประจวบคีรีขันธ์': { lat: 11.8126, lng: 99.7957 },
  'เชียงใหม่': { lat: 18.7883, lng: 98.9853 },
  'เชียงราย': { lat: 19.9072, lng: 99.8310 },
  'ลำพูน': { lat: 18.5745, lng: 99.0087 },
  'ลำปาง': { lat: 18.2888, lng: 99.4908 },
  'อุตรดิตถ์': { lat: 17.6208, lng: 100.0993 },
  'แพร่': { lat: 18.1446, lng: 100.1402 },
  'น่าน': { lat: 18.7757, lng: 100.7730 },
  'พะเยา': { lat: 19.2154, lng: 100.2021 },
  'แม่ฮ่องสอน': { lat: 19.3005, lng: 97.9688 },
  'ตาก': { lat: 16.8839, lng: 99.1258 },
  'สุโขทัย': { lat: 17.0053, lng: 99.8265 },
  'พิษณุโลก': { lat: 16.8210, lng: 100.2659 },
  'พิจิตร': { lat: 16.4424, lng: 100.3486 },
  'กำแพงเพชร': { lat: 16.4828, lng: 99.5227 },
  'เพชรบูรณ์': { lat: 16.4183, lng: 101.1551 },
  'นครราชสีมา': { lat: 14.9799, lng: 102.0978 },
  'บุรีรัมย์': { lat: 14.9945, lng: 103.1033 },
  'สุรินทร์': { lat: 14.8818, lng: 103.4937 },
  'ศรีสะเกษ': { lat: 15.1180, lng: 104.3228 },
  'อุบลราชธานี': { lat: 15.2287, lng: 104.8570 },
  'ยโสธร': { lat: 15.7926, lng: 104.1453 },
  'หนองบัวลำภู': { lat: 17.2218, lng: 102.4260 },
  'ขอนแก่น': { lat: 16.4419, lng: 102.8356 },
  'อุดรธานี': { lat: 17.4138, lng: 102.7876 },
  'เลย': { lat: 17.4858, lng: 101.7223 },
  'หนองคาย': { lat: 17.8783, lng: 102.7422 },
  'มหาสารคาม': { lat: 16.1861, lng: 103.3020 },
  'ร้อยเอ็ด': { lat: 16.0538, lng: 103.6522 },
  'กาฬสินธุ์': { lat: 16.4318, lng: 103.5069 },
  'สกลนคร': { lat: 17.1568, lng: 104.1454 },
  'นครพนม': { lat: 17.3935, lng: 104.7696 },
  'มุกดาหาร': { lat: 16.5426, lng: 104.7208 },
  'บึงกาฬ': { lat: 18.3608, lng: 103.6466 },
  'อำนาจเจริญ': { lat: 15.8657, lng: 104.6288 },
  'ชลบุรี': { lat: 13.3611, lng: 100.9847 },
  'ระยอง': { lat: 12.6833, lng: 101.2379 },
  'จันทบุรี': { lat: 12.6112, lng: 102.1038 },
  'ตราด': { lat: 12.2428, lng: 102.5156 },
  'นครศรีธรรมราช': { lat: 8.4321, lng: 99.9628 },
  'กระบี่': { lat: 8.0863, lng: 98.9063 },
  'พังงา': { lat: 8.4510, lng: 98.5257 },
  'ภูเก็ต': { lat: 7.8804, lng: 98.3923 },
  'สุราษฎร์ธานี': { lat: 9.1382, lng: 99.3217 },
  'ระนอง': { lat: 9.9529, lng: 98.6084 },
  'ชุมพร': { lat: 10.4930, lng: 99.1800 },
  'สงขลา': { lat: 7.1756, lng: 100.4762 },
  'สตูล': { lat: 6.6238, lng: 100.0674 },
  'ตรัง': { lat: 7.5596, lng: 99.6107 },
  'พัทลุง': { lat: 7.6167, lng: 100.1627 },
  'ปัตตานี': { lat: 6.8694, lng: 101.2505 },
  'ยะลา': { lat: 6.5411, lng: 101.2810 },
  'นราธิวาส': { lat: 6.4312, lng: 101.8148 },
};

const provinces = Object.keys(provinceCoordinates);

// 2. Load the main companies JSON for lookup
const allCompaniesRaw = readFileSync(new URL('public/companies.json', import.meta.url), 'utf-8');
const allCompanies = JSON.parse(allCompaniesRaw);

// Build lookup maps
const exactMatchMap = new Map();
const keywordMatchMap = new Map();

for (const c of allCompanies) {
  if (c.companyName && c.province && c.province !== 'Unknown') {
    exactMatchMap.set(c.companyName.trim().toLowerCase(), c.province.trim());
    // Store shorter version for keyword matching (e.g. without "บริษัท" and "จำกัด")
    let shortName = c.companyName.replace(/บริษัท|จำกัด|\(มหาชน\)|สาขา.*/g, '').trim().toLowerCase();
    if (shortName.length > 5) {
      if (!keywordMatchMap.has(shortName)) {
         keywordMatchMap.set(shortName, c.province.trim());
      }
    }
  }
}

// 3. Load the Premium CSV
const premiumCsvPath = new URL('../พรีเมียม ปีงบ 2568 - Premium.csv', import.meta.url);
const premiumCsvContent = readFileSync(premiumCsvPath, 'utf-8');

const { data: premiumData, meta } = Papa.parse(premiumCsvContent, {
  header: true,
  skipEmptyLines: true,
});

// 4. Process each row
let exactCount = 0;
let keywordCount = 0;
let provinceNameCount = 0;
let defaultCount = 0;

const updatedData = premiumData.map(row => {
  const compName = row['รายชื่อสถานประกอบการ']?.trim() || '';
  const lowerName = compName.toLowerCase();
  
  let foundProvince = '';

  // Strategy 1: Exact match in our big database
  if (exactMatchMap.has(lowerName)) {
    foundProvince = exactMatchMap.get(lowerName);
    exactCount++;
  }

  // Strategy 2: Check if company name contains a province name directly (e.g. "สาขาภูเก็ต", "เชียงใหม่")
  if (!foundProvince) {
    for (const p of provinces) {
      if (compName.includes(p)) {
        foundProvince = p;
        provinceNameCount++;
        break;
      }
    }
  }

  // Strategy 3: Substring match from database
  if (!foundProvince) {
    let shortName = lowerName.replace(/บริษัท|จำกัด|\(มหาชน\)|สำนักงานใหญ่|สาขา.*/g, '').trim();
    if (shortName.length > 5) {
      for (const [key, prov] of keywordMatchMap.entries()) {
         if (shortName.includes(key) || key.includes(shortName)) {
            foundProvince = prov;
            keywordCount++;
            break;
         }
      }
    }
  }

  // Strategy 4: Default to Bangkok for major banks/corporations without a specific branch listed
  // or if we simply can't find it
  if (!foundProvince) {
    foundProvince = 'กรุงเทพมหานคร';
    defaultCount++;
  }

  row['จังหวัดที่ตั้ง'] = foundProvince;

  // Add coordinates
  const coords = provinceCoordinates[foundProvince];
  if (coords) {
    // Add a tiny random offset so markers don't overlap perfectly
    const offset = () => (Math.random() - 0.5) * 0.08;
    row['latitude'] = +(coords.lat + offset()).toFixed(6);
    row['longitude'] = +(coords.lng + offset()).toFixed(6);
  } else {
    row['latitude'] = '';
    row['longitude'] = '';
  }

  return row;
});

console.log(`Stats:
Exact Matches: ${exactCount}
Province Name in String: ${provinceNameCount}
Keyword Matches: ${keywordCount}
Defaulted to BKK: ${defaultCount}
Total Processed: ${updatedData.length}
`);

// 5. Save the updated CSV
const updatedCsv = Papa.unparse(updatedData);
const outputPath = new URL('../พรีเมียม ปีงบ 2568 - Premium.csv', import.meta.url);
writeFileSync(outputPath, updatedCsv, 'utf-8');

console.log(`✅ Saved updated CSV to: พรีเมียม ปีงบ 2568 - Premium.csv`);
