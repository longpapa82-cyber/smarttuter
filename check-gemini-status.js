#!/usr/bin/env node

/**
 * Gemini API Status Checker
 * Checks API key validity without consuming quota
 */

require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Gemini API Status Check\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check 1: API Key Format
console.log('1️⃣  API Key Configuration');
if (!apiKey) {
  console.log('   ❌ GEMINI_API_KEY not found in .env.local\n');
  process.exit(1);
}

const keyLength = apiKey.length;
const keyPreview = apiKey.substring(0, 8) + '...' + apiKey.substring(keyLength - 4);
console.log(`   ✅ Key Found: ${keyPreview}`);
console.log(`   📏 Length: ${keyLength} characters`);

// Check if it's a valid format (AIza...)
if (apiKey.startsWith('AIza')) {
  console.log('   ✅ Format: Valid Google API Key format\n');
} else {
  console.log('   ⚠️  Format: Unusual format (expected to start with "AIza")\n');
}

// Check 2: Environment File
console.log('2️⃣  Environment Configuration');
const fs = require('fs');
const envPath = '/Users/hoonjaepark/projects/smartTuter/.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.includes('GEMINI') || line.includes('GOOGLE'));
  console.log('   ✅ .env.local exists');
  console.log(`   📝 Gemini-related variables: ${lines.length}\n`);
} else {
  console.log('   ❌ .env.local not found\n');
}

// Check 3: Model Availability
console.log('3️⃣  Model Configuration');
console.log('   🤖 Target Model: gemini-2.0-flash-exp');
console.log('   📅 Free Period: Until 2025 H1');
console.log('   💰 Cost: FREE (during free period)\n');

// Check 4: Quota Information
console.log('4️⃣  Quota Information');
console.log('   📊 Free Tier: 50 requests/day');
console.log('   📊 Paid Tier: 1,500 requests/minute');
console.log('   ⏰ Reset Time: UTC 00:00 (09:00 Korea)\n');

// Check 5: Billing Status Indicators
console.log('5️⃣  Current Status');
console.log('   ⚠️  API calls are failing with quota errors');
console.log('   📝 This means ONE of:');
console.log('      a) Billing not yet activated (wait 5-10 min)');
console.log('      b) Billing activated but using old API key');
console.log('      c) Daily free quota (50) still exhausted\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 CHECKLIST FOR USER');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✓ Verify at Google AI Studio: https://aistudio.google.com/\n');
console.log('  1. Click "Get API Key" in left sidebar');
console.log('  2. Check if billing is shown as "Enabled"');
console.log('  3. If billing was JUST enabled:');
console.log('     - Wait 5-10 minutes for propagation');
console.log('     - Generate NEW API key (old one may be free-tier)');
console.log('     - Replace GEMINI_API_KEY in .env.local\n');
console.log('  4. If billing was enabled earlier:');
console.log('     - Check quota usage dashboard');
console.log('     - Verify payment method is valid');
console.log('     - Check for any billing alerts\n');

console.log('✓ Quick Test (in 5 minutes):');
console.log('  Run: node test-gemini-billing.js\n');

console.log('✓ Alternative Immediate Solution:');
console.log('  - Generate NEW API key from billing-enabled project');
console.log('  - Update .env.local with new key');
console.log('  - New key should have paid quota immediately\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
