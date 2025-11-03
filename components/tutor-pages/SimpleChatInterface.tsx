'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX, Settings as SettingsIcon, Sparkles, Image as ImageIcon, Mic, TrendingUp, Theater, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { ContinuousVoiceInput } from '@/components/voice/ContinuousVoiceInput';
import { VoiceSettings, VoiceSettingsConfig, DEFAULT_VOICE_SETTINGS } from '@/components/voice/VoiceSettings';
import { getSubjectDefaultSettings, shouldAutoStartVoice } from '@/lib/voice/subject-defaults';
import { detectVoiceCommand, getConfirmationMessage, adjustVoiceSpeed } from '@/lib/voice/voice-command-processor';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { usePuterTTS } from '@/hooks/usePuterTTS';
import { startSession, updateCurrentSession, endSession } from '@/lib/utils/learningData';
import { TypingEffect } from '@/components/ui/TypingEffect';
import EnglishImageUpload from '@/components/chat/EnglishImageUpload';
import MathImageUpload from '@/components/math/MathImageUpload';
import InteractiveMathGraph from '@/components/math/InteractiveMathGraph';
import StepByStepSolution from '@/components/math/StepByStepSolution';
import ErrorFeedback from '@/components/math/ErrorFeedback';
import PronunciationPractice from '@/components/pronunciation/PronunciationPractice';
import LevelAssessmentCard from '@/components/learning/LevelAssessmentCard';
import LevelUpNotification from '@/components/learning/LevelUpNotification';
import RoleplaySelector from '@/components/roleplay/RoleplaySelector';
import { assessLevel, type LevelAssessment, type CEFRLevel } from '@/lib/learning/level-detector';
import {
  createInitialAdaptiveState,
  addConversationTurn,
  type AdaptiveLearningState,
  type DifficultyAdjustmentResult,
} from '@/lib/learning/adaptive-learning';
import type { RoleplayScenario } from '@/lib/roleplay/scenarios';
import { parseStepByStepSolution, hasStepByStepFormat } from '@/lib/math/step-parser';
import { parseErrorDiagnosisResponse, hasErrorDiagnosisFormat, extractCleanContent } from '@/lib/math/error-parser';
import { parseGraphInfo, type GraphInfo } from '@/lib/math/graph-parser';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SimpleChatInterfaceProps {
  subject: 'english' | 'math';
  gradeLevel: string;
}

