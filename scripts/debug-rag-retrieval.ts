/**
 * Debug RAG Retrieval System
 *
 * Tests retrieveVerifiedContent directly to see what's happening
 */

import { retrieveVerifiedContent } from '@/lib/tutor/rag-system';

async function debugRAGRetrieval() {
  console.log('═══════════════════════════════════════════');
  console.log('RAG RETRIEVAL DEBUG');
  console.log('═══════════════════════════════════════════\n');

  const testCases = [
    { question: '덧셈이 뭐예요?', subject: 'math' as const, grade: '1' },
    { question: 'What is a fraction?', subject: 'math' as const, grade: '3' },
    { question: 'What is present tense?', subject: 'english' as const, grade: '2' },
    { question: 'What is photosynthesis?', subject: 'science' as const, grade: '5' },
  ];

  for (const testCase of testCases) {
    console.log(`\n────────────────────────────────────────────`);
    console.log(`Question: "${testCase.question}"`);
    console.log(`Subject: ${testCase.subject}, Grade: ${testCase.grade}`);
    console.log(`────────────────────────────────────────────`);

    try {
      const result = await retrieveVerifiedContent(
        testCase.question,
        testCase.subject,
        testCase.grade,
        3
      );

      console.log(`\n✓ Retrieved ${result.content.length} content pieces`);

      if (result.content.length > 0) {
        const avgConfidence = result.content.reduce((sum, c) => sum + (c.confidence ?? 1.0), 0) / result.content.length;
        console.log(`Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
        console.log(`RAG Direct Trigger: ${avgConfidence > 0.9 && result.content.length >= 2 ? 'YES ✅' : 'NO ❌'}`);

        console.log(`\nRetrieved Topics:`);
        result.content.forEach((c, i) => {
          console.log(`  ${i + 1}. ${c.topicKo || c.topic} (${c.gradeLevel}학년)`);
          console.log(`     Confidence: ${((c.confidence ?? 1.0) * 100).toFixed(1)}%`);
          console.log(`     Relevance: ${result.relevanceScores[i]}%`);
        });
      } else {
        console.log(`❌ No content retrieved!`);
        console.log(`This means either:`);
        console.log(`  1. AI couldn't identify relevant topics`);
        console.log(`  2. No matching content in database`);
        console.log(`  3. Topic matching logic failed`);
      }

    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log('Debug Complete');
  console.log(`═══════════════════════════════════════════\n`);
}

debugRAGRetrieval().catch(console.error);
