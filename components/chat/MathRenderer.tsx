"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
}

export function MathRenderer({ content }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 수식 패턴 매칭
    // 인라인 수식: $...$
    // 블록 수식: $$...$$
    const processedContent = content.replace(
      /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g,
      (match, blockMath, inlineMath) => {
        const math = blockMath || inlineMath;
        const displayMode = !!blockMath;

        try {
          const html = katex.renderToString(math, {
            displayMode,
            throwOnError: false,
            errorColor: "#cc0000",
          });

          return `<span class="${displayMode ? "block my-4" : "inline-block mx-1"}">${html}</span>`;
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          return match;
        }
      }
    );

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return <div ref={containerRef} className="prose max-w-none" />;
}

// 수식이 포함되어 있는지 확인
export function containsMath(content: string): boolean {
  return /\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$/.test(content);
}

// 텍스트를 수식과 일반 텍스트로 분리
export function parseMathContent(content: string) {
  const parts: Array<{ type: "text" | "math"; content: string; displayMode: boolean }> = [];
  let lastIndex = 0;

  const regex = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 이전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
        displayMode: false,
      });
    }

    // 수식 추가
    const math = match[1] || match[2];
    const displayMode = !!match[1];
    parts.push({
      type: "math",
      content: math,
      displayMode,
    });

    lastIndex = match.index + match[0].length;
  }

  // 마지막 텍스트 추가
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
      displayMode: false,
    });
  }

  return parts;
}
