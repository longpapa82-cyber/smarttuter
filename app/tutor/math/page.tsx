"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Home,
  BarChart3,
  BookOpen,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Card } from "@/components/ui/Card";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  createSession,
  endSession,
  saveSession,
  type LearningSession,
} from "@/lib/learningSession";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function MathTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition hook (Korean)
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechRecognitionSupported,
  } = useSpeechRecognition({
    lang: "ko-KR",
    continuous: false,
    interimResults: true,
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handleSendMessage(finalTranscript);
        resetTranscript();
      }
    },
  });

  // Text-to-speech hook (Korean)
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported,
  } = useSpeechSynthesis({
    lang: "ko-KR",
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  });

  useEffect(() => {
    // Load user preferences
    const grade = localStorage.getItem("userGrade") || "초등학교";
    setGradeLevel(grade);

    // Create new learning session
    const session = createSession("math", grade);
    setCurrentSession(session);

    // Welcome message
    const welcomeMessage = {
      id: "welcome",
      role: "assistant" as const,
      content: `안녕하세요! 수학 튜터입니다. 👋\n\n${grade} 학생에게 맞는 수학 학습을 도와드리겠습니다.\n\n궁금한 개념이나 풀고 싶은 문제를 자유롭게 질문해주세요!\n\n예시:\n• "이차방정식이 뭐야?"\n• "3x + 5 = 20을 풀어줘"\n• "분수의 나눗셈을 어떻게 하는지 설명해줘"`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);

    // Save session when leaving page
    return () => {
      if (session && messages.length > 1) {
        const sessionWithMessages = {
          ...session,
          messages: messages.filter(m => m.id !== "welcome"),
        };
        const completedSession = endSession(sessionWithMessages);
        saveSession(completedSession);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update current session with new message
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      });
    }

    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Call API to get AI response with streaming
      const response = await fetch("/api/chat/math", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          gradeLevel,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              break;
            }

            try {
              const json = JSON.parse(data);
              if (json.text) {
                accumulatedText += json.text;

                // Update message in real-time
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
              console.error("JSON parse error:", e);
            }
          }
        }
      }

      // Auto-speak response in voice mode
      if (autoSpeak && isVoiceMode && accumulatedText) {
        speak(accumulatedText);
      }
    } catch (error) {
      console.error("Error:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "죄송합니다. 현재 서버와 연결할 수 없습니다. API 키를 설정해주세요.\n\n.env.local 파일에 ANTHROPIC_API_KEY를 추가하시면 AI 튜터 기능을 사용하실 수 있습니다.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File, preview: string) => {
    setCurrentImage(preview);
    setCurrentImageFile(file);
  };

  const handleImageRemove = () => {
    setCurrentImage(null);
    setCurrentImageFile(null);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      handleImageSelect(file, preview);
      // Automatically submit the image
      setTimeout(() => handleImageSubmit(), 100);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async () => {
    if (!currentImage) return;

    // Add user message with image
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "[📷 이미지 업로드] 수학 문제 이미지를 업로드했습니다.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update current session
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      });
    }

    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Call Vision API
      const response = await fetch("/api/chat/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: currentImage,
          gradeLevel,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              break;
            }

            try {
              const json = JSON.parse(data);
              if (json.text) {
                accumulatedText += json.text;

                // Update message in real-time
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        }
      }

      // Clear image after successful submission
      setCurrentImage(null);
      setCurrentImageFile(null);

      // Auto-speak response in voice mode
      if (autoSpeak && isVoiceMode && accumulatedText) {
        speak(accumulatedText);
      }
    } catch (error) {
      console.error("Error:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "죄송합니다. 이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceStart = () => {
    if (!isSpeechRecognitionSupported) {
      alert(
        "브라우저가 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, 또는 Safari를 사용해주세요."
      );
      return;
    }

    if (isListening) {
      stopListening();
      setIsVoiceMode(false);
    } else {
      startListening();
      setIsVoiceMode(true);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!isSpeechSynthesisSupported) {
      alert("브라우저가 음성 합성을 지원하지 않습니다.");
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => !prev);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-xl font-bold gradient-text">SmartTuter</span>
            </Link>

            {/* Subject Badge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-primary-100 rounded-full">
              <Calculator className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-700">수학 튜터</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="홈"
              >
                <Home className="w-6 h-6 text-gray-600" />
              </Link>
              <Link
                href="/report"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="학습 리포트"
              >
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t-2 border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              {/* Voice Mode Indicator */}
              {isListening && (
                <div className="mb-3 px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>음성 인식 중... 말씀해주세요</span>
                  {transcript && <span className="text-gray-600">: &quot;{transcript}&quot;</span>}
                </div>
              )}

              <div className="flex items-center space-x-3">
                {/* Voice Input Button */}
                <button
                  onClick={handleVoiceStart}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-100 text-red-600 animate-pulse"
                      : isVoiceMode
                      ? "bg-accent-100 text-accent-600"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title={isListening ? "음성 인식 중지" : "음성 입력 시작"}
                  disabled={!isSpeechRecognitionSupported}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>

                {/* Auto-Speak Toggle */}
                <button
                  onClick={toggleAutoSpeak}
                  className={`p-2 rounded-lg transition-colors ${
                    autoSpeak
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 text-gray-400"
                  }`}
                  title={autoSpeak ? "자동 읽기 켜짐" : "자동 읽기 꺼짐"}
                  disabled={!isSpeechSynthesisSupported}
                >
                  {autoSpeak ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <VolumeX className="w-6 h-6" />
                  )}
                </button>

                {/* ChatInput Component */}
                <div className="flex-1">
                  <ChatInput
                    onSend={handleSendMessage}
                    onImageUpload={handleImageUpload}
                    disabled={isLoading}
                    placeholder="수학 문제나 개념을 질문해보세요..."
                    enableImage={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l-2 border-gray-200 bg-white p-6 overflow-y-auto hidden lg:block">
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl">
                  👤
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#111827' }}>학습자</div>
                  <div className="text-sm" style={{ color: '#4B5563' }}>{gradeLevel}</div>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold" style={{ color: '#111827' }}>학습 팁</h3>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: '#4B5563' }}>
                <li>• 모르는 개념은 언제든 질문하세요</li>
                <li>• 문제 풀이를 단계별로 설명받을 수 있어요</li>
                <li>• 유사한 문제를 추천받아 연습하세요</li>
                <li>• 이해가 안 되면 다시 물어보세요!</li>
              </ul>
            </Card>

            {/* Today's Progress */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-secondary-600" />
                <h3 className="font-bold" style={{ color: '#111827' }}>오늘의 학습</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>질문 수</span>
                    <span className="font-semibold">{Math.max(0, messages.filter(m => m.role === "user").length - 1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (messages.filter(m => m.role === "user").length - 1) * 10)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm" style={{ color: '#4B5563' }}>
                  목표: 10개 질문
                </div>
              </div>
            </Card>

            {/* Suggested Topics */}
            <Card>
              <h3 className="font-bold mb-4" style={{ color: '#111827' }}>추천 학습 주제</h3>
              <div className="space-y-2">
                {[
                  "분수의 덧셈과 뺄셈",
                  "이차방정식 풀이",
                  "삼각함수 기초",
                  "미적분 개념",
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleSendMessage(`${topic}에 대해 설명해줘`)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-primary-50 rounded-lg text-sm transition-colors"
                    style={{ color: '#111827' }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
