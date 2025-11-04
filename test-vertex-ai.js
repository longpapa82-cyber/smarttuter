// Vertex AI 연결 테스트 스크립트
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';

// .env.local 로드
dotenv.config({ path: '.env.local' });

async function testVertexAI() {
  console.log('🧪 Vertex AI 연결 테스트 시작...\n');

  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(`  GCP_PROJECT_ID: ${process.env.GCP_PROJECT_ID}`);
  console.log(`  GCP_LOCATION: ${process.env.GCP_LOCATION}`);
  console.log(`  GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  console.log(`  ENABLE_VERTEX_AI: ${process.env.ENABLE_VERTEX_AI}\n`);

  if (!process.env.GCP_PROJECT_ID) {
    console.error('❌ GCP_PROJECT_ID가 설정되지 않았습니다!');
    return;
  }

  try {
    // Vertex AI 클라이언트 초기화
    console.log('🚀 Vertex AI 초기화 중...');
    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID,
      location: process.env.GCP_LOCATION || 'us-central1',
    });

    console.log('✅ Vertex AI 초기화 성공!\n');

    // 모델 가져오기
    console.log('📦 Gemini 2.5 Flash 모델 로드 중...');
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generation_config: {
        temperature: 0.7,
        max_output_tokens: 1024,
      },
    });

    console.log('✅ 모델 로드 성공!\n');

    // 간단한 질문 테스트
    console.log('💬 테스트 질문: "피타고라스의 정리를 간단히 설명해주세요."');
    const prompt = '피타고라스의 정리를 간단히 설명해주세요.';

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Vertex AI 응답 형식 확인
    console.log('📊 응답 구조:', {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      hasContent: !!response.candidates?.[0]?.content,
    });

    const text = response.candidates[0]?.content?.parts[0]?.text || 'No response';

    console.log('\n📝 Vertex AI 응답:');
    console.log(text);

    console.log('\n✅ Vertex AI 연결 테스트 성공!');
    console.log('💰 비용: Flash 모델 - $0.0008 ~ $0.001 per request');

  } catch (error) {
    console.error('\n❌ Vertex AI 연결 실패:');
    console.error(error);

    if (error.message && error.message.includes('credentials')) {
      console.error('\n💡 해결 방법: GOOGLE_APPLICATION_CREDENTIALS 경로를 확인하세요.');
    }

    if (error.message && error.message.includes('aiplatform')) {
      console.error('\n💡 해결 방법: Vertex AI API가 활성화되었는지 확인하세요.');
      console.error('   gcloud services enable aiplatform.googleapis.com');
    }
  }
}

// 실행
testVertexAI();
