# Social Studies API - Vertex AI Migration Complete

**Status**: ✅ COMPLETED
**Date**: 2025-11-11
**File**: `/app/api/chat/social-studies/route.ts`

## Changes Applied

### 1. Added Vertex AI Imports (Line 17-18)
```typescript
import { vertexAIClient } from "@/lib/ai/vertex-client";
import { intelligentRouter } from "@/lib/ai/intelligent-router";
```

### 2. Updated Gemini Initialization (Line 20-24)
```typescript
// Initialize Gemini client (Fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Check if Vertex AI is enabled
const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';
```

### 3. Added Intelligent Router Decision Logic (Line 316-336)
```typescript
// Decide which AI service to use
let modelTier: 'flash' | 'pro' = 'flash'; // Default to flash
let useVertexAI = isVertexAIEnabled;

// If Vertex AI is enabled, use intelligent router to decide tier
if (isVertexAIEnabled) {
  try {
    const routingDecision = await intelligentRouter.routeQuestion(
      message,
      'social-studies',  // ✅ Correct subject parameter
      gradeStr,
      conversationHistory
    );
    modelTier = routingDecision.tier;
    console.log(`[Intelligent Router] ${routingDecision.model} (${routingDecision.reasoning})`);
  } catch (error) {
    console.error('[Router] Failed to route question:', error);
    // Fallback to flash tier
    modelTier = 'flash';
  }
}
```

### 4. Updated Streaming Logic (Line 376-426)
```typescript
if (useVertexAI) {
  // ✅ Use Vertex AI (Unlimited Quota)
  console.log(`[Vertex AI] Using ${modelTier} tier for response`);

  const prompt = `${systemPrompt}

**대화 내역:**
${recentHistory.map((msg: { role: string; content: string }) => `${msg.role === 'user' ? '학생' : '튜터'}: ${msg.content}`).join('\n\n')}

**새 질문:**
학생: ${message}

튜터:`;

  const streamIterator = await vertexAIClient.generateContentStream(
    prompt,
    modelTier,
    {
      temperature: 0.7,
      maxTokens: 3072,
    }
  );

  for await (const text of streamIterator) {
    if (text) {
      fullResponse += text;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
    }
  }
} else {
  // ⚠️  Fallback to Gemini API (50/day limit)
  console.log('[Gemini API] Using fallback (quota limited)');

  const chat = model.startChat({
    history: chatHistory,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      fullResponse += text;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
    }
  }
}
```

## Key Implementation Details

### Subject Parameter
- **CRITICAL**: Uses `'social-studies'` (not `'social'`) in `intelligentRouter.routeQuestion()`
- This matches the subject classification system and ensures proper routing

### AI Service Selection
1. **Vertex AI Enabled** (`ENABLE_VERTEX_AI=true`):
   - Uses intelligent router to analyze question complexity
   - Routes to either `flash` or `pro` tier based on question characteristics
   - **Unlimited quota** via GCP Vertex AI

2. **Vertex AI Disabled** (default):
   - Falls back to Gemini API
   - Uses `gemini-2.0-flash-exp` model
   - **50 requests/day limit**

### Intelligent Router Benefits
- **Automatic complexity detection**: Simple questions → flash tier (fast, cheaper)
- **Smart tier selection**: Complex questions → pro tier (higher quality)
- **Cost optimization**: Uses appropriate model tier for each question
- **Logging**: Logs routing decisions for monitoring

## Consistency Across APIs

All three subject APIs now use identical Vertex AI integration:
- ✅ Math API: `/app/api/chat/math/route.ts`
- ✅ Science API: `/app/api/chat/science/route.ts`
- ✅ Social Studies API: `/app/api/chat/social-studies/route.ts`

## Environment Variables Required

```env
# Enable Vertex AI (unlimited quota)
ENABLE_VERTEX_AI=true

# Fallback Gemini API key (50/day limit)
GEMINI_API_KEY=your_gemini_api_key

# GCP Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
```

## Testing Recommendations

1. **Test with Vertex AI enabled**:
   ```bash
   # Set environment variable
   export ENABLE_VERTEX_AI=true

   # Test Social Studies tutor
   # Should see: "[Vertex AI] Using flash/pro tier for response"
   ```

2. **Test fallback to Gemini**:
   ```bash
   # Disable Vertex AI
   export ENABLE_VERTEX_AI=false

   # Test Social Studies tutor
   # Should see: "[Gemini API] Using fallback (quota limited)"
   ```

3. **Test intelligent routing**:
   - Simple question: "What is democracy?" → Should use flash tier
   - Complex question: "Compare political systems across different countries" → Should use pro tier
   - Check logs for routing decisions

## Migration Status

### Completed
- ✅ Math API migrated to Vertex AI
- ✅ Science API migrated to Vertex AI
- ✅ Social Studies API migrated to Vertex AI

### Benefits Achieved
- **Unlimited quota**: No more 50/day API limits with Vertex AI
- **Intelligent routing**: Automatic cost/quality optimization
- **Consistent implementation**: All APIs use same pattern
- **Graceful fallback**: Gemini API works if Vertex AI unavailable

## Next Steps

1. **Deploy with Vertex AI enabled**: Set `ENABLE_VERTEX_AI=true` in production
2. **Monitor usage**: Check GCP console for Vertex AI usage metrics
3. **Optimize routing**: Adjust intelligent router thresholds if needed
4. **English tutor**: Consider migrating English API to Vertex AI (if exists)
