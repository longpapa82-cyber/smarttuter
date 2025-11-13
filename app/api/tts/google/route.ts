import { NextRequest, NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';

// Google Cloud TTS API endpoint
// Provides natural Korean and English voices with SSML support

export async function POST(request: NextRequest) {
  try {
    const { text, gradeLevel, language = 'ko-KR', voiceName } = await request.json();

    console.log('🎤 Google TTS Request:', {
      textLength: text?.length,
      gradeLevel,
      language,
      voiceName: voiceName || 'default (ko-KR-Neural2-A)',
    });

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Cloud API key not found, falling back to Web Speech API');
      return NextResponse.json(
        { error: 'Google Cloud API key not configured', fallback: true },
        { status: 503 }
      );
    }

    // Initialize TTS client
    const client = new textToSpeech.TextToSpeechClient({
      apiKey: apiKey,
    });

    // Generate SSML based on grade level
    const ssml = generateSSML(text, gradeLevel);

    // Select voice based on language, grade level, and user preference
    const voice = selectVoice(language, gradeLevel, voiceName);
    console.log('🎙️ Selected Voice:', voice);

    // Configure audio
    const audioConfig = {
      audioEncoding: 'MP3' as const,
      speakingRate: getSpeakingRate(gradeLevel),
      pitch: getPitch(gradeLevel),
    };

    // Make TTS request
    const [response] = await client.synthesizeSpeech({
      input: { ssml },
      voice,
      audioConfig,
    });

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Return audio as base64
    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');

    return NextResponse.json({
      success: true,
      audio: audioBase64,
      contentType: 'audio/mp3',
    });

  } catch (error) {
    console.error('❌ Google TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', fallback: true },
      { status: 500 }
    );
  }
}

// Generate SSML with grade-level customization
function generateSSML(text: string, gradeLevel: string): string {
  const isElementary = gradeLevel.includes('초등');
  const isMiddle = gradeLevel.includes('중학');

  if (isElementary) {
    // Elementary: Slower, more emphasis, friendlier tone
    return `
      <speak>
        <prosody rate="slow" pitch="+2st">
          <emphasis level="moderate">
            ${escapeSSML(text)}
          </emphasis>
        </prosody>
      </speak>
    `;
  } else if (isMiddle) {
    // Middle school: Medium pace, slight emphasis
    return `
      <speak>
        <prosody rate="medium" pitch="+1st">
          ${escapeSSML(text)}
        </prosody>
      </speak>
    `;
  } else {
    // High school / University: Natural pace
    return `
      <speak>
        <prosody rate="medium">
          ${escapeSSML(text)}
        </prosody>
      </speak>
    `;
  }
}

// Select best voice for language and grade level
function selectVoice(language: string, gradeLevel: string, voiceName?: string) {
  const isKorean = language.startsWith('ko');

  if (isKorean) {
    // Use specified voice or default to Neural2-A (female, most natural)
    const defaultVoice = 'ko-KR-Neural2-A';
    return {
      languageCode: 'ko-KR',
      name: voiceName || defaultVoice,
    };
  } else {
    // English - use specified voice or default
    const defaultVoice = 'en-US-Neural2-F';
    return {
      languageCode: 'en-US',
      name: voiceName || defaultVoice,
    };
  }
}

// Get speaking rate based on grade level
function getSpeakingRate(gradeLevel: string): number {
  const isElementary = gradeLevel.includes('초등');
  const isMiddle = gradeLevel.includes('중학');

  if (isElementary) return 0.85; // 15% slower
  if (isMiddle) return 0.95; // 5% slower
  return 1.0; // Normal speed
}

// Get pitch adjustment based on grade level
function getPitch(gradeLevel: string): number {
  const isElementary = gradeLevel.includes('초등');

  if (isElementary) return 0.5; // Slightly higher pitch for friendliness (reduced from 2.0 for more natural sound)
  return 0.0; // Normal pitch
}

// Escape special characters for SSML
function escapeSSML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
