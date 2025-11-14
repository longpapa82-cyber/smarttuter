/**
 * Phase 6: Multilingual Topic Dictionary
 *
 * Provides topic aliases, synonyms, and multilingual mappings to improve
 * RAG content matching accuracy from 60% to 80%+
 *
 * Features:
 * - Topic normalization and aliases
 * - Korean-English topic mapping
 * - Subject-specific synonyms
 * - Fuzzy matching support
 */

export interface TopicMapping {
  /** Canonical topic name (matches DB topic field) */
  canonical: string;

  /** Korean canonical name (matches DB topicKo field) */
  canonicalKo: string;

  /** English aliases and synonyms */
  aliases: string[];

  /** Korean aliases and synonyms */
  aliasesKo: string[];

  /** Subject this topic belongs to */
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean';

  /** Related topics that might be confused */
  relatedTopics?: string[];
}

/**
 * ════════════════════════════════════════════════════════════════
 * ENGLISH (GRAMMAR & LANGUAGE) TOPIC MAPPINGS
 * ════════════════════════════════════════════════════════════════
 */
export const ENGLISH_TOPIC_MAPPINGS: TopicMapping[] = [
  {
    canonical: "Present Tense",
    canonicalKo: "현재 시제",
    aliases: [
      "present tense",
      "simple present",
      "present simple",
      "present form",
      "verb tense",          // Common generic term
      "현재형",
      "present",
    ],
    aliasesKo: [
      "현재시제",
      "현재 시제",
      "현재형",
      "단순 현재",
    ],
    subject: "english",
    relatedTopics: ["Present Continuous", "Present Perfect"]
  },
  {
    canonical: "Present Perfect",
    canonicalKo: "현재완료",
    aliases: [
      "present perfect",
      "present perfect tense",
      "have done",
      "has done",
      "present perfect form",
    ],
    aliasesKo: [
      "현재완료",
      "현재완료 시제",
      "현재 완료",
      "완료형",
    ],
    subject: "english",
    relatedTopics: ["Present Tense", "Past Tense", "Present Perfect Continuous"]
  },
  {
    canonical: "Passive Voice",
    canonicalKo: "수동태",
    aliases: [
      "passive voice",
      "passive",
      "passive form",
      "passive sentence",
      "be + past participle",
    ],
    aliasesKo: [
      "수동태",
      "피동태",
      "수동",
    ],
    subject: "english",
    relatedTopics: ["Active Voice", "Past Participle"]
  },
  {
    canonical: "Past Tense",
    canonicalKo: "과거 시제",
    aliases: [
      "past tense",
      "simple past",
      "past simple",
      "past form",
      "preterite",
    ],
    aliasesKo: [
      "과거시제",
      "과거 시제",
      "과거형",
      "단순 과거",
    ],
    subject: "english",
    relatedTopics: ["Present Tense", "Past Perfect", "Past Continuous"]
  },
];

/**
 * ════════════════════════════════════════════════════════════════
 * MATH TOPIC MAPPINGS
 * ════════════════════════════════════════════════════════════════
 */
export const MATH_TOPIC_MAPPINGS: TopicMapping[] = [
  {
    canonical: "Addition",
    canonicalKo: "덧셈",
    aliases: [
      "addition",
      "add",
      "adding",
      "plus",
      "sum",
      "addition operation",
    ],
    aliasesKo: [
      "덧셈",
      "더하기",
      "합",
      "합계",
      "가산",
    ],
    subject: "math",
    relatedTopics: ["Subtraction", "Arithmetic"]
  },
  {
    canonical: "Subtraction",
    canonicalKo: "뺄셈",
    aliases: [
      "subtraction",
      "subtract",
      "subtracting",
      "minus",
      "difference",
      "subtraction operation",
    ],
    aliasesKo: [
      "뺄셈",
      "빼기",
      "차",
      "감산",
    ],
    subject: "math",
    relatedTopics: ["Addition", "Arithmetic"]
  },
  {
    canonical: "Multiplication",
    canonicalKo: "곱셈",
    aliases: [
      "multiplication",
      "multiply",
      "multiplying",
      "times",
      "product",
      "multiplication operation",
    ],
    aliasesKo: [
      "곱셈",
      "곱하기",
      "곱",
      "승산",
    ],
    subject: "math",
    relatedTopics: ["Division", "Arithmetic"]
  },
  {
    canonical: "Division",
    canonicalKo: "나눗셈",
    aliases: [
      "division",
      "divide",
      "dividing",
      "quotient",
      "division operation",
    ],
    aliasesKo: [
      "나눗셈",
      "나누기",
      "몫",
      "제산",
    ],
    subject: "math",
    relatedTopics: ["Multiplication", "Fractions"]
  },
  {
    canonical: "Fractions",
    canonicalKo: "분수",
    aliases: [
      "fractions",
      "fraction",
      "numerator",
      "denominator",
      "rational number",
    ],
    aliasesKo: [
      "분수",
      "분모",
      "분자",
      "유리수",
    ],
    subject: "math",
    relatedTopics: ["Division", "Decimals", "Ratios"]
  },
  {
    canonical: "Decimals",
    canonicalKo: "소수",
    aliases: [
      "decimals",
      "decimal",
      "decimal point",
      "decimal number",
      "decimal notation",
    ],
    aliasesKo: [
      "소수",
      "소수점",
      "십진수",
    ],
    subject: "math",
    relatedTopics: ["Fractions", "Percentages"]
  },
  {
    canonical: "Linear Equations",
    canonicalKo: "일차 방정식",
    aliases: [
      "linear equations",
      "linear equation",
      "first degree equation",
      "solving equations",
      "equation solving",
    ],
    aliasesKo: [
      "일차방정식",
      "일차 방정식",
      "선형 방정식",
      "방정식",
    ],
    subject: "math",
    relatedTopics: ["Quadratic Equations", "Algebra"]
  },
  {
    canonical: "Quadratic Equations",
    canonicalKo: "이차 방정식",
    aliases: [
      "quadratic equations",
      "quadratic equation",
      "second degree equation",
      "quadratic formula",
      "ax² + bx + c",
    ],
    aliasesKo: [
      "이차방정식",
      "이차 방정식",
      "이차식",
      "근의 공식",
    ],
    subject: "math",
    relatedTopics: ["Linear Equations", "Polynomials", "Parabola"]
  },
];