export default function SimpleChatInterface({ subject, gradeLevel }: SimpleChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Voice settings - subject-specific defaults + grade level optimization
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsConfig>(() => {
    // Phase 1 (P0): Get subject-specific defaults
    // Math: Korean + Push-to-Talk + manual start
    // English: English (UK) + Always-On + auto-start
    const baseSettings = { ...getSubjectDefaultSettings(subject) };

    // Optimize voice speed and pitch for grade level
    if (gradeLevel.includes('초등')) {
      // Elementary: slower, higher pitch for friendliness
      baseSettings.voiceSpeed = 0.9;
      baseSettings.voicePitch = 1.2;
    } else if (gradeLevel.includes('중학')) {
      // Middle school: slightly slower
      baseSettings.voiceSpeed = 0.95;
      baseSettings.voicePitch = 1.1;
    } else {
      // High school / University: normal speed
      baseSettings.voiceSpeed = 1.0;
      baseSettings.voicePitch = 1.0;
    }

    console.log(`✅ Voice settings initialized for ${subject} tutor:`, {
      inputMode: baseSettings.inputMode,
      inputLanguage: baseSettings.inputLanguage,
      outputLanguage: baseSettings.outputLanguage,
    });

    return baseSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
  const [pronunciationText, setPronunciationText] = useState('');
  const [isLevelAssessmentOpen, setIsLevelAssessmentOpen] = useState(false);
  const [levelAssessment, setLevelAssessment] = useState<LevelAssessment | null>(null);
  const [isRoleplayOpen, setIsRoleplayOpen] = useState(false);
  const [activeRoleplay, setActiveRoleplay] = useState<RoleplayScenario | null>(null);
  const [isMathGraphOpen, setIsMathGraphOpen] = useState(false);
  const [mathGraphType, setMathGraphType] = useState<'quadratic' | 'linear' | 'circle' | 'trigonometric' | 'exponential'>('quadratic');
  const [detectedGraph, setDetectedGraph] = useState<GraphInfo | null>(null);

  // Adaptive Learning State (English only)
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveLearningState | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<{
    isOpen: boolean;
    adjustmentResult: DifficultyAdjustmentResult;
    fromLevel: CEFRLevel;
    toLevel: CEFRLevel;
  } | null>(null);

  // Browser TTS (Web Speech API)
  const browserTTS = useSpeechSynthesis({
    lang: voiceSettings.outputLanguage,
    rate: voiceSettings.voiceSpeed,
    pitch: voiceSettings.voicePitch,
    volume: voiceSettings.voiceVolume,
  });

  // Puter.js TTS (Higher quality)
  const puterTTS = usePuterTTS({
    language: voiceSettings.outputLanguage,
    engine: voiceSettings.puterEngine,
  });

  // Select active TTS based on settings
  const activeTTS = voiceSettings.ttsEngine === 'puter' ? puterTTS : browserTTS;
  const { speak, stop, isSpeaking } = activeTTS;
  const isTTSSupported = voiceSettings.ttsEngine === 'puter' ? puterTTS.isReady : browserTTS.isSupported;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start session on mount and add welcome message
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized.current) {
      hasInitialized.current = true;

      const newSessionId = startSession(subject, gradeLevel);
      setSessionId(newSessionId);
      console.log(`✅ Learning session started: ${newSessionId}`);

      // Initialize adaptive learning state for English tutor
      if (subject === 'english') {
        const initialState = createInitialAdaptiveState('user-' + newSessionId, 'A2');
        setAdaptiveState(initialState);
        console.log('✅ Adaptive learning initialized at level A2');
      }

      // Add personalized welcome message based on grade level and subject
      const getWelcomeMessage = () => {
        const isElementary = gradeLevel.includes('초등');
        const isMiddle = gradeLevel.includes('중학');
        const isHigh = gradeLevel.includes('고등');
        const isEnglish = subject === 'english';

        if (isElementary) {
          return isEnglish
            ? `안녕! 😊 AI Park이에요! 오늘은 재미있게 영어 공부해봐요! 🌈\n\n무엇이 궁금한가요? 편하게 물어보세요! ✨`
            : `안녕! 🌟 AI Park이에요! 오늘은 재미있게 수학 공부해봐요! 🎯\n\n어떤 문제가 궁금한가요? 같이 풀어봐요! 💪`;
        } else if (isMiddle) {
          return isEnglish
            ? `안녕하세요! 👋 AI Park입니다! 오늘도 열심히 영어 공부해봐요!\n\n무엇을 배우고 싶나요? 편하게 질문해주세요! 📚`
            : `안녕하세요! 😊 AI Park입니다! 오늘도 열심히 수학 공부해봐요!\n\n어떤 개념이 궁금한가요? 함께 풀어봐요! 🔢`;
        } else if (isHigh) {
          return isEnglish
            ? `안녕하세요! AI Park입니다. 오늘은 어떤 주제를 공부할까요?\n\n문법, 독해, 작문 등 무엇이든 질문해주세요. 함께 실력을 쌓아봐요! 💡`
            : `안녕하세요! AI Park입니다. 오늘은 어떤 주제를 공부할까요?\n\n개념 설명이나 문제 풀이, 무엇이든 질문해주세요. 차근차근 풀어봐요! ✓`;
        } else {
          return isEnglish
            ? `안녕하세요. AI Park입니다. 어떤 주제를 다루시겠습니까?\n\n학술 영어, 전문 분야 등 필요한 부분을 질문해주세요.`
            : `안녕하세요. AI Park입니다. 어떤 주제를 학습하시겠습니까?\n\n고급 수학 개념, 증명, 응용 등 필요한 부분을 질문해주세요.`;
        }
      };

      setMessages([
        {
          role: 'assistant',
          content: getWelcomeMessage(),
        },
      ]);
    }

    // End session on unmount
    return () => {
      if (typeof window !== 'undefined' && sessionId) {
        endSession();
        console.log(`✅ Learning session ended: ${sessionId}`);
      }
    };
  }, [subject, gradeLevel]);

  // Update session when messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      updateCurrentSession({
        messageCount: messages.length,
      });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-play TTS for assistant responses (only after user interaction)
  useEffect(() => {
    if (!voiceSettings.autoPlayResponses || !isTTSEnabled || !isTTSSupported || !hasUserInteracted) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !isLoading) {
      // Speak the last assistant message
      speak(lastMessage.content);
    }
  }, [messages, isLoading, voiceSettings.autoPlayResponses, isTTSEnabled, isTTSSupported, hasUserInteracted, speak]);

  // Handle OCR recognized text
  const handleImageTextRecognized = (text: string, metadata?: { confidence: number; contentType: string }) => {
    // Format the message with OCR metadata
    const formattedMessage = `📷 이미지에서 인식된 텍스트:

${text}

이 내용을 설명해주세요.`;

    // Send the OCR text as a user message
    handleSubmit(undefined, formattedMessage);

    // Close the upload panel
    setIsImageUploadOpen(false);
  };

  // Handle level assessment
  const handleLevelAssessment = () => {
    if (messages.length === 0) {
      alert('먼저 튜터와 대화를 나눈 후 레벨 평가를 받을 수 있습니다.');
      return;
    }

    // Filter only user messages for assessment
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => ({ content: m.content }));

    const assessment = assessLevel(userMessages);
    setLevelAssessment(assessment);
    setIsLevelAssessmentOpen(true);
  };

  // Handle roleplay scenario selection
  const handleSelectRoleplay = (scenario: RoleplayScenario) => {
    setActiveRoleplay(scenario);
    setIsRoleplayOpen(false);

    // Clear current messages and start with scenario initial message
    setMessages([{
      role: 'assistant',
      content: `🎭 **롤플레이 시작: ${scenario.title}**

📖 **상황**: ${scenario.situation}

👤 **당신의 역할**: ${scenario.yourRole}
🤖 **AI 역할**: ${scenario.aiRole}

🎯 **학습 목표**:
${scenario.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

---

${scenario.initialMessage}`,
    }]);
  };

  /**
   * Phase 2 (P0): 음성 명령어 처리
   * 음성 입력에서 명령어를 감지하고 실행
   */
  const handleVoiceCommand = (transcript: string): boolean => {
    const detection = detectVoiceCommand(transcript, voiceSettings.inputLanguage);

    if (!detection.isCommand || !detection.command) {
      return false; // 명령어가 아니면 false 반환
    }

    const { command } = detection;
    const confirmationMsg = getConfirmationMessage(command, voiceSettings.inputLanguage);

    console.log(`✅ Executing voice command: ${command.type}`);

    // 명령어 실행
    switch (command.type) {
      case 'mute':
        setIsTTSEnabled(false);
        stop();
        speak(confirmationMsg);
        break;

      case 'unmute':
        setIsTTSEnabled(true);
        speak(confirmationMsg);
        break;

      case 'stop_listening':
        // ContinuousVoiceInput의 경우 수동으로 중지해야 함 (향후 개선)
        speak(confirmationMsg);
        break;

      case 'start_listening':
        // ContinuousVoiceInput의 경우 수동으로 시작해야 함 (향후 개선)
        speak(confirmationMsg);
        break;

      case 'repeat':
        // 마지막 assistant 메시지 찾기
        const lastAssistantMessage = [...messages]
          .reverse()
          .find((m) => m.role === 'assistant');

        if (lastAssistantMessage) {
          speak(confirmationMsg);
          setTimeout(() => {
            speak(lastAssistantMessage.content);
          }, 1000);
        } else {
          const noMessageText =
            voiceSettings.inputLanguage.startsWith('ko')
              ? '반복할 메시지가 없습니다.'
              : 'No message to repeat.';
          speak(noMessageText);
        }
        break;

      case 'slower':
        const slowerSpeed = adjustVoiceSpeed(voiceSettings.voiceSpeed, 'slower');
        setVoiceSettings((prev) => ({ ...prev, voiceSpeed: slowerSpeed }));
        speak(confirmationMsg);
        console.log(`🐌 Voice speed decreased to ${slowerSpeed}`);
        break;

      case 'faster':
        const fasterSpeed = adjustVoiceSpeed(voiceSettings.voiceSpeed, 'faster');
        setVoiceSettings((prev) => ({ ...prev, voiceSpeed: fasterSpeed }));
        speak(confirmationMsg);
        console.log(`🚀 Voice speed increased to ${fasterSpeed}`);
        break;

      default:
        return false;
    }

    return true; // 명령어가 실행되었음
  };

  const handleSubmit = async (e?: React.FormEvent, messageText?: string) => {
    e?.preventDefault();

    // Mark that user has interacted (enables autoplay)
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    // Phase 2 (P0): 음성 명령어 먼저 확인
    if (messageText) {
      // 음성 입력인 경우에만 명령어 감지
      const isCommand = handleVoiceCommand(userMessage);
      if (isCommand) {
        return; // 명령어가 실행되었으면 여기서 종료
      }
    }

    // Smart TTS: 음성 입력 시 TTS 켜기, 텍스트 입력 시 TTS 끄기
    const isVoiceInput = !!messageText; // messageText가 있으면 음성 입력
    if (isVoiceInput && !isTTSEnabled) {
      console.log('🔊 Voice input detected - enabling TTS');
      setIsTTSEnabled(true);
    } else if (!isVoiceInput && isTTSEnabled) {
      console.log('⌨️ Text input detected - disabling TTS');
      setIsTTSEnabled(false);
    }

    setInput('');

    // Stop any ongoing TTS
    stop();

    // 새 사용자 메시지를 추가한 업데이트된 히스토리 생성
    const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    // 감정 분석을 위한 이벤트 발생
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tutor-message-sent', {
        detail: {
          message: userMessage,
          conversationHistory: messages.slice(-10).map(m => m.content),
        },
      });
      window.dispatchEvent(event);
    }

    try {
      // Prepare API request body
      const requestBody: any = {
        message: userMessage,
        gradeLevel,
        // 새 메시지를 포함한 히스토리 전송 (단, 마지막 유저 메시지는 제외)
        conversationHistory: messages.slice(-10),
      };

      // Add current CEFR level for English adaptive learning
      if (subject === 'english' && adaptiveState) {
        requestBody.cefrLevel = adaptiveState.currentLevel;
        console.log('📊 Sending request with CEFR level:', adaptiveState.currentLevel);
      }

      const response = await fetch(`/api/chat/${subject}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];

                    // Update existing assistant message or create new one
                    if (lastMessage && lastMessage.role === 'assistant') {
                      // Update existing assistant message (avoid mutation)
                      newMessages[newMessages.length - 1] = {
                        ...lastMessage,
                        content: assistantMessage,
                      };
                    } else {
                      // Create new assistant message
                      newMessages.push({ role: 'assistant', content: assistantMessage });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // After streaming is complete, detect graph in math subject
      if (subject === 'math' && assistantMessage) {
        const graphInfo = parseGraphInfo(assistantMessage);
        if (graphInfo) {
          console.log('📊 Graph detected:', graphInfo);
          setDetectedGraph(graphInfo);
          setIsMathGraphOpen(true);
        }
      }

      // Update adaptive learning state for English tutor
      if (subject === 'english' && adaptiveState && userMessage) {
        const { updatedState, adjustmentResult } = addConversationTurn(
          adaptiveState,
          userMessage,
          10 // Assessment every 10 turns
        );

        setAdaptiveState(updatedState);

        // Show level-up notification if level changed
        if (adjustmentResult.shouldAdjust && adjustmentResult.newLevel) {
          console.log('🎉 Level adjustment:', {
            from: adaptiveState.currentLevel,
            to: adjustmentResult.newLevel,
            reason: adjustmentResult.reason,
          });

          setLevelUpNotification({
            isOpen: true,
            adjustmentResult,
            fromLevel: adaptiveState.currentLevel,
            toLevel: adjustmentResult.newLevel,
          });
        }

        // Log assessment info
        if (adjustmentResult.assessment) {
          console.log('📊 Assessment:', {
            level: adjustmentResult.assessment.currentLevel,
            confidence: adjustmentResult.assessment.confidence,
            score: adjustmentResult.assessment.assessmentDetails.overallScore,
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);

      // 사용자에게 구체적인 안내 메시지 제공
      const errorMessage = `⚠️ 일시적인 오류가 발생했습니다.

💡 다음 방법을 시도해주세요:

1️⃣ **네트워크 연결 확인**
   - 인터넷 연결이 안정적인지 확인해주세요
   - Wi-Fi 또는 데이터 연결 상태를 체크해주세요

2️⃣ **잠시 후 다시 시도**
   - 서버가 일시적으로 바쁠 수 있습니다
   - 30초 정도 기다린 후 다시 메시지를 보내주세요

3️⃣ **페이지 새로고침**
   - 브라우저 새로고침(F5 또는 Ctrl+R)을 해주세요

4️⃣ **문제가 계속되면**
   - 브라우저 캐시를 삭제해주세요
   - 다른 브라우저에서 시도해주세요

📝 참고: 현재 AI 서비스가 점검 중이거나 일시적으로 사용할 수 없는 상태일 수 있습니다.`;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subject === 'english' ? '영어' : '수학'} 튜터
            </h1>
            <p className="text-sm text-gray-600">학년: {gradeLevel}</p>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            {/* Roleplay Button (English only) */}
            {subject === 'english' && (
              <button
                onClick={() => setIsRoleplayOpen(true)}
                className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                title="롤플레이"
                aria-label="Start roleplay scenario"
              >
                <Theater className="w-5 h-5" />
              </button>
            )}

            {/* Level Assessment Button (English only) */}
            {subject === 'english' && (
              <button
                onClick={handleLevelAssessment}
                className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                title="레벨 평가"
                aria-label="Check English level"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            )}

            {/* Pronunciation Practice Button (English only) */}
            {subject === 'english' && (
              <button
                onClick={() => {
                  setPronunciationText('Hello, how are you today?');
                  setIsPronunciationOpen(true);
                }}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="발음 연습"
                aria-label="Open pronunciation practice"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            {/* Interactive Graph Button (Math only) */}
            {subject === 'math' && (
              <button
                onClick={() => {
                  setMathGraphType('quadratic');
                  setIsMathGraphOpen(true);
                }}
                className="p-2 rounded-lg bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition-colors"
                title="인터랙티브 그래프"
                aria-label="Open interactive math graph"
              >
                <LineChart className="w-5 h-5" />
              </button>
            )}

            {isTTSSupported && (
              <button
                onClick={() => {
                  setIsTTSEnabled(!isTTSEnabled);
                  if (isTTSEnabled) stop();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isTTSEnabled
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={isTTSEnabled ? 'TTS 끄기' : 'TTS 켜기'}
                aria-label={isTTSEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
              >
                {isTTSEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="음성 설정"
              aria-label="Open voice settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[50vh]">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg mb-2">👋 안녕하세요!</p>
              <p>궁금한 것을 물어보세요.</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                  delay: index === messages.length - 1 ? 0 : 0
                }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  initial={message.role === 'assistant' ? { x: -10 } : { x: 10 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-900 shadow-md border border-gray-100'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      {/* Extract clean content (without error diagnosis formatting) */}
                      {(() => {
                        const cleanContent = subject === 'math' && hasErrorDiagnosisFormat(message.content)
                          ? extractCleanContent(message.content)
                          : message.content;

                        return cleanContent && (
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {/* Show typing effect only for the last message when not streaming */}
                            {index === messages.length - 1 ? (
                              <TypingEffect
                                text={cleanContent}
                                speed={20}
                                isStreaming={isLoading}
                              />
                            ) : (
                              cleanContent
                            )}
                          </p>
                        );
                      })()}

                      {/* 수학 오답 진단 렌더링 */}
                      {subject === 'math' && hasErrorDiagnosisFormat(message.content) && (
                        <div className="mt-4">
                          <ErrorFeedback
                            diagnosis={parseErrorDiagnosisResponse(message.content)!}
                            onRetry={() => {
                              // Retry: clear last user message and allow re-attempt
                              const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
                              if (lastUserMessageIndex !== -1) {
                                setInput(messages[lastUserMessageIndex].content);
                                setMessages(messages.slice(0, lastUserMessageIndex));
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* 수학 단계별 풀이 렌더링 */}
                      {subject === 'math' && hasStepByStepFormat(message.content) && (
                        <StepByStepSolution solution={parseStepByStepSolution(message.content)} />
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                  <div className="flex space-x-1.5">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500">생각하는 중...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Image Upload Panel - English */}
          <AnimatePresence>
            {isImageUploadOpen && subject === 'english' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <EnglishImageUpload
                    onTextRecognized={handleImageTextRecognized}
                    onClose={() => setIsImageUploadOpen(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Upload Modal - Math */}
          <AnimatePresence>
            {isImageUploadOpen && subject === 'math' && (
              <MathImageUpload
                onTextRecognized={handleImageTextRecognized}
                onClose={() => setIsImageUploadOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Chat Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
          {/* Continuous Voice Input (when enabled) */}
          {voiceSettings.inputMode === 'continuous' && (
            <ContinuousVoiceInput
              onTranscript={(transcript) => {
                // Optionally read back the input
                if (voiceSettings.repeatUserInput && isTTSSupported) {
                  speak(transcript);
                }
                // Send the voice input as a message
                handleSubmit(undefined, transcript);
              }}
              onError={(error) => {
                console.error('Continuous voice error:', error);
              }}
              language={voiceSettings.inputLanguage}
              disabled={isLoading}
              autoSend={true}
              silenceThreshold={2000}
              autoStart={false} // User must manually activate continuous mode
            />
          )}

          <div className="flex gap-2 items-end">
            {/* Voice Input Button (Push-to-talk mode) */}
            {voiceSettings.inputMode === 'push-to-talk' && (
              <div className="shrink-0">
                <VoiceButton
                  onTranscript={(transcript) => {
                    // Optionally read back the input
                    if (voiceSettings.repeatUserInput && isTTSSupported) {
                      speak(transcript);
                    }
                    // Send the voice input as a message
                    handleSubmit(undefined, transcript);
                  }}
                  onError={(error) => {
                    console.error('Voice input error:', error);
                  }}
                  language={voiceSettings.inputLanguage}
                  disabled={isLoading}
                  size="md"
                  variant="circle"
                  showLabel={false}
                />
              </div>
            )}

            {/* Image Upload Button (English only) */}
            {subject === 'english' && (
              <button
                type="button"
                onClick={() => setIsImageUploadOpen(!isImageUploadOpen)}
                disabled={isLoading}
                className={`shrink-0 p-3 rounded-xl transition-all ${
                  isImageUploadOpen
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="이미지에서 텍스트 인식"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            )}

            {/* Image Upload Button (Math only) */}
            {subject === 'math' && (
              <button
                type="button"
                onClick={() => setIsImageUploadOpen(!isImageUploadOpen)}
                disabled={isLoading}
                className={`shrink-0 p-3 rounded-xl transition-all ${
                  isImageUploadOpen
                    ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="수학 문제 사진 업로드"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            )}

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하거나 음성으로 말하세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎓</span>
                </div>
                <span className="text-lg font-bold">AI Park</span>
              </div>
              <p className="text-gray-400 text-sm">AI 기반 개인 맞춤형 학습 플랫폼</p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">서비스</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a className="hover:text-white transition-colors" href="/tutor/english">
                    English Park
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/tutor/math">
                    Math Park
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="/analytics">
                    학습 리포트
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">회사</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    소개
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    블로그
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    채용
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">지원</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    도움말
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    문의
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">© 2025 AI Park. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Voice Settings Panel */}
      <VoiceSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
      />

      {/* Pronunciation Practice Modal */}
      <AnimatePresence>
        {isPronunciationOpen && subject === 'english' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsPronunciationOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <PronunciationPractice
                targetText={pronunciationText}
                onClose={() => setIsPronunciationOpen(false)}
                gradeLevel={gradeLevel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Assessment Modal */}
      <AnimatePresence>
        {isLevelAssessmentOpen && levelAssessment && subject === 'english' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsLevelAssessmentOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <LevelAssessmentCard
                assessment={levelAssessment}
                onClose={() => setIsLevelAssessmentOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roleplay Selector Modal */}
      <AnimatePresence>
        {isRoleplayOpen && subject === 'english' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsRoleplayOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <RoleplaySelector
                gradeLevel={gradeLevel}
                onSelectScenario={handleSelectRoleplay}
                onClose={() => setIsRoleplayOpen(false)}
                currentCEFRLevel={adaptiveState?.currentLevel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Math Graph Modal */}
      <AnimatePresence>
        {isMathGraphOpen && subject === 'math' && (
          <InteractiveMathGraph
            type={detectedGraph?.type || mathGraphType}
            equation={detectedGraph?.equation}
            description={detectedGraph?.description}
            onClose={() => {
              setIsMathGraphOpen(false);
              setDetectedGraph(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Level Up Notification Modal (English only) */}
      {levelUpNotification && subject === 'english' && (
        <LevelUpNotification
          isOpen={levelUpNotification.isOpen}
          onClose={() => setLevelUpNotification(null)}
          adjustmentResult={levelUpNotification.adjustmentResult}
          fromLevel={levelUpNotification.fromLevel}
          toLevel={levelUpNotification.toLevel}
        />
      )}
    </div>
  );
}
