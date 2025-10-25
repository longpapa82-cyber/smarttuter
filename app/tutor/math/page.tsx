"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calculator, Home, BarChart3, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { Card } from "@/components/ui/Card";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user preferences
    const grade = localStorage.getItem("userGrade") || "초등학교";
    setGradeLevel(grade);

    // Welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `안녕하세요! 수학 튜터입니다. 👋\n\n${grade} 학생에게 맞는 수학 학습을 도와드리겠습니다.\n\n궁금한 개념이나 풀고 싶은 문제를 자유롭게 질문해주세요!\n\n예시:\n• "이차방정식이 뭐야?"\n• "3x + 5 = 20을 풀어줘"\n• "분수의 나눗셈을 어떻게 하는지 설명해줘"`,
        timestamp: new Date(),
      },
    ]);
  }, []);

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
    setIsLoading(true);

    try {
      // Call API to get AI response
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

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);

      // Fallback response for demo
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 현재 서버와 연결할 수 없습니다. API 키를 설정해주세요.\n\n.env.local 파일에 ANTHROPIC_API_KEY를 추가하시면 AI 튜터 기능을 사용하실 수 있습니다.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    // TODO: Implement image upload for math problems
    console.log("Image uploaded:", file);
    alert("이미지 업로드 기능은 곧 제공될 예정입니다!");
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
          <ChatInput
            onSend={handleSendMessage}
            onImageUpload={handleImageUpload}
            disabled={isLoading}
            placeholder="수학 문제나 개념을 질문해보세요..."
            enableImage={true}
          />
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
