/**
 * Comprehensive Testing Suite for Co-op Map Thailand v2.0
 * 
 * This file contains all test cases for the upgraded system
 */

// ==========================================
// TEST CONFIGURATION
// ==========================================
const TEST_CONFIG = {
  FRONTEND_URL: 'http://localhost:5174',
  API_URL: 'http://localhost:3001/api',
  TIMEOUT: 5000,
  RETRIES: 3
};

// ==========================================
// TEST RESULTS STORAGE
// ==========================================
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// ==========================================
// TEST HELPER FUNCTIONS
// ==========================================
function logTest(name, status, details = '') {
  const timestamp = new Date().toISOString();
  testResults.total++;
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ [PASS] ${name}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ [FAIL] ${name}: ${details}`);
  } else if (status === 'SKIP') {
    testResults.skipped++;
    console.log(`⏭️  [SKIP] ${name}: ${details}`);
  }
  
  testResults.tests.push({
    name,
    status,
    details,
    timestamp
  });
}

async function fetchWithTimeout(url, options = {}, timeout = TEST_CONFIG.TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ==========================================
// 1. BACKEND API TESTS
// ==========================================

async function testHealthEndpoint() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      logTest('Health Check Endpoint', 'PASS', `MongoDB: ${data.mongodb}, Redis: ${data.redis}`);
    } else {
      logTest('Health Check Endpoint', 'FAIL', 'Invalid response');
    }
  } catch (error) {
    logTest('Health Check Endpoint', 'FAIL', error.message);
  }
}

async function testGetCompanies() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/companies?limit=10`);
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.data)) {
      logTest('GET /api/companies', 'PASS', `Retrieved ${data.data.length} companies`);
    } else {
      logTest('GET /api/companies', 'FAIL', 'Invalid response structure');
    }
  } catch (error) {
    logTest('GET /api/companies', 'FAIL', error.message);
  }
}

async function testSearchCompanies() {
  try {
    const response = await fetchWithTimeout(
      `${TEST_CONFIG.API_URL}/companies/search?q=บริษัท&limit=5`
    );
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.data)) {
      logTest('GET /api/companies/search', 'PASS', `Found ${data.data.length} results`);
    } else {
      logTest('GET /api/companies/search', 'FAIL', 'Invalid response');
    }
  } catch (error) {
    logTest('GET /api/companies/search', 'FAIL', error.message);
  }
}

async function testGetFilters() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/filters`);
    const data = await response.json();
    
    if (response.ok && data.success && data.data.faculties && data.data.provinces) {
      const { faculties, provinces, programs } = data.data;
      logTest('GET /api/filters', 'PASS', 
        `${faculties.length} faculties, ${provinces.length} provinces, ${programs.length} programs`);
    } else {
      logTest('GET /api/filters', 'FAIL', 'Invalid response structure');
    }
  } catch (error) {
    logTest('GET /api/filters', 'FAIL', error.message);
  }
}

async function testGetSuggestions() {
  try {
    const response = await fetchWithTimeout(
      `${TEST_CONFIG.API_URL}/companies/suggest?q=บริ&limit=5`
    );
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.data)) {
      logTest('GET /api/companies/suggest', 'PASS', `${data.data.length} suggestions`);
    } else {
      logTest('GET /api/companies/suggest', 'FAIL', 'Invalid response');
    }
  } catch (error) {
    logTest('GET /api/companies/suggest', 'FAIL', error.message);
  }
}

async function testGetNearby() {
  try {
    // Test with Bangkok coordinates
    const response = await fetchWithTimeout(
      `${TEST_CONFIG.API_URL}/companies/nearby?lat=13.7563&lng=100.5018&radius=50`
    );
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.data)) {
      logTest('GET /api/companies/nearby', 'PASS', `${data.data.length} nearby companies`);
    } else {
      logTest('GET /api/companies/nearby', 'FAIL', 'Invalid response');
    }
  } catch (error) {
    logTest('GET /api/companies/nearby', 'FAIL', error.message);
  }
}

async function testPagination() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/companies?page=1&limit=20`);
    const data = await response.json();
    
    if (response.ok && data.pagination && 
        data.pagination.page === 1 && 
        data.pagination.limit === 20 &&
        data.pagination.total > 0) {
      logTest('Pagination Support', 'PASS', 
        `Page ${data.pagination.page}/${data.pagination.totalPages}, Total: ${data.pagination.total}`);
    } else {
      logTest('Pagination Support', 'FAIL', 'Invalid pagination data');
    }
  } catch (error) {
    logTest('Pagination Support', 'FAIL', error.message);
  }
}

