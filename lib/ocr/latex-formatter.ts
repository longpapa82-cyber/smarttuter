/**
 * LaTeX Formatter for OCR Results
 *
 * OCR 결과로 받은 LaTeX 텍스트를 KaTeX 렌더링에 적합한 형태로 변환합니다.
 */

/**
 * OCR 결과 텍스트를 LaTeX 렌더링 가능한 형태로 포맷팅
 *
 * @param text - OCR로 인식된 원본 텍스트
 * @returns KaTeX로 렌더링 가능한 형태의 텍스트
 *
 * @example
 * // 이미 $ 패턴이 있는 경우
 * formatLaTeXForRendering('이 수식은 $x^2 + y^2 = r^2$입니다.')
 * // → '이 수식은 $x^2 + y^2 = r^2$입니다.' (변경 없음)
 *
 * @example
 * // LaTeX 명령어만 있는 경우
 * formatLaTeXForRendering('\\overline{AB}^2 + \\overline{AC}^2')
 * // → '$$\\overline{AB}^2 + \\overline{AC}^2$$'
 *
 * @example
 * // 일반 텍스트
 * formatLaTeXForRendering('이것은 일반 텍스트입니다.')
 * // → '이것은 일반 텍스트입니다.' (변경 없음)
 */
export function formatLaTeXForRendering(text: string): string {
  if (!text) return text;

  // 이미 $ 또는 $$ 패턴이 있으면 그대로 반환
  if (/\$\$?[^$]+\$\$?/.test(text)) {
    return text;
  }

  // LaTeX 명령어 패턴 감지
  const latexCommandPattern = /\\(overline|underline|text|frac|sqrt|sum|int|limits|infty|cdot|times|div|pm|leq|geq|neq|approx|equiv|subset|supset|in|notin|cap|cup|emptyset|angle|perp|parallel|triangle|square|circ|sin|cos|tan|log|ln|lim|partial|nabla|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|psi|omega)/g;

  const hasLatexCommands = latexCommandPattern.test(text);

  if (hasLatexCommands) {
    // LaTeX 명령어가 포함된 경우, 전체를 display 수식으로 감싸기
    return `$$${text}$$`;
  }

  // 일반 텍스트는 그대로 반환
  return text;
}

/**
 * OCR 결과의 여러 섹션을 적절히 포맷팅
 *
 * @param sections - OCR 결과의 각 섹션 (text, latex, tables 등)
 * @returns 포맷팅된 전체 텍스트
 *
 * @example
 * formatOCRSections({
 *   text: '다음 식을 증명하시오.',
 *   latex: '\\overline{AB}^2 + \\overline{AC}^2 = \\overline{AM}^2',
 *   tables: []
 * })
 * // → '다음 식을 증명하시오.\n\n수식:\n$$\\overline{AB}^2 + \\overline{AC}^2 = \\overline{AM}^2$$'
 */
export function formatOCRSections(sections: {
  text?: string;
  latex?: string;
  tables?: string[];
}): string {
  const parts: string[] = [];

  // 일반 텍스트 추가
  if (sections.text) {
    parts.push(sections.text);
  }

  // LaTeX 수식 추가 (자동으로 $$ 감싸기)
  if (sections.latex) {
    const formattedLatex = formatLaTeXForRendering(sections.latex);
    parts.push('\n\n수식:\n' + formattedLatex);
  }

  // 표 데이터 추가
  if (sections.tables && sections.tables.length > 0) {
    parts.push('\n\n표:\n' + sections.tables.join('\n\n'));
  }

  return parts.join('');
}

/**
 * 인라인 LaTeX를 감지하고 $ 패턴으로 감싸기
 *
 * @param text - 원본 텍스트
 * @returns 인라인 LaTeX가 $ 패턴으로 감싸진 텍스트
 *
 * @example
 * wrapInlineLaTeX('점 M(\\text{가}, 0)에서')
 * // → '점 $M(\\text{가}, 0)$에서'
 */
export function wrapInlineLaTeX(text: string): string {
  if (!text) return text;

  // 이미 $ 패턴이 있으면 그대로 반환
  if (/\$/.test(text)) {
    return text;
  }

  // 간단한 LaTeX 패턴 감지 (괄호 안에 LaTeX 명령어가 있는 경우)
  const inlinePattern = /([A-Z]\([^)]*\\[a-z]+[^)]*\))/g;

  return text.replace(inlinePattern, (match) => {
    return `$${match}$`;
  });
}

/**
 * 수식 내 한글 텍스트를 \text{} 명령어로 감싸기
 *
 * @param latex - LaTeX 수식
 * @returns \text{} 명령어가 적용된 LaTeX
 *
 * @example
 * wrapKoreanInText('M(가, 0)')
 * // → 'M(\\text{가}, 0)'
 */
export function wrapKoreanInText(latex: string): string {
  if (!latex) return latex;

  // 한글 패턴 감지
  const koreanPattern = /([가-힣]+)/g;

  return latex.replace(koreanPattern, (match) => {
    // 이미 \text{} 안에 있는지 확인
    const isInTextCommand = latex.includes(`\\text{${match}}`);
    if (isInTextCommand) {
      return match;
    }
    return `\\text{${match}}`;
  });
}
