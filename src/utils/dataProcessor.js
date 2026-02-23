import Papa from 'papaparse';

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

const provinceToRegion = {
  'กรุงเทพมหานคร': 'Bangkok',
  'นนทบุรี': 'Central', 'ปทุมธานี': 'Central', 'สมุทรปราการ': 'Central',
  'สมุทรสาคร': 'Central', 'นครปฐม': 'Central', 'พระนครศรีอยุธยา': 'Central',
  'อ่างทอง': 'Central', 'ลพบุรี': 'Central', 'สิงห์บุรี': 'Central',
  'ชัยนาท': 'Central', 'สระบุรี': 'Central', 'ราชบุรี': 'Central',
  'กาญจนบุรี': 'Central', 'สุพรรณบุรี': 'Central', 'นครสวรรค์': 'Central',
  'อุทัยธานี': 'Central', 'ชัยภูมิ': 'Central', 'สระแก้ว': 'Central',
  'ปราจีนบุรี': 'Central', 'ฉะเชิงเทรา': 'Central', 'นครนายก': 'Central',
  'เพชรบุรี': 'Central', 'ประจวบคีรีขันธ์': 'Central',
  'เชียงใหม่': 'North', 'เชียงราย': 'North', 'ลำพูน': 'North',
  'ลำปาง': 'North', 'อุตรดิตถ์': 'North', 'แพร่': 'North',
  'น่าน': 'North', 'พะเยา': 'North', 'แม่ฮ่องสอน': 'North',
  'ตาก': 'North', 'สุโขทัย': 'North', 'พิษณุโลก': 'North',
  'พิจิตร': 'North', 'กำแพงเพชร': 'North', 'เพชรบูรณ์': 'North',
  'นครราชสีมา': 'Northeast', 'บุรีรัมย์': 'Northeast', 'สุรินทร์': 'Northeast',
  'ศรีสะเกษ': 'Northeast', 'อุบลราชธานี': 'Northeast', 'ยโสธร': 'Northeast',
  'หนองบัวลำภู': 'Northeast', 'ขอนแก่น': 'Northeast', 'อุดรธานี': 'Northeast',
  'เลย': 'Northeast', 'หนองคาย': 'Northeast', 'มหาสารคาม': 'Northeast',
  'ร้อยเอ็ด': 'Northeast', 'กาฬสินธุ์': 'Northeast', 'สกลนคร': 'Northeast',
  'นครพนม': 'Northeast', 'มุกดาหาร': 'Northeast', 'บึงกาฬ': 'Northeast',
  'อำนาจเจริญ': 'Northeast',
  'ชลบุรี': 'East', 'ระยอง': 'East', 'จันทบุรี': 'East', 'ตราด': 'East',
  'นครศรีธรรมราช': 'South', 'กระบี่': 'South', 'พังงา': 'South',
  'ภูเก็ต': 'South', 'สุราษฎร์ธานี': 'South', 'ระนอง': 'South',
  'ชุมพร': 'South', 'สงขลา': 'South', 'สตูล': 'South',
  'ตรัง': 'South', 'พัทลุง': 'South', 'ปัตตานี': 'South',
  'ยะลา': 'South', 'นราธิวาส': 'South',
};

