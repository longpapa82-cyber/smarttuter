"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Home, BarChart3, BookOpen, Mic, Volume2, MicOff, VolumeX } from "lucide-react";
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

export default function EnglishTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechRecognitionSupported,
  } = useSpeechRecognition({
    lang: "en-US",
    continuous: false,
    interimResults: true,
    onResult: (finalTranscript) => {
      if (finalTranscript.trim()) {
        handleSendMessage(finalTranscript);
        resetTranscript();
      }
    },
  });

  // Text-to-speech hook
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported,
  } = useSpeechSynthesis({
    lang: "en-US",
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  });

  useEffect(() => {
    // Load user preferences
    const grade = localStorage.getItem("userGrade") || "초등학교";
    setGradeLevel(grade);

    // Create new learning session
    const session = createSession("english", grade);
    setCurrentSession(session);

    // Welcome message
    const welcomeMessage = {
      id: "welcome",
      role: "assistant" as const,
      content: `Hello! I'm your English tutor. 👋\n\n안녕하세요! ${grade} 학생을 위한 영어 튜터입니다.\n\n실시간 대화로 영어를 배워보세요!\n\nYou can:\n• Practice conversation in English\n• Ask about grammar and vocabulary\n• Get pronunciation help\n• Discuss any topic in English\n\n영어로 대화하거나 한국어로 질문해도 됩니다!`,
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
      const response = await fetch("/api/chat/english", {
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

      // Auto-speak the response if enabled and in voice mode
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
                  "I'm sorry, but I cannot connect to the server right now.\n\n죄송합니다. 현재 서버와 연결할 수 없습니다.\n\nPlease add ANTHROPIC_API_KEY to your .env.local file.",
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
        "Your browser doesn't support speech recognition.\n\n브라우저가 음성 인식을 지원하지 않습니다.\n\nPlease use Chrome, Edge, or Safari."
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
      alert(
        "Your browser doesn't support text-to-speech.\n\n브라우저가 음성 합성을 지원하지 않습니다."
      );
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
            <div className="flex items-center space-x-2 px-4 py-2 bg-accent-100 rounded-full">
              <MessageCircle className="w-5 h-5 text-accent-600" />
              <span className="font-semibold text-accent-700">영어 튜터</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
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
                title={isListening ? "Stop listening" : "Start voice input"}
                disabled={!isSpeechRecognitionSupported}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Auto-Speak Toggle */}
              <button
                onClick={toggleAutoSpeak}
                className={`p-2 rounded-lg transition-colors ${
                  autoSpeak ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-400"
                }`}
                title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
                disabled={!isSpeechSynthesisSupported}
              >
                {autoSpeak ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
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
                <div key={message.id} className="group relative">
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                  {message.role === "assistant" && (
                    <button
                      onClick={() => handleTextToSpeech(message.content)}
                      className="absolute -right-12 top-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white animate-pulse" />
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
          <ChatInput
            onSend={handleSendMessage}
            onVoiceStart={handleVoiceStart}
            disabled={isLoading}
            placeholder="Type in English or Korean... / 영어나 한국어로 입력하세요..."
            enableVoice={true}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l-2 border-gray-200 bg-white p-6 overflow-y-auto hidden lg:block">
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white text-xl">
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
                <BookOpen className="w-5 h-5 text-accent-600" />
                <h3 className="font-bold" style={{ color: '#111827' }}>Learning Tips</h3>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: '#4B5563' }}>
                <li>• Practice speaking naturally</li>
                <li>• Don&apos;t be afraid to make mistakes</li>
                <li>• Ask for pronunciation help</li>
                <li>• Use English as much as possible</li>
              </ul>
            </Card>

            {/* Today's Progress */}
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-secondary-600" />
                <h3 className="font-bold" style={{ color: '#111827' }}>Today&apos;s Practice</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Messages</span>
                    <span className="font-semibold">{Math.max(0, messages.filter(m => m.role === "user").length - 1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (messages.filter(m => m.role === "user").length - 1) * 5)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm" style={{ color: '#4B5563' }}>
                  Goal: 20 messages
                </div>
              </div>
            </Card>

            {/* Conversation Starters */}
            <Card>
              <h3 className="font-bold mb-4" style={{ color: '#111827' }}>Start a Conversation</h3>
              <div className="space-y-2">
                {[
                  "Tell me about your day",
                  "What's your favorite hobby?",
                  "Let's talk about movies",
                  "Explain a grammar rule",
                ].map((starter) => (
                  <button
                    key={starter}
                    onClick={() => handleSendMessage(starter)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-accent-50 rounded-lg text-sm transition-colors"
                    style={{ color: '#111827' }}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </Card>

            {/* Voice Mode Banner */}
            {isVoiceMode && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card className="bg-gradient-to-r from-accent-500 to-primary-500 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mic className="w-5 h-5" />
                    <h3 className="font-bold" style={{ color: '#111827' }}>Voice Mode Active</h3>
                  </div>
                  <p className="text-sm opacity-90">
                    Feature coming in Phase 2!
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
