"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
}

/**
 * LaTeX 명령어를 감지하는 패턴
 * 더 포괄적인 LaTeX 명령어 지원
 */
const LATEX_COMMAND_PATTERN = /\\(overline|underline|text|textbf|textit|frac|dfrac|tfrac|sqrt|sum|prod|int|iint|iiint|oint|limits|infty|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|cong|sim|propto|subset|supset|subseteq|supseteq|in|notin|ni|cap|cup|emptyset|varnothing|angle|perp|parallel|triangle|square|circ|bullet|star|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|lg|exp|lim|limsup|liminf|max|min|sup|inf|arg|det|dim|ker|deg|gcd|lcm|partial|nabla|Delta|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Lambda|Sigma|Psi|Omega|left|right|big|Big|bigg|Bigg|to|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|mapsto|implies|iff)/;

/**
 * 텍스트를 LaTeX 렌더링 가능한 형태로 전처리
 */
function preprocessLaTeX(text: string): string {
  // 작은따옴표나 큰따옴표로 감싸진 LaTeX 제거
  let processed = text.replace(/^['"`](.+)['"`]$/gm, '$1');

  // 이미 $ 패턴이 있으면 그대로 반환
  if (/\$\$?[\s\S]+?\$\$?/.test(processed)) {
    return processed;
  }

  // LaTeX 명령어가 있는 라인을 찾아서 $$ 패턴으로 감싸기
  const lines = processed.split('\n');
  const processedLines = lines.map(line => {
    // 이미 $ 패턴이 있으면 그대로
    if (/\$/.test(line)) {
      return line;
    }

    // LaTeX 명령어가 있으면 $$ 패턴으로 감싸기
    if (LATEX_COMMAND_PATTERN.test(line)) {
      return `$$${line}$$`;
    }

    return line;
  });

  return processedLines.join('\n');
}

export function MathRenderer({ content }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // LaTeX 전처리
    const preprocessed = preprocessLaTeX(content);

    // 수식 패턴 매칭
    // 인라인 수식: $...$
    // 블록 수식: $$...$$
    const processedContent = preprocessed.replace(
      /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g,
      (match, blockMath, inlineMath) => {
        const math = blockMath || inlineMath;
        const displayMode = !!blockMath;

        try {
          const html = katex.renderToString(math, {
            displayMode,
            throwOnError: false,
            errorColor: "#cc0000",
            // 오버플로우 방지
            maxSize: 500,
            maxExpand: 1000,
          });

          return `<span class="${displayMode ? "katex-display-wrapper" : "katex-inline-wrapper"}">${html}</span>`;
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          return match;
        }
      }
    );

    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return <div ref={containerRef} className="math-content" />;
}

// 수식이 포함되어 있는지 확인 ($ 패턴 또는 LaTeX 명령어)
export function containsMath(content: string): boolean {
  return /\$\$?[\s\S]+?\$\$?/.test(content) || LATEX_COMMAND_PATTERN.test(content);
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
