import pandas as pd
import json

# 1. โหลดข้อมูล CSV
df = pd.read_csv('รายชื่อสถานประกอบการทั้งหมด 19 Feb 2026.csv')

# 2. ข้อมูลภูมิภาคและพิกัดครบทั้ง 77 จังหวัด + ประเทศอื่น
province_data = {
    # ภาคกลาง (Central)
    "กรุงเทพมหานคร": {"region": "Central", "lat": 13.7563, "lng": 100.5018},
    "กำแพงเพชร": {"region": "Central", "lat": 16.4823, "lng": 99.5227},
    "ชัยนาท": {"region": "Central", "lat": 15.1851, "lng": 100.1255},
    "นครนายก": {"region": "Central", "lat": 14.2069, "lng": 101.2131},
    "นครปฐม": {"region": "Central", "lat": 13.8196, "lng": 100.0443},
    "นครสวรรค์": {"region": "Central", "lat": 15.6930, "lng": 100.1226},
    "นนทบุรี": {"region": "Central", "lat": 13.8621, "lng": 100.5144},
    "ปทุมธานี": {"region": "Central", "lat": 14.0208, "lng": 100.5250},
    "พระนครศรีอยุธยา": {"region": "Central", "lat": 14.3692, "lng": 100.5877},
    "พิจิตร": {"region": "Central", "lat": 16.4424, "lng": 100.3489},
    "พิษณุโลก": {"region": "Central", "lat": 16.8298, "lng": 100.2707},
    "เพชรบูรณ์": {"region": "Central", "lat": 16.4183, "lng": 101.1568},
    "ลพบุรี": {"region": "Central", "lat": 14.7995, "lng": 100.6534},
    "สมุทรปราการ": {"region": "Central", "lat": 13.5991, "lng": 100.5998},
    "สมุทรสงคราม": {"region": "Central", "lat": 13.4094, "lng": 100.0022},
    "สมุทรสาคร": {"region": "Central", "lat": 13.5476, "lng": 100.2744},
    "สระบุรี": {"region": "Central", "lat": 14.5289, "lng": 100.9109},
    "สิงห์บุรี": {"region": "Central", "lat": 14.8913, "lng": 100.4083},
    "สุโขทัย": {"region": "Central", "lat": 17.0056, "lng": 99.8265},
    "สุพรรณบุรี": {"region": "Central", "lat": 14.4745, "lng": 100.1175},
    "อ่างทอง": {"region": "Central", "lat": 14.5896, "lng": 100.4550},
    "อุทัยธานี": {"region": "Central", "lat": 15.3833, "lng": 100.0255},
    "สระแก้ว": {"region": "Central", "lat": 13.8245, "lng": 102.0645},
    
    # ภาคเหนือ (North)
    "เชียงใหม่": {"region": "North", "lat": 18.7883, "lng": 98.9853},
    "เชียงราย": {"region": "North", "lat": 19.9072, "lng": 99.8328},
    "ลำปาง": {"region": "North", "lat": 18.2888, "lng": 99.4909},
    "ลำพูน": {"region": "North", "lat": 18.5754, "lng": 99.0087},
    "แม่ฮ่องสอน": {"region": "North", "lat": 19.3013, "lng": 97.9683},
    "น่าน": {"region": "North", "lat": 18.7757, "lng": 100.7731},
    "พะเยา": {"region": "North", "lat": 19.2145, "lng": 100.2024},
    "แพร่": {"region": "North", "lat": 18.1446, "lng": 100.1413},
    "อุตรดิตถ์": {"region": "North", "lat": 17.6207, "lng": 100.0993},
    "ตาก": {"region": "North", "lat": 16.8839, "lng": 99.1258},
    "สุโขทัย": {"region": "North", "lat": 17.0056, "lng": 99.8265},
    "พิษณุโลก": {"region": "North", "lat": 16.8298, "lng": 100.2707},
    
    # ภาคตะวันออกเฉียงเหนือ (Northeast)
    "กาฬสินธุ์": {"region": "Northeast", "lat": 16.4328, "lng": 103.5061},
    "ขอนแก่น": {"region": "Northeast", "lat": 16.4419, "lng": 102.8350},
    "ชัยภูมิ": {"region": "Northeast", "lat": 15.8069, "lng": 102.0315},
    "นครพนม": {"region": "Northeast", "lat": 17.3926, "lng": 104.7696},
    "นครราชสีมา": {"region": "Northeast", "lat": 14.9799, "lng": 102.0977},
    "บึงกาฬ": {"region": "Northeast", "lat": 18.3608, "lng": 103.6466},
    "บุรีรัมย์": {"region": "Northeast", "lat": 14.9942, "lng": 103.1030},
    "มหาสารคาม": {"region": "Northeast", "lat": 16.1962, "lng": 103.3036},
    "มุกดาหาร": {"region": "Northeast", "lat": 16.5428, "lng": 104.7228},
    "ยโสธร": {"region": "Northeast", "lat": 15.7940, "lng": 104.1456},
    "ร้อยเอ็ด": {"region": "Northeast", "lat": 16.0568, "lng": 103.6529},
    "เลย": {"region": "Northeast", "lat": 17.4860, "lng": 101.7223},
    "สกลนคร": {"region": "Northeast", "lat": 17.1547, "lng": 104.1349},
    "สุรินทร์": {"region": "Northeast", "lat": 14.8818, "lng": 103.4937},
    "ศรีสะเกษ": {"region": "Northeast", "lat": 15.1183, "lng": 104.3224},
    "หนองคาย": {"region": "Northeast", "lat": 17.8783, "lng": 102.7411},
    "หนองบัวลำภู": {"region": "Northeast", "lat": 17.2218, "lng": 102.4260},
    "อุดรธานี": {"region": "Northeast", "lat": 17.4137, "lng": 102.7872},
    "อุบลราชธานี": {"region": "Northeast", "lat": 15.2287, "lng": 104.8564},
    "อำนาจเจริญ": {"region": "Northeast", "lat": 15.8657, "lng": 104.6285},
    "หนองบัวลำภู": {"region": "Northeast", "lat": 17.2218, "lng": 102.4260},
    "บึงกาฬ": {"region": "Northeast", "lat": 18.3608, "lng": 103.6466},
    
    # ภาคตะวันออก (East)
    "จันทบุรี": {"region": "East", "lat": 12.6112, "lng": 102.1038},
    "ฉะเชิงเทรา": {"region": "East", "lat": 13.6904, "lng": 101.0779},
    "ชลบุรี": {"region": "East", "lat": 13.3611, "lng": 100.9847},
    "ตราด": {"region": "East", "lat": 12.2420, "lng": 102.5175},
    "ปราจีนบุรี": {"region": "East", "lat": 14.0509, "lng": 101.3728},
    "ระยอง": {"region": "East", "lat": 12.6814, "lng": 101.2816},
    "สระแก้ว": {"region": "East", "lat": 13.8245, "lng": 102.0645},
    
    # ภาคตะวันตก (West)
    "กาญจนบุรี": {"region": "West", "lat": 14.0227, "lng": 99.5328},
    "ตาก": {"region": "West", "lat": 16.8839, "lng": 99.1258},
    "ประจวบคีรีขันธ์": {"region": "West", "lat": 11.7939, "lng": 99.7959},
    "เพชรบุรี": {"region": "West", "lat": 13.1112, "lng": 99.9391},
    "ราชบุรี": {"region": "West", "lat": 13.5283, "lng": 99.8134},
    
    # ภาคใต้ (South)
    "กระบี่": {"region": "South", "lat": 8.0863, "lng": 98.9063},
    "ชุมพร": {"region": "South", "lat": 10.4930, "lng": 99.1800},
    "ตรัง": {"region": "South", "lat": 7.5596, "lng": 99.6104},
    "นครศรีธรรมราช": {"region": "South", "lat": 8.4320, "lng": 99.9629},
    "นราธิวาส": {"region": "South", "lat": 6.4316, "lng": 101.5750},
    "ปัตตานี": {"region": "South", "lat": 6.8694, "lng": 101.2517},
    "พังงา": {"region": "South", "lat": 8.4510, "lng": 98.5314},
    "พัทลุง": {"region": "South", "lat": 7.6167, "lng": 100.3333},
    "ภูเก็ต": {"region": "South", "lat": 7.8804, "lng": 98.3923},
    "ยะลา": {"region": "South", "lat": 6.5505, "lng": 101.2916},
    "ระนอง": {"region": "South", "lat": 9.9596, "lng": 98.6401},
    "สงขลา": {"region": "South", "lat": 7.1756, "lng": 100.6143},
    "สตูล": {"region": "South", "lat": 6.6238, "lng": 100.0674},
    "สุราษฎร์ธานี": {"region": "South", "lat": 9.1382, "lng": 99.3217},
    
    # ประเทศอื่น (International)
    "ญี่ปุ่น": {"region": "International", "lat": 36.2048, "lng": 138.2529},
    "ไต้หวัน": {"region": "International", "lat": 23.6978, "lng": 120.9605},
    "อินโดนีเซีย": {"region": "International", "lat": -0.7893, "lng": 113.9213},
    "จีน": {"region": "International", "lat": 35.8617, "lng": 104.1954},
    "มาเลเซีย": {"region": "International", "lat": 4.2105, "lng": 101.9758},
    "สิงคโปร์": {"region": "International", "lat": 1.3521, "lng": 103.8198},
    "เวียดนาม": {"region": "International", "lat": 14.0583, "lng": 108.2772},
    "เกาหลีใต้": {"region": "International", "lat": 35.9078, "lng": 127.7669},
}