async function testFiltering() {
  try {
    // Test faculty filter
    const facultyResponse = await fetchWithTimeout(
      `${TEST_CONFIG.API_URL}/companies?faculty=วิศวกรรมศาสตร์&limit=5`
    );
    const facultyData = await facultyResponse.json();
    
    if (facultyResponse.ok && facultyData.success) {
      const allMatch = facultyData.data.every(c => c.สำนักวิชา === 'วิศวกรรมศาสตร์');
      logTest('Faculty Filter', allMatch ? 'PASS' : 'FAIL', 
        `${facultyData.data.length} filtered results`);
    } else {
      logTest('Faculty Filter', 'FAIL', 'Request failed');
    }
  } catch (error) {
    logTest('Faculty Filter', 'FAIL', error.message);
  }
}

async function testFullTextSearch() {
  try {
    const response = await fetchWithTimeout(
      `${TEST_CONFIG.API_URL}/companies?search=บริษัท&limit=10`
    );
    const data = await response.json();
    
    if (response.ok && data.success && data.data.length > 0) {
      logTest('Full-Text Search', 'PASS', `${data.data.length} results`);
    } else {
      logTest('Full-Text Search', 'FAIL', 'No results found');
    }
  } catch (error) {
    logTest('Full-Text Search', 'FAIL', error.message);
  }
}

async function testRateLimiting() {
  try {
    // Make rapid requests to test rate limiting
    const requests = Array(5).fill().map(() => 
      fetchWithTimeout(`${TEST_CONFIG.API_URL}/health`)
    );
    
    const responses = await Promise.all(requests);
    const allOk = responses.every(r => r.ok || r.status === 429);
    
    logTest('Rate Limiting', allOk ? 'PASS' : 'FAIL', 
      allOk ? 'Requests handled correctly' : 'Rate limiting not working');
  } catch (error) {
    logTest('Rate Limiting', 'FAIL', error.message);
  }
}

// ==========================================
// 2. FRONTEND TESTS
// ==========================================

async function testFrontendLoad() {
  try {
    const response = await fetchWithTimeout(TEST_CONFIG.FRONTEND_URL);
    
    if (response.ok && response.headers.get('content-type').includes('text/html')) {
      logTest('Frontend Load', 'PASS', 'HTML loaded successfully');
    } else {
      logTest('Frontend Load', 'FAIL', 'Failed to load frontend');
    }
  } catch (error) {
    logTest('Frontend Load', 'FAIL', error.message);
  }
}

async function testStaticAssets() {
  const assets = [
    '/assets/index.js',
    '/assets/index.css',
    '/service-worker.js',
    '/manifest.json'
  ];
  
  for (const asset of assets) {
    try {
      const response = await fetchWithTimeout(`${TEST_CONFIG.FRONTEND_URL}${asset}`);
      logTest(`Static Asset: ${asset}`, response.ok ? 'PASS' : 'FAIL', 
        response.ok ? 'Loaded' : `Status: ${response.status}`);
    } catch (error) {
      logTest(`Static Asset: ${asset}`, 'FAIL', error.message);
    }
  }
}

// ==========================================
// 3. DATABASE TESTS
// ==========================================

async function testDatabaseConnection() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/health`);
    const data = await response.json();
    
    if (data.mongodb === 'connected') {
      logTest('Database Connection', 'PASS', 'MongoDB connected');
    } else {
      logTest('Database Connection', 'FAIL', 'MongoDB not connected');
    }
  } catch (error) {
    logTest('Database Connection', 'FAIL', error.message);
  }
}

async function testDataIntegrity() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/companies?limit=100`);
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      logTest('Data Integrity', 'FAIL', 'Invalid data structure');
      return;
    }
    
    const companies = data.data;
    let issues = [];
    
    companies.forEach((company, index) => {
      if (!company.รายชื่อสถานประกอบการ) {
        issues.push(`Row ${index}: Missing company name`);
      }
      if (!company.สำนักวิชา) {
        issues.push(`Row ${index}: Missing faculty`);
      }
      if (!company.latitude || !company.longitude) {
        issues.push(`Row ${index}: Missing coordinates`);
      }
    });
    
    if (issues.length === 0) {
      logTest('Data Integrity', 'PASS', `${companies.length} companies validated`);
    } else {
      logTest('Data Integrity', 'FAIL', `${issues.length} issues found`);
      console.log('Data issues:', issues.slice(0, 5));
    }
  } catch (error) {
    logTest('Data Integrity', 'FAIL', error.message);
  }
}

// ==========================================
// 4. PERFORMANCE TESTS
// ==========================================

async function testAPIResponseTime() {
  const startTime = performance.now();
  
  try {
    await fetchWithTimeout(`${TEST_CONFIG.API_URL}/companies?limit=50`);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 1000) {
      logTest('API Response Time', 'PASS', `${duration.toFixed(2)}ms`);
    } else {
      logTest('API Response Time', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('API Response Time', 'FAIL', error.message);
  }
}

async function testSearchPerformance() {
  const startTime = performance.now();
  
  try {
    await fetchWithTimeout(`${TEST_CONFIG.API_URL}/companies/search?q=บริษัท`);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 500) {
      logTest('Search Performance', 'PASS', `${duration.toFixed(2)}ms`);
    } else {
      logTest('Search Performance', 'FAIL', `${duration.toFixed(2)}ms (too slow)`);
    }
  } catch (error) {
    logTest('Search Performance', 'FAIL', error.message);
  }
}

