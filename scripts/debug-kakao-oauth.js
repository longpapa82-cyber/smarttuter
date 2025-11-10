// Kakao OAuth 디버그 스크립트
console.log('=== Kakao OAuth Configuration Check ===\n');

// 1. 필수 환경 변수 확인
console.log('1️⃣ Environment Variables:');
const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSensitive = varName.includes('SECRET') || varName.includes('TOKEN');
  if (value) {
    console.log(`✅ ${varName}: ${isSensitive ? '[SET]' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n2️⃣ NextAuth URL Configuration:');
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log(`Expected Kakao Redirect: ${process.env.NEXTAUTH_URL}/api/auth/callback/kakao`);

console.log('\n3️⃣ Registered Redirect URIs in Kakao Console:');
const redirectURIs = [
  'https://aipark.vercel.app/api/auth/callback/kakao',
  'https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao',
  'https://aipark-git-main-090723s-projects.vercel.app/api/auth/callback/kakao',
  'https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao',
  'https://aipark-e5avqf4cf-090723s-projects.vercel.app/api/auth/callback/kakao'
];

redirectURIs.forEach((uri, idx) => {
  console.log(`${idx + 1}. ${uri}`);
});

console.log('\n4️⃣ Potential Issues:');
console.log('- Check if NEXTAUTH_URL matches one of the registered URIs');
console.log('- Verify Kakao Console Redirect URIs are exactly correct');
console.log('- Ensure Redis is accessible from Vercel');
console.log('- Check if signIn callback is throwing errors');
