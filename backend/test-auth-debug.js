const http = require('http');
require('dotenv').config();

async function testAuth() {
  console.log('🔐 Testing Authentication Debug...');
  
  // Test the auth test endpoint first
  console.log('1. Testing /api/auth/test...');
  await makeRequest('/api/auth/test', { method: 'GET' });

  // Test login
  console.log('\n2. Testing /api/auth/login...');
  await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'testpass123'
    }
  });
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : null;
    
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0',
        ...options.headers
      }
    };

    if (postData) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    console.log(`Making ${requestOptions.method} request to ${path}`);
    if (options.body) {
      console.log('Request body:', options.body);
    }

    const req = http.request(requestOptions, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('RAW RESPONSE:', data);
        try {
          const result = JSON.parse(data);
          console.log('PARSED RESPONSE:', result);
        } catch (e) {
          console.log('Failed to parse JSON response');
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Request error: ${e.message}`);
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

testAuth().catch(console.error); 