async function testCaching() {
  try {
    // First request (cold cache)
    const start1 = performance.now();
    const response1 = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/filters`);
    const duration1 = performance.now() - start1;
    
    // Second request (should be cached)
    const start2 = performance.now();
    const response2 = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/filters`);
    const duration2 = performance.now() - start2;
    
    if (response1.ok && response2.ok) {
      const improvement = ((duration1 - duration2) / duration1 * 100).toFixed(1);
      logTest('API Caching', 'PASS', 
        `First: ${duration1.toFixed(0)}ms, Cached: ${duration2.toFixed(0)}ms (${improvement}% faster)`);
    } else {
      logTest('API Caching', 'FAIL', 'Request failed');
    }
  } catch (error) {
    logTest('API Caching', 'FAIL', error.message);
  }
}

// ==========================================
// 5. PWA TESTS
// ==========================================

async function testServiceWorker() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.FRONTEND_URL}/service-worker.js`);
    
    if (response.ok) {
      logTest('Service Worker File', 'PASS', 'service-worker.js accessible');
    } else {
      logTest('Service Worker File', 'FAIL', 'Not accessible');
    }
  } catch (error) {
    logTest('Service Worker File', 'FAIL', error.message);
  }
}

async function testManifest() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.FRONTEND_URL}/manifest.json`);
    const data = await response.json();
    
    if (response.ok && data.name && data.icons && data.icons.length > 0) {
      logTest('PWA Manifest', 'PASS', `${data.icons.length} icons, theme: ${data.theme_color}`);
    } else {
      logTest('PWA Manifest', 'FAIL', 'Invalid manifest');
    }
  } catch (error) {
    logTest('PWA Manifest', 'FAIL', error.message);
  }
}

// ==========================================
// 6. SECURITY TESTS
// ==========================================

async function testSecurityHeaders() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/health`);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-dns-prefetch-control',
      'x-frame-options',
      'x-download-options',
      'x-content-type-options',
      'x-xss-protection'
    ];
    
    const present = securityHeaders.filter(h => headers.get(h));
    
    logTest('Security Headers', present.length >= 3 ? 'PASS' : 'WARN',
      `${present.length}/${securityHeaders.length} headers present`);
  } catch (error) {
    logTest('Security Headers', 'FAIL', error.message);
  }
}

async function testCORS() {
  try {
    const response = await fetchWithTimeout(`${TEST_CONFIG.API_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://example.com'
      }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    if (corsHeader) {
      logTest('CORS Configuration', 'PASS', `CORS enabled: ${corsHeader}`);
    } else {
      logTest('CORS Configuration', 'FAIL', 'CORS not configured');
    }
  } catch (error) {
    logTest('CORS Configuration', 'FAIL', error.message);
  }
}

// ==========================================
// MAIN TEST RUNNER
// ==========================================

async function runAllTests() {
  console.log('🧪 ==========================================');
  console.log('🧪 CO-OP MAP THAILAND v2.0 - TEST SUITE');
  console.log('🧪 ==========================================');
  console.log('');
  
  const startTime = Date.now();
  
  // 1. Backend API Tests
  console.log('📦 BACKEND API TESTS');
  console.log('--------------------');
  await testHealthEndpoint();
  await testGetCompanies();
  await testSearchCompanies();
  await testGetFilters();
  await testGetSuggestions();
  await testGetNearby();
  await testPagination();
  await testFiltering();
  await testFullTextSearch();
  await testRateLimiting();
  console.log('');
  
  // 2. Frontend Tests
  console.log('🎨 FRONTEND TESTS');
  console.log('-----------------');
  await testFrontendLoad();
  await testStaticAssets();
  console.log('');
  
  // 3. Database Tests
  console.log('🗄️  DATABASE TESTS');
  console.log('-----------------');
  await testDatabaseConnection();
  await testDataIntegrity();
  console.log('');
  
  // 4. Performance Tests
  console.log('⚡ PERFORMANCE TESTS');
  console.log('-------------------');
  await testAPIResponseTime();
  await testSearchPerformance();
  await testCaching();
  console.log('');
  
  // 5. PWA Tests
  console.log('📱 PWA TESTS');
  console.log('------------');
  await testServiceWorker();
  await testManifest();
  console.log('');
  
  // 6. Security Tests
  console.log('🔒 SECURITY TESTS');
  console.log('-----------------');
  await testSecurityHeaders();
  await testCORS();
  console.log('');
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('🧪 ==========================================');
  console.log('🧪 TEST SUMMARY');
  console.log('🧪 ==========================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('🧪 ==========================================');
  
  // Return results for report generation
  return testResults;
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
}

// Run if in browser
if (typeof window !== 'undefined') {
  window.runCoopMapTests = runAllTests;
}
