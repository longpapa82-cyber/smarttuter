"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Mic, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceStart?: () => void;
  onImageUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoice?: boolean;
  enableImage?: boolean;
}

export function ChatInput({
  onSend,
  onVoiceStart,
  onImageUpload,
  disabled = false,
  placeholder = "질문을 입력하세요...",
  enableVoice = false,
  enableImage = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div className="border-t-2 border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto flex items-end gap-2">
        {/* Image Upload */}
        {enableImage && (
          <label className="flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={disabled}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
              disabled={disabled}
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </motion.button>
          </label>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none resize-none transition-colors disabled:opacity-50 disabled:bg-gray-50"
            style={{
              minHeight: "48px",
              maxHeight: "120px",
              color: "#111827",
            }}
          />
        </div>

        {/* Voice Input */}
        {enableVoice && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVoiceStart}
            disabled={disabled}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-500 hover:bg-accent-600 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Mic className="w-5 h-5 text-white" />
          </motion.button>
        )}

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  );
}
