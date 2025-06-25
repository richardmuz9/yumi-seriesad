const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123'
};

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0',
        ...options.headers
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: result
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200) {
      console.log('✅ Health check passed:', response.data);
      return true;
    } else {
      console.log('❌ Health check failed:', response.status, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  // Test login with existing user
  console.log('🔑 Testing login with existing test user...');
  try {
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: TEST_USER
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login successful!');
      console.log('🎟️  Token received:', loginResponse.data.token.substring(0, 20) + '...');
      return loginResponse.data.token;
    } else {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testAlipayEndpoints(authToken) {
  console.log('\n💰 Testing Alipay Endpoints...');

  // Test 1: Get available packages (public endpoint)
  console.log('📦 Testing packages endpoint...');
  try {
    const packagesResponse = await makeRequest('/api/billing/packages');
    if (packagesResponse.status === 200) {
      console.log('✅ Packages retrieved:', packagesResponse.data);
    } else {
      console.log('❌ Packages failed:', packagesResponse.status, packagesResponse.data);
    }
  } catch (error) {
    console.log('❌ Packages error:', error.message);
  }

  if (!authToken) {
    console.log('⚠️  Skipping authenticated Alipay tests (no auth token)');
    return;
  }

  // Test 2: Create checkout session (authenticated)
  console.log('🛒 Testing Alipay checkout (authenticated)...');
  try {
    const checkoutResponse = await makeRequest('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        packageId: 'credits-5',
        paymentMethod: 'alipay'
      }
    });

    if (checkoutResponse.status === 200) {
      console.log('✅ Alipay checkout successful!');
      console.log('💳 Payment URL:', checkoutResponse.data.url);
      console.log('🆔 Session ID:', checkoutResponse.data.sessionId);
      return checkoutResponse.data.sessionId;
    } else {
      console.log('❌ Alipay checkout failed:', checkoutResponse.status, checkoutResponse.data);
    }
  } catch (error) {
    console.log('❌ Alipay checkout error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests...');
  console.log('🎯 Target:', BASE_URL);

  // Test 1: Health check
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    console.log('💥 Server health check failed. Stopping tests.');
    return;
  }

  // Test 2: Authentication
  const authToken = await testAuth();

  // Test 3: Alipay endpoints
  await testAlipayEndpoints(authToken);

  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Health endpoint working');
  console.log(authToken ? '✅ Authentication working' : '❌ Authentication failed');
  console.log('✅ Alipay endpoints tested');
  
  if (authToken) {
    console.log('\n🎯 Next steps:');
    console.log('1. Test the payment URL in a browser');
    console.log('2. Check Alipay sandbox for transaction details');
    console.log('3. Monitor webhook logs for payment confirmations');
  }
}

// Run the tests
runAllTests().catch(console.error); 