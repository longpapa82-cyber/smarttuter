/**
 * Error Tracking System - Local Test Script
 * Tests the error tracking API endpoint
 */

async function testErrorTracking() {
  const baseUrl = 'http://localhost:3001';

  console.log('🧪 Testing Error Tracking System\n');

  // Test 1: Send a client error
  console.log('📤 Test 1: Sending client-side error...');
  try {
    const response = await fetch(`${baseUrl}/api/errors/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TypeError',
        message: 'Cannot read property "value" of undefined',
        stack: 'TypeError: Cannot read property "value" of undefined\n    at onClick (app/test.tsx:42:15)',
        pathname: '/test',
        userAgent: 'Test Script/1.0',
        timestamp: Date.now(),
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Send duplicate error (should increment count)
  console.log('📤 Test 2: Sending duplicate error...');
  try {
    const response = await fetch(`${baseUrl}/api/errors/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TypeError',
        message: 'Cannot read property "value" of undefined',
        stack: 'TypeError: Cannot read property "value" of undefined\n    at onClick (app/test.tsx:42:15)',
        pathname: '/test',
        userAgent: 'Test Script/1.0',
        timestamp: Date.now(),
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Send different error
  console.log('📤 Test 3: Sending different error...');
  try {
    const response = await fetch(`${baseUrl}/api/errors/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ReferenceError',
        message: 'window is not defined',
        stack: 'ReferenceError: window is not defined\n    at render (components/ClientOnly.tsx:12:8)',
        pathname: '/dashboard',
        userAgent: 'Test Script/1.0',
        timestamp: Date.now(),
      }),
    });

    const data = await response.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  console.log('\n✨ Error tracking test completed!\n');
  console.log('📊 Check your Redis database or admin dashboard to view errors.');
  console.log('🔍 Error fingerprints allow deduplication of identical errors.\n');
}

// Run tests
testErrorTracking().catch(console.error);
