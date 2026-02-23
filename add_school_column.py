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

# อ่านไฟล์ Premium.csv
premium_df = pd.read_csv('พรีเมียม ปีงบ 2568 - Premium.csv')

# ฟังก์ชันสำหรับหาสำนักวิชาจากหลักสูตร
def find_school(course_name):
    if pd.isna(course_name):
        return ''
    
    course_name = str(course_name).strip()
    
    # ลองหาแบบตรงทั้งหมดก่อน
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
    
    return ''

# เพิ่มคอลัมน์สำนักวิชา
premium_df['สำนักวิชา'] = premium_df['หลักสูตร'].apply(find_school)

# จัดเรียงคอลัมน์ใหม่ให้สำนักวิชาอยู่ก่อนหลักสูตร
columns = list(premium_df.columns)
course_index = columns.index('หลักสูตร')
columns.remove('สำนักวิชา')
columns.insert(course_index, 'สำนักวิชา')
premium_df = premium_df[columns]

# บันทึกไฟล์ใหม่
premium_df.to_csv('พรีเมียม ปีงบ 2568 - Premium.csv', index=False)

print("เพิ่มคอลัมน์สำนักวิชาเรียบร้อยแล้ว")
print(f"\nจำนวนแถวทั้งหมด: {len(premium_df)}")
print(f"จำนวนแถวที่หาสำนักวิชาเจอ: {premium_df['สำนักวิชา'].ne('').sum()}")
print(f"จำนวนแถวที่หาสำนักวิชาไม่เจอ: {premium_df['สำนักวิชา'].eq('').sum()}")

# แสดงตัวอย่างข้อมูล
print("\nตัวอย่างข้อมูล 5 แถวแรก:")
print(premium_df[['ลำดับ', 'รายชื่อสถานประกอบการ', 'สำนักวิชา', 'หลักสูตร']].head())
