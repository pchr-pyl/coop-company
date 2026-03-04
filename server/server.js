require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

const Company = require('./models/Company');

const app = express();
const PORT = process.env.PORT || 3001;

// Redis client for caching
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!redis) return next();
    
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.originalJson = res.json;
      res.json = (body) => {
        redis.setex(key, duration, JSON.stringify(body));
        res.originalJson(body);
      };
      next();
    } catch (error) {
      next();
    }
  };
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coopmap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redis ? 'connected' : 'disabled'
  });
});

// Get all companies with pagination
app.get('/api/companies', cacheMiddleware(300), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      faculty, 
      program, 
      province, 
      search,
      businessType,
      companySize,
      hasLocation = 'true'
    } = req.query;

    const filter = { isActive: true };
    
    if (hasLocation === 'true') {
      filter.latitude = { $exists: true, $ne: null };
      filter.longitude = { $exists: true, $ne: null };
    }
    
    if (faculty) filter.สำนักวิชา = faculty;
    if (program) filter.หลักสูตร = program;
    if (province) filter.จังหวัดที่ตั้ง = province;
    if (businessType) filter.businessType = businessType;
    if (companySize) filter.companySize = companySize;
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = Company.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(search ? { score: { $meta: 'textScore' } } : { ลำดับ: 1 });
    
    if (search) {
      query = query.select({ score: { $meta: 'textScore' } });
    }

    const [companies, total] = await Promise.all([
      query.lean(),
      Company.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch companies',
      message: error.message 
    });
  }
});

// Search companies
app.get('/api/companies/search', cacheMiddleware(60), async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        query: q
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const companies = await Company.find({
      isActive: true,
      $or: [
        { รายชื่อสถานประกอบการ: searchRegex },
        { สำนักวิชา: searchRegex },
        { หลักสูตร: searchRegex },
        { จังหวัดที่ตั้ง: searchRegex },
        { businessType: searchRegex }
      ]
    })
    .limit(parseInt(limit))
    .select('รายชื่อสถานประกอบการ สำนักวิชา หลักสูตร จังหวัดที่ตั้ง latitude longitude')
    .lean();

    res.json({
      success: true,
      data: companies,
      query: q,
      count: companies.length
    });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search companies',
      message: error.message 
    });
  }
});

// Get unique filter values
app.get('/api/filters', cacheMiddleware(600), async (req, res) => {
  try {
    const [faculties, programs, provinces, businessTypes, companySizes] = await Promise.all([
      Company.distinct('สำนักวิชา', { isActive: true }).sort(),
      Company.distinct('หลักสูตร', { isActive: true }).sort(),
      Company.distinct('จังหวัดที่ตั้ง', { isActive: true }).sort(),
      Company.distinct('businessType', { isActive: true, businessType: { $ne: null } }).sort(),
      Company.distinct('companySize', { isActive: true, companySize: { $ne: null } }).sort()
    ]);

    res.json({
      success: true,
      data: {
        faculties,
        programs,
        provinces,
        businessTypes,
        companySizes
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch filters',
      message: error.message 
    });
  }
});

// Get single company by ID
app.get('/api/companies/:id', cacheMiddleware(300), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        error: 'Company not found' 
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch company',
      message: error.message 
    });
  }
});

// Get autocomplete suggestions
app.get('/api/companies/suggest', cacheMiddleware(120), async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        data: [],
        query: q
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const companies = await Company.find({
      isActive: true,
      รายชื่อสถานประกอบการ: searchRegex
    })
    .limit(parseInt(limit))
    .select('รายชื่อสถานประกอบการ สำนักวิชา จังหวัดที่ตั้ง')
    .lean();

    res.json({
      success: true,
      data: companies.map(c => ({
        value: c.รายชื่อสถานประกอบการ,
        label: `${c.รายชื่อสถานประกอบการ} (${c.สำนักวิชา}, ${c.จังหวัดที่ตั้ง})`,
        id: c._id
      })),
      query: q
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
});

// Get nearby companies
app.get('/api/companies/nearby', cacheMiddleware(120), async (req, res) => {
  try {
    const { lat, lng, radius = 50, limit = 20 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const companies = await Company.find({
      isActive: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).lean();

    // Calculate distances and filter
    const nearbyCompanies = companies
      .map(company => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          company.latitude,
          company.longitude
        );
        return { ...company, distance };
      })
      .filter(company => company.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: nearbyCompanies,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: parseFloat(radius)
    });
  } catch (error) {
    console.error('Error finding nearby companies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to find nearby companies',
      message: error.message 
    });
  }
});

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/companies - Get all companies`);
  console.log(`   GET /api/companies/search - Search companies`);
  console.log(`   GET /api/companies/suggest - Autocomplete`);
  console.log(`   GET /api/companies/nearby - Nearby companies`);
  console.log(`   GET /api/filters - Get filter values`);
});
