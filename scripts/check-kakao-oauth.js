/**
 * Kakao OAuth Configuration Checker
 */

console.log('🔍 Kakao OAuth Configuration Check\n');
console.log('='.repeat(60));

// Check environment variables
const requiredEnvVars = [
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

console.log('\n📋 Environment Variables Check:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isSecret = varName.indexOf('SECRET') !== -1;
  if (value) {
    console.log(`✅ ${varName}: ${isSecret ? '***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

// Expected callback URLs for current deployment
console.log('\n\n🌐 Expected Kakao Redirect URIs:');
console.log('─'.repeat(60));
const domains = [
  'https://aipark.vercel.app',
  'https://smarttuter.vercel.app',
  'https://aipark-090723s-projects.vercel.app',
  'https://aipark-longpapa82-7861-090723s-projects.vercel.app',
  'http://localhost:3000'
];

domains.forEach(domain => {
  console.log(`${domain}/api/auth/callback/kakao`);
});

console.log('\n\n⚠️  IMPORTANT CHECKS:');
console.log('─'.repeat(60));
console.log('1. Go to Kakao Developers Console:');
console.log('   https://developers.kakao.com/console/app');
console.log('\n2. Navigate to: 앱 설정 > 플랫폼 > Web > Redirect URI');
console.log('\n3. Verify ALL above URLs are registered');
console.log('\n4. Check "카카오 로그인" is activated:');
console.log('   제품 설정 > 카카오 로그인 > 활성화 상태');
console.log('\n5. Verify consent items:');
console.log('   제품 설정 > 카카오 로그인 > 동의 항목');
console.log('   - Required: profile_nickname (필수)');
console.log('   - Optional: account_email (선택)');

console.log('\n\n🔧 Current NEXTAUTH_URL:');
console.log('─'.repeat(60));
console.log(`${process.env.NEXTAUTH_URL || 'NOT SET'}`);
console.log('\n⚠️  For production, this should match your deployed domain!');

console.log('\n\n💡 Troubleshooting Steps:');
console.log('─'.repeat(60));
console.log('1. Check Kakao Console has correct Redirect URIs');
console.log('2. Verify NEXTAUTH_URL matches current domain');
console.log('3. Clear browser cache and cookies');
console.log('4. Try in incognito/private mode');
console.log('5. Check browser console for detailed errors');

console.log('\n' + '='.repeat(60));
