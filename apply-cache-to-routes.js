/**
 * 모든 튜터 라우트에 캐싱 최적화 적용
 * 수학 라우트에 적용한 패턴을 다른 과목에도 일괄 적용
 */

const fs = require('fs');
const path = require('path');

const routes = [
  {
    file: '/Users/hoonjaepark/projects/smartTuter/app/api/chat/english/route.ts',
    subject: 'english',
    subjectKo: '영어',
    icon: '📚'
  },
  {
    file: '/Users/hoonjaepark/projects/smartTuter/app/api/chat/science/route.ts',
    subject: 'science',
    subjectKo: '과학',
    icon: '🔬'
  },
  {
    file: '/Users/hoonjaepark/projects/smartTuter/app/api/chat/social-studies/route.ts',
    subject: 'social',
    subjectKo: '사회',
    icon: '🌍'
  }
];

function insertCacheLogic(content, subject, subjectKo, icon) {
  // 1. Add cache check after userProfile loading
  const cacheCheckCode = `
    // 🚀 Phase 1: Check smart cache first (saves 4 API calls if hit)
    const gradeStr = String(userProfile.gradeLevelDetail || '5');
    const cachedAnswer = responseCache.get(message, '${subject}', gradeStr);

    if (cachedAnswer) {
      const encoder = new TextEncoder();
      const cacheStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: cachedAnswer })}\\n\\n\`));
          controller.enqueue(encoder.encode("data: [DONE]\\n\\n"));
          controller.close();
        },
      });

      const stats = apiTracker.getStats();
      return new Response(cacheStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Cache-Hit": "smart-cache",
          "X-API-Remaining": stats.remaining.toString(),
        },
      });
    }

    // 🚀 Phase 2: Quick keyword-based classification (no API call)
    const quickClassification = quickClassify(message, '${subject}');

    if (quickClassification && !quickClassification.isOnTopic) {
      apiTracker.track('quick-classify-redirect');
      const encoder = new TextEncoder();
      const redirectStream = new ReadableStream({
        start(controller) {
          const redirectMsg = \`${icon} **${subjectKo} 튜터**에서 도와드려요! ${subjectKo} 관련 질문을 해주세요.\`;
          controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: redirectMsg })}\\n\\n\`));
          controller.enqueue(encoder.encode("data: [DONE]\\n\\n"));
          controller.close();
        },
      });

      return new Response(redirectStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Subject-Filter": "off-topic-quick-no-api",
        },
      });
    }
`;

  // Find insertion point (after userProfile check)
  const insertAfter = /if \(!userProfile\) \{[\s\S]*?\}\s*\n/;
  if (!insertAfter.test(content)) {
    console.log(`⚠️  Could not find userProfile check in ${subject}`);
    return content;
  }

  content = content.replace(insertAfter, match => match + cacheCheckCode);

  // 2. Add API tracking before sendMessageStream
  content = content.replace(
    /const result = await chat\.sendMessageStream\(message\);/,
    `// Track API call\n      apiTracker.track('chat-${subject}');\n\n      const result = await chat.sendMessageStream(message);`
  );

  // 3. Add smart cache save after response
  content = content.replace(
    /setCachedResponse\(cacheKey, fullResponse, 3600\)\.catch\(err => \{[\s\S]*?\}\);/,
    `setCachedResponse(cacheKey, fullResponse, 3600).catch(err => {
                console.error('Failed to cache response:', err);
              });

              // Smart cache for similarity matching
              responseCache.set(message, '${subject}', gradeStr, fullResponse);`
  );

  // 4. Add API stats to response headers
  content = content.replace(
    /return new Response\(readableStream, \{[\s]*headers: \{[\s]*"Content-Type": "text\/event-stream",[\s]*"Cache-Control": "no-cache",[\s]*"Connection": "keep-alive",/,
    `const stats = apiTracker.getStats();\n      return new Response(readableStream, {\n        headers: {\n          "Content-Type": "text/event-stream",\n          "Cache-Control": "no-cache",\n          "Connection": "keep-alive",\n          "X-API-Remaining": stats.remaining.toString(),\n          "X-Cache-Stats": JSON.stringify(responseCache.getStats()),`
  );

  return content;
}

// Apply to all routes
for (const route of routes) {
  try {
    let content = fs.readFileSync(route.file, 'utf8');

    // Check if already optimized
    if (content.includes('responseCache.get')) {
      console.log(`✅ ${route.subject} route already optimized`);
      continue;
    }

    content = insertCacheLogic(content, route.subject, route.subjectKo, route.icon);

    fs.writeFileSync(route.file, content, 'utf8');
    console.log(`✅ Applied cache optimization to ${route.subject} route`);
  } catch (error) {
    console.error(`❌ Failed to optimize ${route.subject}:`, error.message);
  }
}

console.log('\n🎉 Cache optimization applied to all routes!');
