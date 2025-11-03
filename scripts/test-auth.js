/**
 * Authentication Flow Testing Script
 * Tests signup and login functionality
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: `test${Date.now()}@smarttuter.com`,
  password: 'TestPass123!@#',
  name: '테스트 사용자'
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function testSignup() {
  logSection('🔍 Testing Signup Flow');

  try {
    log(`📧 Test Email: ${testUser.email}`, 'blue');
    log(`🔑 Test Password: ${testUser.password}`, 'blue');
    log(`👤 Test Name: ${testUser.name}`, 'blue');

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ Signup successful!', 'green');
      log(`   User ID: ${data.user.id}`, 'green');
      log(`   Email: ${data.user.email}`, 'green');
      log(`   Name: ${data.user.name}`, 'green');
      return { success: true, data };
    } else {
      log('❌ Signup failed:', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${data.error}`, 'red');
      if (data.details) {
        log(`   Details: ${JSON.stringify(data.details)}`, 'red');
      }
      return { success: false, error: data };
    }
  } catch (error) {
    log('❌ Signup request failed:', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testPasswordValidation() {
  logSection('🔍 Testing Password Validation');

  const testCases = [
    { password: 'weak', expected: 'fail', reason: 'too short' },
    { password: 'weakpassword', expected: 'fail', reason: 'no uppercase, numbers, or special chars' },
    { password: 'WeakPass', expected: 'fail', reason: 'no numbers or special chars' },
    { password: 'WeakPass123', expected: 'fail', reason: 'no special chars' },
    { password: 'StrongPass123!', expected: 'pass', reason: 'meets all requirements' },
  ];

  for (const testCase of testCases) {
    const testEmail = `test${Date.now()}@example.com`;

    log(`\n📝 Testing: "${testCase.password}"`, 'yellow');
    log(`   Reason: ${testCase.reason}`, 'yellow');

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testCase.password,
        name: 'Test User'
      }),
    });

    const data = await response.json();

    if (testCase.expected === 'fail') {
      if (!response.ok) {
        log(`   ✅ Correctly rejected weak password`, 'green');
      } else {
        log(`   ❌ Should have rejected this password!`, 'red');
      }
    } else {
      if (response.ok) {
        log(`   ✅ Correctly accepted strong password`, 'green');
      } else {
        log(`   ❌ Should have accepted this password!`, 'red');
        log(`   Error: ${data.error}`, 'red');
      }
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testDuplicateEmail() {
  logSection('🔍 Testing Duplicate Email Detection');

  const duplicateEmail = `duplicate${Date.now()}@test.com`;
  const userData = {
    email: duplicateEmail,
    password: 'TestPass123!@#',
    name: 'First User'
  };

  // First signup - should succeed
  log('📝 First signup attempt...', 'yellow');
  const firstResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const firstData = await firstResponse.json();

  if (firstResponse.ok) {
    log('✅ First signup successful', 'green');
  } else {
    log('❌ First signup failed (unexpected)', 'red');
    log(`   Error: ${firstData.error}`, 'red');
    return;
  }

  // Second signup - should fail
  log('\n📝 Second signup attempt with same email...', 'yellow');
  const secondResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...userData,
      name: 'Second User'
    }),
  });

  const secondData = await secondResponse.json();

  if (!secondResponse.ok && secondData.error.includes('이미 사용 중인')) {
    log('✅ Correctly detected duplicate email', 'green');
    log(`   Error message: "${secondData.error}"`, 'green');
  } else {
    log('❌ Should have rejected duplicate email!', 'red');
  }
}

async function testDisposableEmail() {
  logSection('🔍 Testing Disposable Email Detection');

  const disposableEmails = [
    'test@tempmail.com',
    'test@guerrillamail.com',
    'test@10minutemail.com'
  ];

  for (const email of disposableEmails) {
    log(`\n📝 Testing: ${email}`, 'yellow');

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: 'TestPass123!@#',
        name: 'Test User'
      }),
    });

    const data = await response.json();

    if (!response.ok && data.error.includes('일회용')) {
      log(`   ✅ Correctly rejected disposable email`, 'green');
    } else {
      log(`   ❌ Should have rejected disposable email!`, 'red');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function runAllTests() {
  log('\n🚀 Starting Authentication Tests\n', 'cyan');
  log(`📍 Base URL: ${BASE_URL}`, 'blue');
  log(`⏰ Start Time: ${new Date().toLocaleString()}`, 'blue');

  // Test 1: Password Validation
  await testPasswordValidation();

  // Test 2: Disposable Email Detection
  await testDisposableEmail();

  // Test 3: Duplicate Email Detection
  await testDuplicateEmail();

  // Test 4: Successful Signup
  const signupResult = await testSignup();

  // Summary
  logSection('📊 Test Summary');
  log('All tests completed!', 'green');
  log(`⏰ End Time: ${new Date().toLocaleString()}`, 'blue');

  if (signupResult.success) {
    log('\n✨ Authentication system is working correctly!', 'green');
    log('\n📌 Next Steps:', 'cyan');
    log('   1. Test login with the created user', 'blue');
    log('   2. Test the UI in the browser', 'blue');
    log(`   3. Open http://localhost:3000/signup`, 'blue');
    log(`   4. Open http://localhost:3000/login`, 'blue');
  }
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Test suite failed:', 'red');
  log(`   ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