const careerFieldKeywords = [
  { field: 'Tech & Data', keywords: ['เทคโนโลยี', 'ไอที', 'ซอฟต์แวร์', 'คอมพิวเตอร์', 'ดิจิทัล', 'โปรแกรม', 'ข้อมูล', 'tech', 'it ', 'software', 'digital', 'data', 'ai', 'cyber', 'network', 'เน็ตเวิร์ก', 'ระบบ', 'แอป', 'เว็บ'] },
  { field: 'Engineering', keywords: ['วิศวกร', 'ก่อสร้าง', 'โยธา', 'เครื่องกล', 'ไฟฟ้า', 'อิเล็กทรอนิกส์', 'โรงงาน', 'ผลิต', 'engineer', 'construction', 'industrial', 'manufacturing', 'โดรน', 'ยานยนต์'] },
  { field: 'Health & Medical', keywords: ['โรงพยาบาล', 'คลินิก', 'แพทย์', 'พยาบาล', 'เภสัช', 'ยา', 'สุขภาพ', 'การแพทย์', 'วิทยาศาสตร์การแพทย์', 'hospital', 'medical', 'health', 'clinic', 'pharma', 'dental', 'ทันต'] },
  { field: 'Finance & Banking', keywords: ['ธนาคาร', 'การเงิน', 'บัญชี', 'ประกัน', 'ลงทุน', 'bank', 'finance', 'accounting', 'insurance', 'investment', 'ตลาดหลักทรัพย์'] },
  { field: 'Education', keywords: ['โรงเรียน', 'มหาวิทยาลัย', 'วิทยาลัย', 'สถาบัน', 'การศึกษา', 'school', 'university', 'college', 'academy', 'institute', 'อนุบาล', 'สอน'] },
  { field: 'Government', keywords: ['เทศบาล', 'อบต', 'อำเภอ', 'ศุลกากร', 'กรม', 'กระทรวง', 'สำนักงาน', 'ราชการ', 'รัฐ', 'municipal', 'government', 'district', 'customs', 'ministry', 'กอง', 'ด่าน'] },
  { field: 'Business & Trade', keywords: ['บริษัท', 'ห้างหุ้นส่วน', 'ร้าน', 'ค้า', 'นำเข้า', 'ส่งออก', 'logistics', 'โลจิสติกส์', 'ขนส่ง', 'จัดจำหน่าย', 'trading', 'import', 'export'] },
  { field: 'Agriculture', keywords: ['เกษตร', 'ยาง', 'ปาล์ม', 'ข้าว', 'ประมง', 'ปศุสัตว์', 'สวน', 'ฟาร์ม', 'agriculture', 'farm', 'rubber', 'fishery', 'plantation'] },
  { field: 'Media & Creative', keywords: ['สื่อ', 'โฆษณา', 'ออกแบบ', 'สตูดิโอ', 'ภาพยนตร์', 'ดนตรี', 'ศิลปะ', 'media', 'studio', 'design', 'creative', 'film', 'music', 'art', 'เกม', 'game'] },
  { field: 'Hospitality & Tourism', keywords: ['โรงแรม', 'รีสอร์ท', 'ท่องเที่ยว', 'ภัตตาคาร', 'อาหาร', 'hotel', 'resort', 'tourism', 'restaurant', 'food', 'spa', 'travel'] },
];

function getCareerFields(companyName) {
  if (!companyName) return ['General'];
  const name = companyName.toLowerCase();
  const matched = [];
  for (const { field, keywords } of careerFieldKeywords) {
    if (keywords.some(kw => name.includes(kw.toLowerCase()))) {
      matched.push(field);
    }
  }
  return matched.length > 0 ? matched : ['General'];
}

function getRegion(provinceName) {
  if (!provinceName) return 'Unknown';
  return provinceToRegion[provinceName.trim()] ?? 'Unknown';
}

function getCoords(provinceName) {
  const coords = provinceCoordinates[provinceName?.trim()] ?? { lat: 13.7563, lng: 100.5018 };
  const offset = () => (Math.random() - 0.5) * 0.08;
  return { lat: coords.lat + offset(), lng: coords.lng + offset() };
}

export async function loadCompanies() {
  // Load pre-processed JSON data (generated by python script)
  const response = await fetch('/companies.json');
  if (!response.ok) throw new Error(`Failed to fetch companies data: ${response.status}`);
  const data = await response.json();
  return data;
}

export function getUniqueRegions(companies) {
  if (!companies?.length) return [];
  return [...new Set(companies.map(c => c.region).filter(Boolean))].sort();
}

export function getUniqueProvinces(companies, region) {
  if (!companies?.length) return [];
  const filtered = region ? companies.filter(c => c.region === region) : companies;
  return [...new Set(filtered.map(c => c.province).filter(Boolean))].sort();
}

export function getUniqueCareerFields(companies) {
  if (!companies?.length) return [];
  const fields = new Set();
  companies.forEach(c => c.careerFields?.forEach(f => fields.add(f)));
  return [...fields].sort();
}