def get_location_info(province):
    """รับข้อมูลภูมิภาคและพิกัดจากชื่อจังหวัด"""
    prov = str(province).strip()
    return province_data.get(prov, {"region": "Unknown", "lat": 15.8700, "lng": 100.9925})

def guess_career_fields(company_name):
    """วิเคราะห์สายงานจากชื่อบริษัท"""
    name = str(company_name).lower()
    fields = []
    
    # Tech & Data
    tech_keywords = ['เทคโนโลยี', 'ซอฟต์แวร์', 'ไอที', 'คอมพิวเตอร์', 'ดิจิทัล', 
                     'technology', 'software', 'it ', 'computer', 'digital', 'data',
                     'cyber', 'programming', 'coding', 'web', 'app', 'ai', 'ปัญญาประดิษฐ์',
                     'machine learning', 'iot', 'cloud', 'network', 'cybersecurity']
    if any(word in name for word in tech_keywords):
        fields.append("Tech & Data")
    
    # Business & Management
    business_keywords = ['ธนาคาร', 'พาณิชย์', 'การบัญชี', 'การตลาด', 'โลจิสติกส์', 
                         'บริษัท', 'bank', 'finance', 'marketing', 'accounting',
                         'business', 'management', 'consulting', 'commerce', 'trade',
                         'investment', 'insurance', 'หลักทรัพย์', 'ประกันภัย']
    if any(word in name for word in business_keywords):
        fields.append("Business & Management")
    
    # Engineering & Architecture
    engineering_keywords = ['วิศวกรรม', 'ก่อสร้าง', 'อุตสาหกรรม', 
                            'engineering', 'construction', 'industrial', 'architect',
                            'mechanic', 'electrical', 'civil', 'manufacturing',
                            'production', 'โรงงาน', 'เครื่องจักร']
    if any(word in name for word in engineering_keywords):
        fields.append("Engineering & Architecture")
    
    # Science & Health
    science_keywords = ['โรงพยาบาล', 'สาธารณสุข', 'การแพทย์', 'คลินิก', 
                        'ศูนย์วิทยาศาสตร์', 'hospital', 'medical', 'health', 'clinic',
                        'pharmacy', 'science', 'laboratory', 'lab', 'research',
                        'biology', 'chemistry', 'วิทยาศาสตร์', 'เภสัช', 'พยาบาล']
    if any(word in name for word in science_keywords):
        fields.append("Science & Health")
    
    # Arts & Communication
    arts_keywords = ['วิทยุ', 'โทรทัศน์', 'สื่อสาร', 'ดีไซน์', 'design',
                     'media', 'broadcast', 'tv', 'radio', 'communication',
                     'advertising', 'public relations', 'journalism', 'art',
                     'creative', 'film', 'production', 'สื่อ', 'โฆษณา']
    if any(word in name for word in arts_keywords):
        fields.append("Arts & Communication")
    
    # Agriculture
    agri_keywords = ['การเกษตร', 'สหกรณ์', 'เกษตร', 'agriculture', 'farming',
                     'rubber', 'palm', 'ไร่', 'สวน', 'ฟาร์ม', 'ประมง']
    if any(word in name for word in agri_keywords):
        fields.append("Agriculture")
    
    # Education
    edu_keywords = ['โรงเรียน', 'มหาวิทยาลัย', 'สถาบัน', 'school', 'university',
                    'college', 'institute', 'education', 'academy', 'การศึกษา',
                    'ครู', 'อนุบาล', 'ประถม', 'มัธยม']
    if any(word in name for word in edu_keywords):
        fields.append("Education")
    
    # Government & Public Sector
    gov_keywords = ['ด่านศุลกากร', 'กรม', 'สำนักงาน', 'customs', 'department',
                    'ministry', 'government', 'municipality', 'อบต', 'อบจ',
                    'เทศบาล', 'รัฐบาล', 'ข้าราชการ', 'อำเภอ', 'ตำบล']
    if any(word in name for word in gov_keywords):
        fields.append("Government & Public Sector")
    
    # Default
    if not fields:
        fields.append("General/Other")
        
    return fields

