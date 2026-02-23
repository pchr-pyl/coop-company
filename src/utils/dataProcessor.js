import Papa from 'papaparse';

// ---------------------------------------------------------------------------
// Load & parse the Premium CSV  (public/companies.csv)
// Columns: ลำดับ, รายชื่อสถานประกอบการ, สำนักวิชา, หลักสูตร, จังหวัดที่ตั้ง, latitude, longitude
// ---------------------------------------------------------------------------

export async function loadCompanies() {
  const response = await fetch('/companies.csv');
  if (!response.ok) throw new Error(`ไม่สามารถโหลดข้อมูลได้: ${response.status}`);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length && !data.length) {
          reject(new Error('CSV parse error: ' + errors[0].message));
          return;
        }
        const companies = data
          .map((row, idx) => {
            const lat = parseFloat(row['latitude']);
            const lng = parseFloat(row['longitude']);
            return {
              id: idx + 1,
              index: row['ลำดับ']?.trim() ?? String(idx + 1),
              companyName: row['รายชื่อสถานประกอบการ']?.trim() ?? '',
              faculty: row['สำนักวิชา']?.trim() ?? '',
              program: row['หลักสูตร']?.trim() ?? '',
              province: row['จังหวัดที่ตั้ง']?.trim() ?? '',
              lat: isNaN(lat) ? null : lat,
              lng: isNaN(lng) ? null : lng,
            };
          })
          .filter(c => c.companyName);
        resolve(companies);
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

// ---------------------------------------------------------------------------
// Helper selectors
// ---------------------------------------------------------------------------

export function getUniqueFaculties(companies) {
  if (!companies?.length) return [];
  return [...new Set(companies.map(c => c.faculty).filter(Boolean))].sort();
}

export function getUniquePrograms(companies, faculty) {
  if (!companies?.length) return [];
  const src = faculty ? companies.filter(c => c.faculty === faculty) : companies;
  return [...new Set(src.map(c => c.program).filter(Boolean))].sort();
}

export function getUniqueProvinces(companies) {
  if (!companies?.length) return [];
  return [...new Set(companies.map(c => c.province).filter(Boolean))].sort();
}

// Legacy stubs so any old imports don't break
export function getUniqueRegions() { return []; }
export function getUniqueCareerFields() { return []; }
