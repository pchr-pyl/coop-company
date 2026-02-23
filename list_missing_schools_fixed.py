import pandas as pd

# อ่านไฟล์ Premium.csv
premium_df = pd.read_csv('พรีเมียม ปีงบ 2568 - Premium.csv')

# กรองเฉพาะแถวที่สำนักวิชาเป็น NaN
missing_schools = premium_df[premium_df['สำนักวิชา'].isna()]

# นับจำนวนแต่ละหลักสูตรที่ไม่เจอสำนักวิชา
course_counts = missing_schools['หลักสูตร'].value_counts()

print("รายการหลักสูตรที่หาสำนักวิชาไม่เจอ:")
print("=" * 80)
print(f"\n{'หลักสูตร':<50} {'จำนวน':>10}")
print("-" * 80)

for course, count in course_counts.items():
    print(f"{str(course):<50} {count:>10}")

print("-" * 80)
print(f"{'รวมทั้งหมด':<50} {len(missing_schools):>10}")
print(f"{'จำนวนหลักสูตรที่ไม่ซ้ำกัน':<50} {len(course_counts):>10}")

# บันทึกเป็นไฟล์ CSV สำหรับดูรายละเอียด
missing_schools[['ลำดับ', 'รายชื่อสถานประกอบการ', 'หลักสูตร', 'จังหวัดที่ตั้ง']].to_csv(
    'หลักสูตรที่หาสำนักวิชาไม่เจอ.csv', 
    index=False
)
print("\n✓ บันทึกรายละเอียดเป็นไฟล์ 'หลักสูตรที่หาสำนักวิชาไม่เจอ.csv' แล้ว")

# แสดงตัวอย่างข้อมูล
print("\n\nตัวอย่างข้อมูลที่หาสำนักวิชาไม่เจอ (10 แถวแรก):")
print(missing_schools[['ลำดับ', 'รายชื่อสถานประกอบการ', 'หลักสูตร']].head(10).to_string())
