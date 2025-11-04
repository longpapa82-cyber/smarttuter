#!/usr/bin/env node

/**
 * Gemini API 안정화 버전 테스트
 * gemini-2.0-flash-exp 대신 안정 버전 모델 확인
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

async function testStableModels() {
  console.log('🔍 Gemini 안정 버전 모델 테스트\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  // 테스트할 모델 목록 (안정 버전만)
  const modelsToTest = [
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-flash'
  ];

  console.log(`📋 ${modelsToTest.length}개 안정 버전 모델 테스트 중...\n`);

  const workingModels = [];
  const failedModels = [];

  for (const modelName of modelsToTest) {
    try {
      console.log(`🧪 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const startTime = Date.now();
      const result = await model.generateContent('Say "OK" if you can read this.');
      const endTime = Date.now();

      const response = await result.response;
      const text = response.text();

      console.log(`  ✅ SUCCESS - ${endTime - startTime}ms`);
      console.log(`  📝 Response: "${text.trim().substring(0, 50)}..."\n`);

      workingModels.push({
        name: modelName,
        responseTime: endTime - startTime,
        working: true
      });

    } catch (error) {
      console.log(`  ❌ FAILED`);
      console.log(`  📝 Error: ${error.message.substring(0, 100)}...\n`);

      failedModels.push({
        name: modelName,
        error: error.message,
        working: false
      });
    }
  }

  // 결과 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 테스트 결과 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (workingModels.length > 0) {
    console.log(`✅ 작동하는 모델 (${workingModels.length}개):\n`);
    workingModels.forEach(model => {
      console.log(`  - ${model.name} (${model.responseTime}ms)`);
    });
    console.log('');
  } else {
    console.log('❌ 작동하는 안정 버전 모델 없음\n');
  }

  if (failedModels.length > 0) {
    console.log(`❌ 실패한 모델 (${failedModels.length}개):\n`);
    failedModels.forEach(model => {
      console.log(`  - ${model.name}`);
      console.log(`    이유: ${model.error.substring(0, 80)}...`);
    });
    console.log('');
  }

  // 권장사항
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 권장사항');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (workingModels.length > 0) {
    console.log('✅ 다음 모델로 전환 가능:');
    console.log(`   ${workingModels[0].name}\n`);
    console.log('📝 전환 방법:');
    console.log('   모든 파일에서 model: "gemini-2.0-flash-exp"를');
    console.log(`   model: "${workingModels[0].name}"로 변경\n`);
  } else {
    console.log('⚠️  현재 상황:');
    console.log('   - gemini-2.0-flash-exp: 무료 티어 (50회/일)');
    console.log('   - 안정 버전 모델: v1beta API에서 사용 불가\n');
    console.log('📋 다음 단계:');
    console.log('   1. 내일 09:00 KST 쿼터 리셋 대기');
    console.log('   2. Vertex AI API로 마이그레이션 검토');
    console.log('   3. 다른 AI 제공업체 고려\n');
  }
}

// 실행
testStableModels();
