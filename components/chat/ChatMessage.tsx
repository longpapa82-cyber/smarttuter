import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { MathRenderer, containsMath } from "./MathRenderer";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6`}
    >
      {/* Avatar - Enhanced for AI tutor */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className={`flex-shrink-0 ${isUser ? "w-12 h-12" : "w-16 h-16"} rounded-2xl flex items-center justify-center relative ${
          isUser
            ? "bg-gradient-to-br from-primary-500 to-secondary-500 shadow-md"
            : "bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg"
        }`}
      >
        {!isUser && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
        {isUser ? (
          <User className="w-7 h-7 text-white" />
        ) : (
          <div className="text-3xl">🤖</div>
        )}
      </motion.div>

      {/* Message Bubble */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
              : "bg-white border-2 border-gray-200 text-gray-800"
          }`}
        >
          {containsMath(content) ? (
            <div className="text-sm md:text-base">
              <MathRenderer content={content} />
            </div>
          ) : (
            <p className="text-sm md:text-base whitespace-pre-wrap break-words">{content}</p>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-gray-500 mt-1 px-2">
            {timestamp.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
