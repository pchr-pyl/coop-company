import pandas as pd

# อ่านไฟล์ Premium.csv
premium_df = pd.read_csv('พรีเมียม ปีงบ 2568 - Premium.csv')

print("สถานะข้อมูลในไฟล์ Premium.csv:")
print("=" * 80)
print(f"จำนวนแถวทั้งหมด: {len(premium_df)}")
print(f"\nคอลัมน์ที่มี: {list(premium_df.columns)}")

# ตรวจสอบค่าว่างในคอลัมน์สำนักวิชา
print(f"\nสถานะคอลัมน์ 'สำนักวิชา':")
print(f"  - มีค่า (ไม่ว่าง): {premium_df['สำนักวิชา'].notna().sum()}")
print(f"  - ค่า NaN: {premium_df['สำนักวิชา'].isna().sum()}")
print(f"  - ค่าว่าง (''): {(premium_df['สำนักวิชา'] == '').sum()}")

# แสดงค่าที่ไม่ซ้ำกันในคอลัมน์สำนักวิชา
unique_schools = premium_df['สำนักวิชา'].value_counts()
print(f"\nสำนักวิชาที่พบ ({len(unique_schools)} สำนัก):")
print("-" * 80)
for school, count in unique_schools.items():
    if pd.notna(school) and school != '':
        print(f"  {school}: {count} แถว")

# ตรวจสอบแถวที่อาจมีปัญหา
print("\n\nตัวอย่างข้อมูล 10 แถวแรก:")
print(premium_df[['ลำดับ', 'รายชื่อสถานประกอบการ', 'สำนักวิชา', 'หลักสูตร']].head(10))

# ตรวจสอบว่ามีแถวที่สำนักวิชาเป็น NaN หรือไม่
if premium_df['สำนักวิชา'].isna().sum() > 0:
    print("\n\nแถวที่สำนักวิชาเป็น NaN (10 แถวแรก):")
    nan_rows = premium_df[premium_df['สำนักวิชา'].isna()]
    print(nan_rows[['ลำดับ', 'รายชื่อสถานประกอบการ', 'สำนักวิชา', 'หลักสูตร']].head(10))
