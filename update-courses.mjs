import { readFileSync, writeFileSync } from 'fs';
import Papa from 'papaparse';

const courseMap = {
  'DCM': 'ดิจิทัลคอนเทนต์และสื่อ',
  'ท่องเที่ยว': 'อุตสาหกรรมการบริการ',
  'รปศ': 'รัฐประศาสนศาสตร์',
  'โปรเชฟ': 'ศิลปะการประกอบอาหารอย่างมืออาชีพ',
  'MTA': 'เทคโนโลยีมัลติมีเดีย แอนิเมชันและเกม',
  'สถาปัตย์': 'สถาปัตยกรรมศาสตร์',
  'รัฐศาสตร์(ปกครอง)': 'รัฐศาสตร์ (การเมืองการปกครอง)',
  'รััฐศาสตร์(IR)': 'รัฐศาสตร์(ความสัมพันธ์ระหว่างประเทศ)', // User spelling with double vowel
  'รัฐศาสตร์(IR)': 'รัฐศาสตร์(ความสัมพันธ์ระหว่างประเทศ)',
  'นิเทศศาตร์': 'นิเทศศาสตร์ดิจิทัล', // User spelling missing 'ส'
  'นิเทศศาสตร์': 'นิเทศศาสตร์ดิจิทัล',
  'วิทย์กีฬา': 'วิทยาศาสตร์การกีฬาและการออกกำลังกาย',
  'วิทย์ทะเล': 'วิทยาศาสตร์ทางทะเล',
  'รัฐศาสตร์์(อาเซียน)': 'รัฐศาสตร์(อาเซียนศึกษา)', // User spelling with karant
  'รัฐศาสตร์(อาเซียน)': 'รัฐศาสตร์(อาเซียนศึกษา)',
  'IMI': 'นวัตกรรมสารสนเทศศาสตร์ทางการแพทย์',
  'Food Sci': 'วิทยาศาสตร์อาหารและนวัตกรรม',
  'วิศวะกรรมเครืองกล': 'วิศวกรรมเครื่องกล', // User spelling
  'วิศวกรรมเครืองกล': 'วิศวกรรมเครื่องกล', // Another variation
};

// 1. Load the CSV
const csvPath = new URL('../พรีเมียม ปีงบ 2568 - Premium_Updated.csv', import.meta.url);
const csvContent = readFileSync(csvPath, 'utf-8');

const { data, meta } = Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
});

// 2. Replace the course names
let updatedCount = 0;

const updatedData = data.map(row => {
  if (row['หลักสูตร']) {
    const originalCourse = row['หลักสูตร'].trim();
    // Use case-insensitive matching for English abbreviations and exact for Thai
    let foundMatch = null;
    
    for (const [key, value] of Object.entries(courseMap)) {
      if (originalCourse.toLowerCase() === key.toLowerCase()) {
        foundMatch = value;
        break;
      }
    }

    if (foundMatch && originalCourse !== foundMatch) {
      row['หลักสูตร'] = foundMatch;
      updatedCount++;
    }
  }
  return row;
});

// 3. Save the updated CSV
const updatedCsv = Papa.unparse(updatedData);
writeFileSync(csvPath, updatedCsv, 'utf-8');

console.log(`✅ Updated ${updatedCount} course names in: พรีเมียม ปีงบ 2568 - Premium_Updated.csv`);
