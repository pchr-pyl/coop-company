/**
 * Shared constants used by both the frontend components and the API routes.
 * Industry names are sourced from the actual CSV dataset — keep in sync with
 * the `สำนักวิชา` column values.
 */

/** All 10 faculties/industries in the dataset (correct Thai names). */
export const INDUSTRIES: readonly string[] = [
  'การจัดการ',
  'การบัญชีและการเงิน',
  'รัฐศาสตร์และนิติศาสตร์',
  'วิทยาศาสตร์',
  'วิศวกรรมศาสตร์และเทคโนโลยี',
  'ศิลปศาสตร์',
  'สถาปัตยกรรมศาสตร์และการออกแบบ',
  'สาธารณสุขศาสตร์',
  'สารสนเทศศาสตร์',
  'เทคโนโลยีการเกษตร',
] as const;

/**
 * All 58 distinct locations in the dataset (Thai provinces + international).
 * International entries are kept because the data includes overseas internships.
 */
export const LOCATIONS: readonly string[] = [
  'กระบี่',
  'กรุงเทพมหานคร',
  'ขอนแก่น',
  'จันทบุรี',
  'จีน',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'ชัยนาท',
  'ชุมพร',
  'ญี่ปุ่น',
  'ตรัง',
  'นครนายก',
  'นครปฐม',
  'นครราชสีมา',
  'นครศรีธรรมราช',
  'นนทบุรี',
  'นราธิวาส',
  'น่าน',
  'บึงกาฬ',
  'ปทุมธานี',
  'ประจวบคีรีขันธ์',
  'ปราจีนบุรี',
  'ปัตตานี',
  'พระนครศรีอยุธยา',
  'พังงา',
  'พัทลุง',
  'พิษณุโลก',
  'ภูเก็ต',
  'มาเลเซีย',
  'ยะลา',
  'ระนอง',
  'ระยอง',
  'ราชบุรี',
  'ลพบุรี',
  'ลำพูน',
  'สงขลา',
  'สตูล',
  'สมุทรปราการ',
  'สมุทรสงคราม',
  'สมุทรสาคร',
  'สระบุรี',
  'สวีเดน',
  'สาธารณรัฐประชาธิปไตยประชาชนลาว',
  'สิงคโปร์',
  'สิงห์บุรี',
  'สุพรรณบุรี',
  'สุราษฎร์ธานี',
  'สุรินทร์',
  'ออสเตรเลีย',
  'อินเดีย',
  'อินโดนีเซีย',
  'เชียงราย',
  'เชียงใหม่',
  'เยอรมัน',
  'เลย',
  'เวียดนาม',
  'แคนาดา',
  'ไต้หวัน',
] as const;

/** Default geo-search radius when "Near Me" is active (kilometres). */
export const DEFAULT_RADIUS_KM = 50;

/** Walailak University coordinates — default map centre. */
export const WU_CENTER: [number, number] = [8.6428, 99.8973];