def process_data(df, limit=None):
    """แปลงข้อมูล DataFrame เป็นรูปแบบ JSON"""
    processed_data = []
    
    # ใช้ limit ถ้าต้องการประมวลผลบางส่วน
    df_to_process = df.head(limit) if limit else df
    
    for index, row in df_to_process.iterrows():
        loc_info = get_location_info(row['PROVINCENAME'])
        
        # จัดการ ZIPCODE ที่อาจเป็น NaN
        zipcode = row['ZIPCODE']
        if pd.isna(zipcode):
            zipcode = None
        else:
            zipcode = str(int(zipcode)) if isinstance(zipcode, (int, float)) else str(zipcode)
        
        entry = {
            "id": str(row['COMPANYCODE']),
            "companyName": str(row['COMPANYNAME']),
            "province": str(row['PROVINCENAME']),
            "zipcode": zipcode,
            "region": loc_info['region'],
            "lat": loc_info['lat'] + (index * 0.00005),  # บวกค่าเล็กน้อยไม่ให้หมุดทับกัน
            "lng": loc_info['lng'] + (index * 0.00005),
            "careerFields": guess_career_fields(row['COMPANYNAME'])
        }
        processed_data.append(entry)
    
    return processed_data

# 4. ประมวลผลข้อมูลทั้งหมด
processed_data = process_data(df)

# 5. บันทึกเป็น JSON
output_path = 'coop-map/public/companies.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(processed_data, f, ensure_ascii=False, indent=2)

print(f"✅ แปลงข้อมูลสำเร็จ! ได้ไฟล์ {output_path} จำนวน {len(processed_data)} รายการ")

# แสดงสถิติ
regions = {}
careers = {}
for entry in processed_data:
    region = entry['region']
    regions[region] = regions.get(region, 0) + 1
    
    for career in entry['careerFields']:
        careers[career] = careers.get(career, 0) + 1

print("\n📊 สถิติตามภูมิภาค:")
for region, count in sorted(regions.items(), key=lambda x: x[1], reverse=True):
    print(f"   {region}: {count} รายการ")

print("\n💼 สถิติตามสายงาน:")
for career, count in sorted(careers.items(), key=lambda x: x[1], reverse=True):
    print(f"   {career}: {count} รายการ")
