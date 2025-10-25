import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
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
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-primary-500 to-secondary-500"
            : "bg-gradient-to-br from-accent-500 to-primary-500"
        }`}
      >
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </div>

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