/**
 * ════════════════════════════════════════════════════════════════
 * SCIENCE TOPIC MAPPINGS
 * ════════════════════════════════════════════════════════════════
 */
export const SCIENCE_TOPIC_MAPPINGS: TopicMapping[] = [
  {
    canonical: "Photosynthesis",
    canonicalKo: "광합성",
    aliases: [
      "photosynthesis",
      "photosynthetic",
      "plant food production",
      "chlorophyll",
      "light energy conversion",
    ],
    aliasesKo: [
      "광합성",
      "엽록소",
      "식물 영양",
    ],
    subject: "science",
    relatedTopics: ["Plant Biology", "Cellular Respiration"]
  },
  {
    canonical: "Cell Structure",
    canonicalKo: "세포 구조",
    aliases: [
      "cell structure",
      "cell",
      "cells",
      "cellular structure",
      "cell biology",
      "cell parts",
      "organelles",
    ],
    aliasesKo: [
      "세포",
      "세포 구조",
      "세포학",
      "세포 기관",
      "소기관",
    ],
    subject: "science",
    relatedTopics: ["Cell Division", "Cellular Processes"]
  },
  {
    canonical: "Evolution and Natural Selection",
    canonicalKo: "진화와 자연 선택",
    aliases: [
      "evolution",
      "natural selection",
      "evolutionary biology",
      "darwin",
      "adaptation",
      "species evolution",
    ],
    aliasesKo: [
      "진화",
      "자연선택",
      "자연 선택",
      "진화론",
      "적응",
    ],
    subject: "science",
    relatedTopics: ["Genetics", "Biodiversity"]
  },
];

/**
 * ════════════════════════════════════════════════════════════════
 * SOCIAL STUDIES TOPIC MAPPINGS
 * ════════════════════════════════════════════════════════════════
 */
export const SOCIAL_STUDIES_TOPIC_MAPPINGS: TopicMapping[] = [
  {
    canonical: "Government Systems",
    canonicalKo: "정부 체계",
    aliases: [
      "government",
      "government systems",
      "types of government",
      "political systems",
      "governance",
      "branches of government",
      "three branches",
    ],
    aliasesKo: [
      "정부",
      "정부 체계",
      "정치 체계",
      "정부 시스템",
      "정부 형태",
      "삼권분립",
    ],
    subject: "social-studies",
    relatedTopics: ["Democracy", "US Constitution", "Political Philosophy"]
  },
  {
    canonical: "Democracy",
    canonicalKo: "민주주의",
    aliases: [
      "democracy",
      "democratic",
      "democratic government",
      "representative democracy",
      "direct democracy",
    ],
    aliasesKo: [
      "민주주의",
      "민주",
      "민주 정치",
      "민주정",
    ],
    subject: "social-studies",
    relatedTopics: ["Government Systems", "Voting Rights", "Civil Rights"]
  },
  {
    canonical: "US Constitution and Bill of Rights",
    canonicalKo: "미국 헌법과 권리 장전",
    aliases: [
      "constitution",
      "bill of rights",
      "constitutional rights",
      "amendments",
      "founding document",
      "us constitution",
    ],
    aliasesKo: [
      "헌법",
      "권리장전",
      "권리 장전",
      "수정헌법",
      "미국 헌법",
    ],
    subject: "social-studies",
    relatedTopics: ["Government Systems", "Civil Rights", "American History"]
  },
  {
    canonical: "Ancient Civilizations",
    canonicalKo: "고대 문명",
    aliases: [
      "ancient civilizations",
      "ancient civilization",
      "early civilizations",
      "mesopotamia",
      "egypt",
      "greece",
      "rome",
    ],
    aliasesKo: [
      "고대문명",
      "고대 문명",
      "문명",
      "고대",
    ],
    subject: "social-studies",
    relatedTopics: ["World History", "Archaeology"]
  },
];

