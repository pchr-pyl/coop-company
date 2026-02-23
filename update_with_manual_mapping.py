import pandas as pd
import re

# อ่านไฟล์สรุปภาพรวม.csv เพื่อสร้าง mapping ระหว่างหลักสูตรและสำนักวิชา
overview_df = pd.read_csv('พรีเมียม ปีงบ 2568 - สรุปภาพรวม.csv')

# สร้าง dictionary สำหรับ mapping หลักสูตร -> สำนักวิชา
course_to_school = {}
for _, row in overview_df.iterrows():
    course = str(row['หลักสูตร']).strip()
    school = str(row['สำนักวิชา']).strip()
    if course and course != 'nan':
        course_to_school[course] = school

# เพิ่ม manual mapping สำหรับชื่อย่อและชื่อที่ไม่ตรงกัน
manual_mapping = {
    'DCM': 'ดิจิทัลคอนเทนต์และสื่อ',
    'ท่องเที่ยว': 'อุตสาหกรรมการบริการ',
    'รปศ': 'รัฐประศาสนศาสตร์',
    'โปรเชฟ': 'ศิลปะการประกอบอาหารอย่างมืออาชีพ',
    'MTA': 'เทคโนโลยีมัลติมีเดีย แอนิเมชันและเกม',
    'สถาปัตย์': 'สถาปัตยกรรมศาสตร์',
    'รัฐศาสตร์(ปกครอง)': 'รัฐศาสตร์ (การเมืองการปกครอง)',
    'รััฐศาสตร์(IR)': 'รัฐศาสตร์(ความสัมพันธ์ระหว่างประเทศ)',
    'นิเทศศาตร์': 'นิเทศศาสตร์ดิจิทัล',
    'วิทย์กีฬา': 'วิทยาศาสตร์การกีฬาและการออกกำลังกาย',
    'วิทย์ทะเล': 'วิทยาศาสตร์ทางทะเล',
    'วิทย์ทะล': 'วิทยาศาสตร์ทางทะเล',  # typo
    'รัฐศาสตร์์(อาเซียน)': 'รัฐศาสตร์(อาเซียนศึกษา)',
    'IMI': 'นวัตกรรมสารสนเทศศาสตร์ทางการแพทย์',
    'Food Sci': 'วิทยาศาสตร์อาหารและนวัตกรรม',
    'วิศวะกรรมเครืองกล': 'วิศวกรรมเครื่องกล',
}

# แปลง manual mapping ให้เป็นชื่อเต็มที่มีสำนักวิชา
manual_course_to_school = {}
for short_name, full_name in manual_mapping.items():
    # หาสำนักวิชาจากชื่อเต็ม
    found = False
    for course_key, school in course_to_school.items():
        # ตัดตัวเลขท้ายออก
        course_clean = re.sub(r'\s*\d+\s*$', '', course_key).strip()
        full_clean = re.sub(r'\s*\d+\s*$', '', full_name).strip()
        
        if course_clean == full_clean or full_clean in course_clean or course_clean in full_clean:
            manual_course_to_school[short_name] = school
            found = True
            break
    
    if not found:
        print(f"⚠️  ไม่พบสำนักวิชาสำหรับ: {short_name} -> {full_name}")

# อ่านไฟล์ Premium.csv
premium_df = pd.read_csv('พรีเมียม ปีงบ 2568 - Premium.csv')

# ฟังก์ชันสำหรับหาสำนักวิชาจากหลักสูตร
def find_school(course_name):
    if pd.isna(course_name):
        return None
    
    course_name = str(course_name).strip()
    
    # ลองหาใน manual mapping ก่อน
    if course_name in manual_course_to_school:
        return manual_course_to_school[course_name]
    
    # ลองหาแบบตรงทั้งหมด
    if course_name in course_to_school:
        return course_to_school[course_name]
    
    # ถ้าไม่เจอ ลองหาแบบ partial match
    for course_key, school in course_to_school.items():
        # ลบตัวเลขและช่องว่างออกเพื่อเปรียบเทียบ
        course_clean = re.sub(r'\s*\d+\s*$', '', course_key).strip()
        input_clean = re.sub(r'\s*\d+\s*$', '', course_name).strip()
        
        if course_clean == input_clean:
            return school
        
        # ลองหาแบบ contains
        if course_clean in input_clean or input_clean in course_clean:
            return school
    
    return None

# อัปเดตคอลัมน์สำนักวิชา
premium_df['สำนักวิชา'] = premium_df['หลักสูตร'].apply(find_school)

# บันทึกไฟล์
premium_df.to_csv('พรีเมียม ปีงบ 2568 - Premium.csv', index=False)

print("✓ อัปเดตคอลัมน์สำนักวิชาเรียบร้อยแล้ว")
print(f"\nจำนวนแถวทั้งหมด: {len(premium_df)}")
print(f"จำนวนแถวที่หาสำนักวิชาเจอ: {premium_df['สำนักวิชา'].notna().sum()}")
print(f"จำนวนแถวที่หาสำนักวิชาไม่เจอ: {premium_df['สำนักวิชา'].isna().sum()}")

# แสดงสถิติตาม manual mapping
print("\n\nสถิติการ mapping ที่เพิ่มเข้ามา:")
print("-" * 80)
for short_name, school in manual_course_to_school.items():
    count = len(premium_df[(premium_df['หลักสูตร'] == short_name) & (premium_df['สำนักวิชา'] == school)])
    if count > 0:
        print(f"  {short_name:30} -> {school:30} ({count} แถว)")

# ตรวจสอบว่ายังมีหลักสูตรที่หาไม่เจออยู่ไหม
if premium_df['สำนักวิชา'].isna().sum() > 0:
    print("\n\nหลักสูตรที่ยังหาสำนักวิชาไม่เจอ:")
    missing = premium_df[premium_df['สำนักวิชา'].isna()]['หลักสูตร'].value_counts()
    for course, count in missing.items():
        print(f"  {course}: {count} แถว")
