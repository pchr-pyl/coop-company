const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Company = require('./models/Company');

require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coopmap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

async function importData() {
  try {
    console.log('🚀 Starting CSV import...');
    
    // Clear existing data
    await Company.deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    const results = [];
    const errors = [];
    
    // Read CSV file
    fs.createReadStream('../พรีเมียม ปีงบ 2568 - Premium_Updated.csv')
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Parse coordinates
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          
          // Skip if coordinates are invalid
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            errors.push({
              row: data,
              error: 'Invalid coordinates'
            });
            return;
          }
          
          results.push({
            ลำดับ: parseInt(data.ลำดับ) || 0,
            รายชื่อสถานประกอบการ: data['รายชื่อสถานประกอบการ']?.trim() || '',
            สำนักวิชา: data['สำนักวิชา']?.trim() || '',
            หลักสูตร: data['หลักสูตร']?.trim() || '',
            จังหวัดที่ตั้ง: data['จังหวัดที่ตั้ง']?.trim() || '',
            latitude: lat,
            longitude: lng,
            businessType: data.businessType?.trim() || null,
            companySize: data.companySize?.trim() || null,
            website: data.website?.trim() || null,
            contactEmail: data.contactEmail?.trim() || null,
            contactPhone: data.contactPhone?.trim() || null,
            description: data.description?.trim() || null,
            isActive: true
          });
        } catch (error) {
          errors.push({
            row: data,
            error: error.message
          });
        }
      })
      .on('end', async () => {
        console.log(`📊 Parsed ${results.length} valid records`);
        console.log(`⚠️ Skipped ${errors.length} invalid records`);
        
        if (errors.length > 0) {
          console.log('\n⚠️ Sample errors:');
          errors.slice(0, 5).forEach((err, i) => {
            console.log(`  ${i + 1}. ${err.error}: ${err.row['รายชื่อสถานประกอบการ'] || 'N/A'}`);
          });
        }
        
        try {
          // Insert data in batches
          const batchSize = 100;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await Company.insertMany(batch, { ordered: false });
            console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)}`);
          }
          
          console.log('\n🎉 Import completed successfully!');
          console.log(`📈 Total imported: ${results.length} companies`);
          
          // Show statistics
          const stats = await Company.aggregate([
            {
              $group: {
                _id: null,
                totalCompanies: { $sum: 1 },
                faculties: { $addToSet: '$สำนักวิชา' },
                provinces: { $addToSet: '$จังหวัดที่ตั้ง' },
                avgLat: { $avg: '$latitude' },
                avgLng: { $avg: '$longitude' }
              }
            }
          ]);
          
          if (stats.length > 0) {
            console.log('\n📊 Database Statistics:');
            console.log(`  • Total Companies: ${stats[0].totalCompanies}`);
            console.log(`  • Faculties: ${stats[0].faculties.length}`);
            console.log(`  • Provinces: ${stats[0].provinces.length}`);
            console.log(`  • Center: [${stats[0].avgLat.toFixed(4)}, ${stats[0].avgLng.toFixed(4)}]`);
          }
          
          // Create indexes
          console.log('\n🔍 Creating indexes...');
          await Company.syncIndexes();
          console.log('✅ Indexes created');
          
          process.exit(0);
        } catch (error) {
          console.error('❌ Error inserting data:', error);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        process.exit(1);
      });
      
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();