/**
 * ════════════════════════════════════════════════════════════════
 * ALL TOPIC MAPPINGS (Combined)
 * ════════════════════════════════════════════════════════════════
 */
export const ALL_TOPIC_MAPPINGS = [
  ...ENGLISH_TOPIC_MAPPINGS,
  ...MATH_TOPIC_MAPPINGS,
  ...SCIENCE_TOPIC_MAPPINGS,
  ...SOCIAL_STUDIES_TOPIC_MAPPINGS,
];

/**
 * ════════════════════════════════════════════════════════════════
 * TOPIC NORMALIZATION FUNCTIONS
 * ════════════════════════════════════════════════════════════════
 */

/**
 * Normalize a topic query to its canonical form
 *
 * @param query - Raw topic string from AI
 * @param subject - Subject context for disambiguation
 * @returns Canonical topic name(s) that match DB, or empty array if no match
 */
export function normalizeTopicQuery(
  query: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean'
): string[] {
  const queryLower = query.toLowerCase().trim();
  const canonicalTopics: string[] = [];

  // Filter mappings by subject
  const subjectMappings = ALL_TOPIC_MAPPINGS.filter(m => m.subject === subject);

  for (const mapping of subjectMappings) {
    // Check canonical names (case-insensitive)
    if (mapping.canonical.toLowerCase() === queryLower ||
        mapping.canonicalKo === query) {
      canonicalTopics.push(mapping.canonical);
      continue;
    }

    // Check English aliases
    if (mapping.aliases.some(alias => alias.toLowerCase() === queryLower)) {
      canonicalTopics.push(mapping.canonical);
      continue;
    }

    // Check Korean aliases
    if (mapping.aliasesKo.some(alias => alias === query)) {
      canonicalTopics.push(mapping.canonical);
      continue;
    }

    // Partial match for compound topics (e.g., "verb tense" → "Present Tense")
    if (queryLower.length > 3) {
      // Check if query is contained in canonical name
      if (mapping.canonical.toLowerCase().includes(queryLower) ||
          mapping.canonicalKo.includes(query)) {
        canonicalTopics.push(mapping.canonical);
        continue;
      }

      // Check if query contains an alias
      if (mapping.aliases.some(alias => queryLower.includes(alias.toLowerCase()))) {
        canonicalTopics.push(mapping.canonical);
        continue;
      }
    }
  }

  // If no matches, return original query (fallback to old behavior)
  return canonicalTopics.length > 0 ? canonicalTopics : [query];
}

/**
 * Get all possible search terms for a canonical topic
 * (for reverse lookup: canonical → all aliases)
 */
export function getTopicSearchTerms(canonicalTopic: string, subject: string): string[] {
  const mapping = ALL_TOPIC_MAPPINGS.find(
    m => m.canonical === canonicalTopic && m.subject === subject
  );

  if (!mapping) {
    return [canonicalTopic]; // Fallback to original
  }

  return [
    mapping.canonical,
    mapping.canonicalKo,
    ...mapping.aliases,
    ...mapping.aliasesKo,
  ];
}

/**
 * Find similar topics (for suggestions when no exact match)
 */
export function findSimilarTopics(
  query: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean',
  maxResults: number = 3
): string[] {
  const queryLower = query.toLowerCase();
  const subjectMappings = ALL_TOPIC_MAPPINGS.filter(m => m.subject === subject);

  const scored = subjectMappings.map(mapping => {
    let score = 0;

    // Exact canonical match (highest priority)
    if (mapping.canonical.toLowerCase() === queryLower) {
      score += 100;
    }

    // Partial canonical match
    if (mapping.canonical.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Alias match
    if (mapping.aliases.some(a => a.toLowerCase().includes(queryLower))) {
      score += 30;
    }

    // Related topic match
    if (mapping.relatedTopics?.some(t => t.toLowerCase().includes(queryLower))) {
      score += 20;
    }

    return { canonical: mapping.canonical, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.canonical);
}

/**
 * Debug: Get mapping info for a canonical topic
 */
export function getTopicMappingInfo(canonicalTopic: string): TopicMapping | null {
  return ALL_TOPIC_MAPPINGS.find(m => m.canonical === canonicalTopic) || null;
}
