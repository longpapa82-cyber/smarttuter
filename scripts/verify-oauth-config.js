/**
 * OAuth Configuration Verification Script
 * Validates environment variables and NextAuth setup
 */

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function checkEnvVar(name, value, requirements = {}) {
  const prefix = value ? '✅' : '❌';
  const status = value ? 'green' : 'red';

  log(`${prefix} ${name}`, status);

  if (value) {
    // Check format requirements
    if (requirements.pattern && !requirements.pattern.test(value)) {
      log(`   ⚠️  Warning: Value doesn't match expected pattern`, 'yellow');
      if (requirements.example) {
        log(`   Expected format: ${requirements.example}`, 'yellow');
      }
    }

    if (requirements.minLength && value.length < requirements.minLength) {
      log(`   ⚠️  Warning: Value seems too short (${value.length} chars)`, 'yellow');
    }

    // Show partial value for security
    const displayValue = value.length > 40
      ? value.substring(0, 20) + '...' + value.substring(value.length - 10)
      : value.substring(0, 30) + '...';
    log(`   Value: ${displayValue}`, 'blue');
  } else {
    log(`   Missing or empty`, 'red');
  }

  return !!value;
}

async function verifyOAuthConfig() {
  logSection('🔍 OAuth Configuration Verification');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const checks = {
    nextauth: [],
    google: [],
    kakao: []
  };

  // 1. NextAuth Configuration
  logSection('1️⃣  NextAuth Configuration');

  checks.nextauth.push(
    checkEnvVar('NEXTAUTH_URL', process.env.NEXTAUTH_URL, {
      pattern: /^https?:\/\/.+/,
      example: 'http://localhost:3000 or https://your-domain.com'
    })
  );

  checks.nextauth.push(
    checkEnvVar('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET, {
      minLength: 32
    })
  );

  // 2. Google OAuth
  logSection('2️⃣  Google OAuth Configuration');

  checks.google.push(
    checkEnvVar('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID, {
      pattern: /^[\w-]+\.apps\.googleusercontent\.com$/,
      example: 'your-client-id.apps.googleusercontent.com'
    })
  );

  checks.google.push(
    checkEnvVar('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET, {
      pattern: /^GOCSPX-/,
      example: 'GOCSPX-...'
    })
  );

  // 3. Kakao OAuth
  logSection('3️⃣  Kakao OAuth Configuration');

  checks.kakao.push(
    checkEnvVar('KAKAO_CLIENT_ID', process.env.KAKAO_CLIENT_ID, {
      minLength: 32,
      example: '32-character REST API key'
    })
  );

  checks.kakao.push(
    checkEnvVar('KAKAO_CLIENT_SECRET', process.env.KAKAO_CLIENT_SECRET, {
      minLength: 32,
      example: '32-character client secret'
    })
  );

  // 4. Summary
  logSection('📊 Verification Summary');

  const nextauthOk = checks.nextauth.every(c => c);
  const googleOk = checks.google.every(c => c);
  const kakaoOk = checks.kakao.every(c => c);

  log(`NextAuth: ${nextauthOk ? '✅ Ready' : '❌ Incomplete'}`, nextauthOk ? 'green' : 'red');
  log(`Google OAuth: ${googleOk ? '✅ Ready' : '❌ Incomplete'}`, googleOk ? 'green' : 'red');
  log(`Kakao OAuth: ${kakaoOk ? '✅ Ready' : '❌ Incomplete'}`, kakaoOk ? 'green' : 'red');

  // 5. Test NextAuth Configuration
  logSection('4️⃣  NextAuth Configuration Test');

  try {
    log('Testing NextAuth config import...', 'yellow');
    const { authOptions } = require('../lib/auth/config');

    const providerNames = authOptions.providers.map(p => p.id || p.name);
    log(`✅ NextAuth configured with providers: ${providerNames.join(', ')}`, 'green');

    // Check if providers are properly configured
    const hasGoogle = providerNames.includes('google');
    const hasKakao = providerNames.includes('kakao');
    const hasCredentials = providerNames.includes('credentials');

    if (hasGoogle) log('   ✅ Google provider found', 'green');
    if (hasKakao) log('   ✅ Kakao provider found', 'green');
    if (hasCredentials) log('   ✅ Credentials provider found', 'green');

  } catch (error) {
    log(`❌ Error loading NextAuth config: ${error.message}`, 'red');
  }

  // 6. Recommendations
  logSection('💡 Recommendations');

  if (!nextauthOk || !googleOk || !kakaoOk) {
    log('Some OAuth configurations are missing or incomplete.', 'yellow');
    log('', 'reset');
    log('Next steps:', 'cyan');

    if (!nextauthOk) {
      log('  1. Set up NextAuth environment variables', 'yellow');
      log('     - NEXTAUTH_URL should be your app URL', 'reset');
      log('     - NEXTAUTH_SECRET should be a secure random string', 'reset');
    }

    if (!googleOk) {
      log('  2. Set up Google OAuth credentials', 'yellow');
      log('     - Visit: https://console.cloud.google.com/apis/credentials', 'reset');
      log('     - Create OAuth 2.0 Client ID', 'reset');
      log('     - Add redirect URI: http://localhost:3000/api/auth/callback/google', 'reset');
    }

    if (!kakaoOk) {
      log('  3. Set up Kakao OAuth credentials', 'yellow');
      log('     - Visit: https://developers.kakao.com/console/app', 'reset');
      log('     - Create application and get REST API key', 'reset');
      log('     - Add redirect URI: http://localhost:3000/api/auth/callback/kakao', 'reset');
    }

    log('', 'reset');
    log('📖 For detailed instructions, visit:', 'cyan');
    log('   http://localhost:3000/auth-setup', 'blue');
  } else {
    log('✅ All OAuth configurations are set up correctly!', 'green');
    log('', 'reset');
    log('🎉 You can now test social login:', 'cyan');
    log('   1. Start the dev server (npm run dev)', 'reset');
    log('   2. Visit http://localhost:3000/login', 'reset');
    log('   3. Click on Google or Kakao login buttons', 'reset');
  }

  // 7. Configuration Status
  logSection('🔧 Current Configuration Status');

  const totalChecks = [...checks.nextauth, ...checks.google, ...checks.kakao].length;
  const passedChecks = [...checks.nextauth, ...checks.google, ...checks.kakao].filter(c => c).length;
  const percentage = Math.round((passedChecks / totalChecks) * 100);

  log(`Overall: ${passedChecks}/${totalChecks} checks passed (${percentage}%)`,
    percentage === 100 ? 'green' : percentage >= 66 ? 'yellow' : 'red');

  // Return exit code based on results
  return nextauthOk && googleOk && kakaoOk;
}

// Run verification
verifyOAuthConfig()
  .then(success => {
    if (success) {
      log('\n✅ OAuth configuration verification completed successfully!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  OAuth configuration has issues that need attention.', 'yellow');
      process.exit(1);
    }
  })
  .catch(error => {
    log('\n❌ Verification failed with error:', 'red');
    console.error(error);
    process.exit(1);
  });
