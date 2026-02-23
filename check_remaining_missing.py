import pandas as pd

# อ่านไฟล์ Premium.csv
premium_df = pd.read_csv('พรีเมียม ปีงบ 2568 - Premium.csv')

# กรองเฉพาะแถวที่สำนักวิชาเป็น NaN
missing_schools = premium_df[premium_df['สำนักวิชา'].isna()]

print(f"จำนวนแถวที่ยังหาสำนักวิชาไม่เจอ: {len(missing_schools)}")

# ตรวจสอบว่าแถวเหล่านี้มีข้อมูลหลักสูตรหรือไม่
print(f"\nแถวที่มีหลักสูตร: {missing_schools['หลักสูตร'].notna().sum()}")
print(f"แถวที่ไม่มีหลักสูตร (NaN): {missing_schools['หลักสูตร'].isna().sum()}")

# แสดงหลักสูตรที่ยังหาสำนักวิชาไม่เจอ
if missing_schools['หลักสูตร'].notna().sum() > 0:
    print("\n\nหลักสูตรที่ยังหาสำนักวิชาไม่เจอ:")
    print("=" * 80)
    course_counts = missing_schools[missing_schools['หลักสูตร'].notna()]['หลักสูตร'].value_counts()
    for course, count in course_counts.items():
        print(f"  {course}: {count} แถว")
else:
    print("\n✓ ทุกแถวที่มีหลักสูตรได้ถูก map กับสำนักวิชาแล้ว")
    print("  แถวที่เหลือคือแถวที่ไม่มีข้อมูลหลักสูตรตั้งแต่แรก")

# แสดงตัวอย่างแถวที่ไม่มีหลักสูตร
print("\n\nตัวอย่างแถวที่ไม่มีข้อมูลหลักสูตร (10 แถวแรก):")
no_course = missing_schools[missing_schools['หลักสูตร'].isna()]
if len(no_course) > 0:
    print(no_course[['ลำดับ', 'รายชื่อสถานประกอบการ', 'หลักสูตร', 'จังหวัดที่ตั้ง']].head(10).to_string())
