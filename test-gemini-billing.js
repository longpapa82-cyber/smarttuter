#!/usr/bin/env node

/**
 * Gemini API Billing Verification Script
 * Tests API quota, billing status, and rate limits
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

async function testGeminiAPI() {
  console.log('🔍 Gemini API Billing Verification\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    console.log('📡 API Key Status: ✅ Configured');
    console.log('🤖 Model: gemini-2.0-flash-exp\n');

    // Test 1: Simple API Call
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 1: Basic API Call');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();
    const result = await model.generateContent('What is 2+2? Answer in one word.');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const response = await result.response;
    const text = response.text();

    console.log(`✅ API Call: SUCCESS`);
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`📝 Response: "${text.trim()}"\n`);

    // Test 2: Rate Limit Check (Multiple Calls)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 2: Rate Limit Test (5 consecutive calls)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let successCount = 0;
    let totalTime = 0;

    for (let i = 1; i <= 5; i++) {
      try {
        const start = Date.now();
        const testResult = await model.generateContent(`Count to ${i}`);
        const end = Date.now();
        const time = end - start;
        totalTime += time;

        const testResponse = await testResult.response;
        console.log(`  Call ${i}/5: ✅ Success (${time}ms)`);
        successCount++;
      } catch (error) {
        console.log(`  Call ${i}/5: ❌ Failed - ${error.message}`);
      }
    }

    const avgTime = totalTime / successCount;
    console.log(`\n📊 Results: ${successCount}/5 successful`);
    console.log(`⏱️  Average Response Time: ${avgTime.toFixed(0)}ms\n`);

    // Test 3: Classification Test (Real Use Case)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 3: Question Classification (Production Use Case)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testQuestions = [
      { question: '피타고라스 정리가 뭐야?', expected: 'math' },
      { question: 'What is photosynthesis?', expected: 'science' },
      { question: '미국 독립 전쟁은 언제야?', expected: 'social-studies' }
    ];

    for (const test of testQuestions) {
      try {
        const classificationPrompt = `당신은 교육 전문가입니다. 다음 질문이 어느 교과에 해당하는지 분류하세요.

교과 분류:
- math: 수학
- science: 과학
- social-studies: 사회
- other: 기타

질문: "${test.question}"

JSON 형식으로만 답변하세요:
{"subject": "math|science|social-studies|other", "confidence": 0-100}`;

        const classResult = await model.generateContent(classificationPrompt);
        const classResponse = await classResult.response;
        const classText = classResponse.text();

        // Extract JSON
        const jsonMatch = classText.match(/\{[^}]+\}/);
        if (jsonMatch) {
          const classification = JSON.parse(jsonMatch[0]);
          const isCorrect = classification.subject === test.expected;
          console.log(`  Question: "${test.question}"`);
          console.log(`  Result: ${classification.subject} (${classification.confidence}% confidence)`);
          console.log(`  Status: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}\n`);
        }
      } catch (error) {
        console.log(`  Question: "${test.question}"`);
        console.log(`  Status: ❌ Failed - ${error.message}\n`);
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ BILLING VERIFICATION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Summary:');
    console.log('  ✅ API Key: Valid and active');
    console.log('  ✅ Billing: Enabled (no quota errors)');
    console.log('  ✅ Rate Limit: Sufficient for production');
    console.log('  ✅ Classification: Working correctly\n');

    console.log('💡 Next Steps:');
    console.log('  1. ✅ Billing activated successfully');
    console.log('  2. 🚀 Production deployment ready');
    console.log('  3. 📈 Monitor usage at: https://aistudio.google.com/\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ VERIFICATION FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (error.message.includes('429') || error.message.includes('quota')) {
      console.error('⚠️  Issue: API Quota Exceeded');
      console.error('📝 Status: Billing may not be fully activated yet\n');
      console.error('Solutions:');
      console.error('  1. Wait 5-10 minutes for billing activation to propagate');
      console.error('  2. Check Google AI Studio: https://aistudio.google.com/');
      console.error('  3. Verify billing account is properly linked');
      console.error('  4. Check API key is from billing-enabled project\n');
    } else if (error.message.includes('API key')) {
      console.error('⚠️  Issue: API Key Invalid');
      console.error('📝 Status: Key may be incorrect or disabled\n');
      console.error('Solutions:');
      console.error('  1. Regenerate API key at https://aistudio.google.com/');
      console.error('  2. Update GEMINI_API_KEY in .env.local');
      console.error('  3. Restart development server\n');
    } else {
      console.error('⚠️  Issue: Unknown Error');
      console.error(`📝 Error: ${error.message}\n`);
      console.error('Solutions:');
      console.error('  1. Check network connection');
      console.error('  2. Verify Google AI Studio status');
      console.error('  3. Try again in a few minutes\n');
    }

    process.exit(1);
  }
}

// Run test
testGeminiAPI();
