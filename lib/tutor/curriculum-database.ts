/**
 * Week 2 Day 1-2: Curriculum Database
 *
 * Comprehensive K-12 and university curriculum standards for:
 * - English (Grammar, Vocabulary, Reading, Writing, Speaking)
 * - Math (Arithmetic, Algebra, Geometry, Calculus, Statistics, etc.)
 *
 * Based on:
 * - Common Core State Standards (CCSS)
 * - Korean National Curriculum
 * - International benchmarks (IB, Cambridge, etc.)
 */

export type SchoolLevel = 'elementary' | 'middle' | 'high' | 'university';
export type Subject = 'english' | 'math' | 'science' | 'social-studies' | 'korean';

export interface CurriculumTopic {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  keywords: string[];
  examples: string[];
}

export interface GradeCurriculum {
  grade: string; // "1", "2", ..., "12", "university-1", etc.
  schoolLevel: SchoolLevel;
  subject: Subject;
  topics: CurriculumTopic[];
}

/**
 * ════════════════════════════════════════════════════════════════
 * ENGLISH CURRICULUM DATABASE
 * ════════════════════════════════════════════════════════════════
 */

export const ENGLISH_CURRICULUM: GradeCurriculum[] = [
  // ────────────────────────────────────────────────────────────
  // Elementary School (Grades 1-6)
  // ────────────────────────────────────────────────────────────
  {
    grade: "1",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-1-alphabet",
        name: "Alphabet Recognition",
        nameKo: "알파벳 인식",
        description: "Recognizing and writing uppercase and lowercase letters",
        keywords: ["alphabet", "abc", "letter", "uppercase", "lowercase", "알파벳", "글자"],
        examples: ["What is the letter A?", "How do you write 'b'?"]
      },
      {
        id: "eng-elem-1-phonics",
        name: "Basic Phonics",
        nameKo: "기초 파닉스",
        description: "Letter-sound relationships, CVC words",
        keywords: ["phonics", "sound", "pronunciation", "cvc", "파닉스", "발음"],
        examples: ["What sound does 'c' make?", "How do you read 'cat'?"]
      },
      {
        id: "eng-elem-1-sight-words",
        name: "Sight Words (Pre-K to Grade 1)",
        nameKo: "기초 단어 (유치원-1학년)",
        description: "High-frequency words: the, a, is, you, to, and, etc.",
        keywords: ["sight words", "high frequency", "basic words", "기초단어", "자주쓰는단어"],
        examples: ["What does 'the' mean?", "How do you use 'is'?"]
      },
      {
        id: "eng-elem-1-simple-sentences",
        name: "Simple Sentences",
        nameKo: "간단한 문장",
        description: "Subject + Verb sentences (I see. You run.)",
        keywords: ["simple sentence", "subject verb", "기초문장", "주어동사"],
        examples: ["What is a sentence?", "How do you make 'I run'?"]
      }
    ]
  },
  {
    grade: "2",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-2-phonics-advanced",
        name: "Advanced Phonics",
        nameKo: "심화 파닉스",
        description: "Digraphs (sh, ch, th), blends (bl, st, gr)",
        keywords: ["digraph", "blend", "phonics", "이중자음", "블렌드"],
        examples: ["What is a digraph?", "How do you read 'ship'?"]
      },
      {
        id: "eng-elem-2-nouns-verbs",
        name: "Nouns and Verbs",
        nameKo: "명사와 동사",
        description: "Identifying and using nouns and action verbs",
        keywords: ["noun", "verb", "action", "명사", "동사", "행동"],
        examples: ["What is a noun?", "What are action verbs?"]
      },
      {
        id: "eng-elem-2-present-tense",
        name: "Present Tense",
        nameKo: "현재 시제",
        description: "Simple present tense (I walk, She walks)",
        keywords: ["present tense", "현재시제", "현재형"],
        examples: ["What is present tense?", "How do you use 'walks'?"]
      },
      {
        id: "eng-elem-2-questions",
        name: "Basic Questions",
        nameKo: "기초 질문",
        description: "Who, What, Where questions",
        keywords: ["question", "who", "what", "where", "질문", "의문사"],
        examples: ["How do you ask 'What is this'?", "What is a question word?"]
      }
    ]
  },
  {
    grade: "3",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-3-adjectives",
        name: "Adjectives",
        nameKo: "형용사",
        description: "Describing words and their usage",
        keywords: ["adjective", "describing", "형용사", "묘사"],
        examples: ["What is an adjective?", "How do you use 'big'?"]
      },
      {
        id: "eng-elem-3-past-tense",
        name: "Past Tense",
        nameKo: "과거 시제",
        description: "Simple past tense (walked, played, went)",
        keywords: ["past tense", "과거시제", "과거형", "ed"],
        examples: ["What is past tense?", "How do you use 'walked'?"]
      },
      {
        id: "eng-elem-3-plurals",
        name: "Plural Nouns",
        nameKo: "복수 명사",
        description: "Forming plurals (-s, -es, irregular)",
        keywords: ["plural", "복수", "명사복수형"],
        examples: ["How do you make 'cats'?", "What is the plural of 'child'?"]
      },
      {
        id: "eng-elem-3-pronouns",
        name: "Personal Pronouns",
        nameKo: "인칭 대명사",
        description: "I, you, he, she, it, we, they",
        keywords: ["pronoun", "대명사", "인칭"],
        examples: ["What is a pronoun?", "When do you use 'he'?"]
      }
    ]
  },
  {
    grade: "4",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-4-future-tense",
        name: "Future Tense",
        nameKo: "미래 시제",
        description: "Will, going to for future",
        keywords: ["future", "will", "going to", "미래시제"],
        examples: ["How do you use 'will'?", "What is 'going to'?"]
      },
      {
        id: "eng-elem-4-adverbs",
        name: "Adverbs",
        nameKo: "부사",
        description: "Describing verbs (quickly, slowly, well)",
        keywords: ["adverb", "부사", "ly"],
        examples: ["What is an adverb?", "How do you use 'quickly'?"]
      },
      {
        id: "eng-elem-4-compound-sentences",
        name: "Compound Sentences",
        nameKo: "복합 문장",
        description: "Using conjunctions (and, but, or)",
        keywords: ["compound", "conjunction", "and", "but", "or", "복합문", "접속사"],
        examples: ["What is a compound sentence?", "How do you use 'but'?"]
      },
      {
        id: "eng-elem-4-reading-comprehension",
        name: "Reading Comprehension",
        nameKo: "독해",
        description: "Understanding stories, main idea, details",
        keywords: ["reading", "comprehension", "main idea", "독해", "주제"],
        examples: ["What is the main idea?", "How do you understand a story?"]
      }
    ]
  },
  {
    grade: "5",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-5-present-perfect",
        name: "Present Perfect (Basic)",
        nameKo: "현재완료 (기초)",
        description: "Have/has + past participle (basic usage)",
        keywords: ["present perfect", "have", "has", "현재완료"],
        examples: ["What is present perfect?", "How do you use 'have done'?"]
      },
      {
        id: "eng-elem-5-prepositions",
        name: "Prepositions",
        nameKo: "전치사",
        description: "In, on, at, under, over, between",
        keywords: ["preposition", "전치사", "in", "on", "at"],
        examples: ["What is a preposition?", "How do you use 'in'?"]
      },
      {
        id: "eng-elem-5-comparative",
        name: "Comparative and Superlative",
        nameKo: "비교급과 최상급",
        description: "Bigger, biggest, more, most",
        keywords: ["comparative", "superlative", "비교급", "최상급", "er", "est"],
        examples: ["What is comparative?", "How do you use 'bigger'?"]
      },
      {
        id: "eng-elem-5-writing-paragraphs",
        name: "Paragraph Writing",
        nameKo: "문단 쓰기",
        description: "Topic sentence, supporting sentences, conclusion",
        keywords: ["paragraph", "topic sentence", "writing", "문단", "주제문"],
        examples: ["How do you write a paragraph?", "What is a topic sentence?"]
      }
    ]
  },
  {
    grade: "6",
    schoolLevel: "elementary",
    subject: "english",
    topics: [
      {
        id: "eng-elem-6-present-perfect-continuous",
        name: "Present Perfect Continuous",
        nameKo: "현재완료진행형",
        description: "Have/has been + -ing",
        keywords: ["present perfect continuous", "have been", "ing", "현재완료진행"],
        examples: ["What is present perfect continuous?", "How do you use 'have been doing'?"]
      },
      {
        id: "eng-elem-6-passive-voice-intro",
        name: "Passive Voice (Introduction)",
        nameKo: "수동태 (입문)",
        description: "Basic passive voice (is done, was made)",
        keywords: ["passive", "passive voice", "수동태", "be동사"],
        examples: ["What is passive voice?", "How do you use 'is done'?"]
      },
      {
        id: "eng-elem-6-conditionals-basic",
        name: "First Conditional",
        nameKo: "1형식 조건문",
        description: "If + present, will + verb",
        keywords: ["conditional", "if", "will", "조건문"],
        examples: ["What is first conditional?", "How do you use 'if'?"]
      },
      {
        id: "eng-elem-6-essay-writing-intro",
        name: "Essay Writing (Introduction)",
        nameKo: "에세이 쓰기 (입문)",
        description: "Basic 5-paragraph essay structure",
        keywords: ["essay", "writing", "structure", "에세이", "작문"],
        examples: ["How do you write an essay?", "What is essay structure?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // Middle School (Grades 7-9)
  // ────────────────────────────────────────────────────────────
  {
    grade: "7",
    schoolLevel: "middle",
    subject: "english",
    topics: [
      {
        id: "eng-mid-7-modals",
        name: "Modal Verbs",
        nameKo: "조동사",
        description: "Can, could, may, might, should, must, will, would",
        keywords: ["modal", "can", "should", "must", "조동사"],
        examples: ["What is a modal verb?", "How do you use 'should'?"]
      },
      {
        id: "eng-mid-7-reported-speech",
        name: "Reported Speech",
        nameKo: "간접화법",
        description: "He said that..., She told me...",
        keywords: ["reported speech", "간접화법", "said", "told"],
        examples: ["What is reported speech?", "How do you report 'I am happy'?"]
      },
      {
        id: "eng-mid-7-relative-clauses",
        name: "Relative Clauses",
        nameKo: "관계절",
        description: "Who, which, that, where, when",
        keywords: ["relative clause", "who", "which", "that", "관계대명사"],
        examples: ["What is a relative clause?", "How do you use 'who'?"]
      },
      {
        id: "eng-mid-7-argumentative-writing",
        name: "Argumentative Writing",
        nameKo: "논증적 글쓰기",
        description: "Claim, evidence, reasoning",
        keywords: ["argument", "claim", "evidence", "논증", "주장"],
        examples: ["How do you write an argument?", "What is a claim?"]
      }
    ]
  },
  {
    grade: "8",
    schoolLevel: "middle",
    subject: "english",
    topics: [
      {
        id: "eng-mid-8-subjunctive",
        name: "Subjunctive Mood",
        nameKo: "가정법",
        description: "If I were..., I wish..., I'd rather...",
        keywords: ["subjunctive", "if I were", "wish", "가정법"],
        examples: ["What is subjunctive?", "How do you use 'if I were'?"]
      },
      {
        id: "eng-mid-8-gerunds-infinitives",
        name: "Gerunds and Infinitives",
        nameKo: "동명사와 to부정사",
        description: "To do vs doing, verb patterns",
        keywords: ["gerund", "infinitive", "to do", "동명사", "부정사"],
        examples: ["What is a gerund?", "When do you use 'to do'?"]
      },
      {
        id: "eng-mid-8-advanced-vocabulary",
        name: "Advanced Vocabulary",
        nameKo: "고급 어휘",
        description: "Academic words, idioms, collocations",
        keywords: ["vocabulary", "idiom", "collocation", "어휘", "숙어"],
        examples: ["What does 'elaborate' mean?", "What is an idiom?"]
      },
      {
        id: "eng-mid-8-literary-analysis",
        name: "Literary Analysis",
        nameKo: "문학 분석",
        description: "Theme, symbolism, character analysis",
        keywords: ["literature", "theme", "symbol", "문학", "주제"],
        examples: ["What is a theme?", "How do you analyze a character?"]
      }
    ]
  },
  {
    grade: "9",
    schoolLevel: "middle",
    subject: "english",
    topics: [
      {
        id: "eng-mid-9-advanced-conditionals",
        name: "Advanced Conditionals",
        nameKo: "고급 조건문",
        description: "Second, third, mixed conditionals",
        keywords: ["conditional", "second conditional", "third conditional", "조건문"],
        examples: ["What is third conditional?", "How do you use mixed conditionals?"]
      },
      {
        id: "eng-mid-9-persuasive-writing",
        name: "Persuasive Writing",
        nameKo: "설득적 글쓰기",
        description: "Rhetorical strategies, ethos, pathos, logos",
        keywords: ["persuasive", "rhetoric", "ethos", "pathos", "설득"],
        examples: ["How do you persuade?", "What is ethos?"]
      },
      {
        id: "eng-mid-9-critical-reading",
        name: "Critical Reading",
        nameKo: "비판적 읽기",
        description: "Evaluating sources, bias detection, argumentation",
        keywords: ["critical reading", "bias", "evaluation", "비판적사고"],
        examples: ["How do you detect bias?", "What is critical reading?"]
      },
      {
        id: "eng-mid-9-research-skills",
        name: "Research Skills",
        nameKo: "연구 기술",
        description: "Citation, MLA/APA format, plagiarism",
        keywords: ["research", "citation", "mla", "apa", "plagiarism", "인용"],
        examples: ["How do you cite sources?", "What is MLA format?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // High School (Grades 10-12)
  // ────────────────────────────────────────────────────────────
  {
    grade: "10",
    schoolLevel: "high",
    subject: "english",
    topics: [
      {
        id: "eng-high-10-advanced-grammar",
        name: "Advanced Grammar Structures",
        nameKo: "고급 문법 구조",
        description: "Inversion, cleft sentences, ellipsis",
        keywords: ["inversion", "cleft sentence", "ellipsis", "도치", "강조구문"],
        examples: ["What is inversion?", "How do you use cleft sentences?"]
      },
      {
        id: "eng-high-10-academic-writing",
        name: "Academic Writing",
        nameKo: "학술적 글쓰기",
        description: "Formal tone, objective voice, hedging",
        keywords: ["academic", "formal", "objective", "학술", "공식"],
        examples: ["How do you write academically?", "What is hedging?"]
      },
      {
        id: "eng-high-10-rhetorical-analysis",
        name: "Rhetorical Analysis",
        nameKo: "수사학적 분석",
        description: "Analyzing arguments, rhetorical devices",
        keywords: ["rhetorical analysis", "argument", "device", "수사학"],
        examples: ["How do you analyze rhetoric?", "What are rhetorical devices?"]
      },
      {
        id: "eng-high-10-synthesis-essay",
        name: "Synthesis Essay",
        nameKo: "종합 에세이",
        description: "Combining multiple sources, creating arguments",
        keywords: ["synthesis", "sources", "argument", "종합"],
        examples: ["How do you synthesize sources?", "What is a synthesis essay?"]
      }
    ]
  },
  {
    grade: "11",
    schoolLevel: "high",
    subject: "english",
    topics: [
      {
        id: "eng-high-11-ap-language",
        name: "AP Language Skills",
        nameKo: "AP 언어 기술",
        description: "Rhetorical analysis, argument, synthesis (AP Lang)",
        keywords: ["ap language", "rhetorical", "argument", "synthesis"],
        examples: ["How do you write an AP argument essay?", "What is AP synthesis?"]
      },
      {
        id: "eng-high-11-advanced-literature",
        name: "Advanced Literary Analysis",
        nameKo: "고급 문학 분석",
        description: "Literary theory, critical lenses, close reading",
        keywords: ["literary theory", "critical lens", "close reading", "문학이론"],
        examples: ["What is literary theory?", "How do you do close reading?"]
      },
      {
        id: "eng-high-11-college-essay",
        name: "College Essay Writing",
        nameKo: "대학 입학 에세이",
        description: "Personal statement, narrative voice, storytelling",
        keywords: ["college essay", "personal statement", "narrative", "입학에세이"],
        examples: ["How do you write a college essay?", "What is a personal statement?"]
      },
      {
        id: "eng-high-11-sat-act-english",
        name: "SAT/ACT English",
        nameKo: "SAT/ACT 영어",
        description: "Grammar, rhetoric, reading comprehension for standardized tests",
        keywords: ["sat", "act", "grammar", "reading"],
        examples: ["How do you prepare for SAT English?", "What is tested on ACT English?"]
      }
    ]
  },
  {
    grade: "12",
    schoolLevel: "high",
    subject: "english",
    topics: [
      {
        id: "eng-high-12-ap-literature",
        name: "AP Literature Skills",
        nameKo: "AP 문학 기술",
        description: "Poetry analysis, prose fiction, literary argumentation",
        keywords: ["ap literature", "poetry", "prose", "literary argument"],
        examples: ["How do you analyze poetry for AP Lit?", "What is a literary argument?"]
      },
      {
        id: "eng-high-12-advanced-composition",
        name: "Advanced Composition",
        nameKo: "고급 작문",
        description: "Style, voice, advanced rhetorical strategies",
        keywords: ["composition", "style", "voice", "작문"],
        examples: ["How do you develop writing style?", "What is voice in writing?"]
      },
      {
        id: "eng-high-12-seminar-skills",
        name: "Seminar Discussion Skills",
        nameKo: "세미나 토론 기술",
        description: "Academic discussion, Socratic seminar, debate",
        keywords: ["seminar", "discussion", "debate", "세미나", "토론"],
        examples: ["How do you participate in a seminar?", "What is Socratic discussion?"]
      },
      {
        id: "eng-high-12-professional-writing",
        name: "Professional Writing",
        nameKo: "전문적 글쓰기",
        description: "Resume, cover letter, business communication",
        keywords: ["professional", "resume", "cover letter", "business", "이력서"],
        examples: ["How do you write a resume?", "What is business writing?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // University (Undergraduate)
  // ────────────────────────────────────────────────────────────
  {
    grade: "university-1",
    schoolLevel: "university",
    subject: "english",
    topics: [
      {
        id: "eng-univ-1-academic-discourse",
        name: "Academic Discourse",
        nameKo: "학술적 담화",
        description: "Discipline-specific writing, genre conventions",
        keywords: ["academic discourse", "discipline", "genre", "학술담화"],
        examples: ["What is academic discourse?", "How do you write in your discipline?"]
      },
      {
        id: "eng-univ-1-research-writing",
        name: "Research Writing",
        nameKo: "연구 논문 작성",
        description: "Literature review, methodology, data analysis",
        keywords: ["research", "literature review", "methodology", "연구논문"],
        examples: ["How do you write a literature review?", "What is methodology?"]
      },
      {
        id: "eng-univ-1-critical-theory",
        name: "Critical Theory",
        nameKo: "비평 이론",
        description: "Marxist, feminist, postcolonial, psychoanalytic theory",
        keywords: ["critical theory", "marxist", "feminist", "비평이론"],
        examples: ["What is critical theory?", "How do you apply feminist theory?"]
      },
      {
        id: "eng-univ-1-professional-communication",
        name: "Professional Communication",
        nameKo: "전문적 의사소통",
        description: "Technical writing, grant proposals, presentations",
        keywords: ["professional", "technical writing", "grant", "presentation", "전문"],
        examples: ["How do you write a grant proposal?", "What is technical writing?"]
      }
    ]
  }
];

/**
 * ════════════════════════════════════════════════════════════════
 * MATH CURRICULUM DATABASE
 * ════════════════════════════════════════════════════════════════
 */

export const MATH_CURRICULUM: GradeCurriculum[] = [
  // ────────────────────────────────────────────────────────────
  // Elementary School (Grades 1-6)
  // ────────────────────────────────────────────────────────────
  {
    grade: "1",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-1-counting",
        name: "Counting and Number Recognition",
        nameKo: "수 세기와 숫자 인식",
        description: "Counting 1-100, number order, comparing numbers",
        keywords: ["counting", "numbers", "1-100", "수세기", "숫자", "비교"],
        examples: ["What comes after 5?", "Which is bigger, 7 or 9?"]
      },
      {
        id: "math-elem-1-addition-subtraction",
        name: "Basic Addition and Subtraction",
        nameKo: "기초 덧셈과 뺄셈",
        description: "Addition/subtraction within 20",
        keywords: ["addition", "subtraction", "덧셈", "뺄셈", "plus", "minus"],
        examples: ["What is 5 + 3?", "What is 10 - 4?"]
      },
      {
        id: "math-elem-1-shapes",
        name: "Basic Shapes",
        nameKo: "기본 도형",
        description: "Circle, square, triangle, rectangle",
        keywords: ["shape", "circle", "square", "triangle", "도형", "원", "사각형", "삼각형"],
        examples: ["What is a circle?", "How many sides does a triangle have?"]
      },
      {
        id: "math-elem-1-measurement",
        name: "Basic Measurement",
        nameKo: "기초 측정",
        description: "Length, height, weight (non-standard units)",
        keywords: ["measurement", "length", "height", "측정", "길이", "높이"],
        examples: ["Which is longer?", "How do you measure length?"]
      }
    ]
  },
  {
    grade: "2",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-2-place-value",
        name: "Place Value",
        nameKo: "자릿값",
        description: "Ones, tens, hundreds",
        keywords: ["place value", "ones", "tens", "hundreds", "자릿값", "일", "십", "백"],
        examples: ["What is the place value of 3 in 234?", "What is tens place?"]
      },
      {
        id: "math-elem-2-addition-subtraction-100",
        name: "Addition and Subtraction within 100",
        nameKo: "100 이하 덧셈과 뺄셈",
        description: "Two-digit addition and subtraction",
        keywords: ["addition", "subtraction", "100", "두자리", "덧셈", "뺄셈"],
        examples: ["What is 45 + 23?", "What is 68 - 29?"]
      },
      {
        id: "math-elem-2-time",
        name: "Telling Time",
        nameKo: "시간 읽기",
        description: "Hour, half-hour, quarter-hour",
        keywords: ["time", "clock", "hour", "minute", "시간", "시계"],
        examples: ["What time is 3:30?", "How do you read a clock?"]
      },
      {
        id: "math-elem-2-money",
        name: "Money",
        nameKo: "돈",
        description: "Counting coins and bills, making change",
        keywords: ["money", "coin", "bill", "cent", "dollar", "돈", "동전", "지폐"],
        examples: ["How much is a quarter?", "What is 25 cents?"]
      }
    ]
  },
  {
    grade: "3",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-3-multiplication",
        name: "Multiplication",
        nameKo: "곱셈",
        description: "Multiplication facts 0-12, arrays, groups",
        keywords: ["multiplication", "times", "multiply", "곱셈", "곱하기"],
        examples: ["What is 6 × 7?", "What is multiplication?"]
      },
      {
        id: "math-elem-3-division",
        name: "Division",
        nameKo: "나눗셈",
        description: "Division facts, sharing, grouping",
        keywords: ["division", "divide", "나눗셈", "나누기"],
        examples: ["What is 24 ÷ 6?", "How do you divide?"]
      },
      {
        id: "math-elem-3-fractions-intro",
        name: "Introduction to Fractions",
        nameKo: "분수 입문",
        description: "Unit fractions, halves, thirds, fourths",
        keywords: ["fraction", "half", "third", "fourth", "분수", "반", "분의"],
        examples: ["What is 1/2?", "What is a fraction?"]
      },
      {
        id: "math-elem-3-area-perimeter",
        name: "Area and Perimeter",
        nameKo: "넓이와 둘레",
        description: "Calculating area and perimeter of rectangles",
        keywords: ["area", "perimeter", "넓이", "둘레", "사각형"],
        examples: ["What is area?", "How do you find perimeter?"]
      }
    ]
  },
  {
    grade: "4",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-4-multi-digit",
        name: "Multi-Digit Operations",
        nameKo: "여러 자리 사칙연산",
        description: "Addition, subtraction, multiplication, division with large numbers",
        keywords: ["multi-digit", "large numbers", "여러자리", "큰수"],
        examples: ["What is 456 × 23?", "How do you multiply large numbers?"]
      },
      {
        id: "math-elem-4-fractions-operations",
        name: "Fraction Operations",
        nameKo: "분수 연산",
        description: "Adding, subtracting fractions with like denominators",
        keywords: ["fraction", "add", "subtract", "분수", "덧셈", "뺄셈", "분모"],
        examples: ["What is 1/4 + 2/4?", "How do you add fractions?"]
      },
      {
        id: "math-elem-4-decimals-intro",
        name: "Introduction to Decimals",
        nameKo: "소수 입문",
        description: "Tenths, hundredths, comparing decimals",
        keywords: ["decimal", "tenth", "hundredth", "소수", "소수점"],
        examples: ["What is 0.5?", "How do you read decimals?"]
      },
      {
        id: "math-elem-4-angles",
        name: "Angles",
        nameKo: "각",
        description: "Types of angles, measuring angles",
        keywords: ["angle", "degree", "acute", "obtuse", "right", "각", "각도"],
        examples: ["What is a right angle?", "How do you measure angles?"]
      }
    ]
  },
  {
    grade: "5",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-5-decimal-operations",
        name: "Decimal Operations",
        nameKo: "소수 연산",
        description: "Adding, subtracting, multiplying, dividing decimals",
        keywords: ["decimal", "add", "subtract", "multiply", "divide", "소수", "연산"],
        examples: ["What is 3.5 + 2.7?", "How do you multiply decimals?"]
      },
      {
        id: "math-elem-5-fractions-advanced",
        name: "Advanced Fractions",
        nameKo: "고급 분수",
        description: "Multiplying fractions, dividing fractions",
        keywords: ["fraction", "multiply", "divide", "분수", "곱셈", "나눗셈"],
        examples: ["What is 1/2 × 3/4?", "How do you divide fractions?"]
      },
      {
        id: "math-elem-5-volume",
        name: "Volume",
        nameKo: "부피",
        description: "Volume of rectangular prisms",
        keywords: ["volume", "cubic", "prism", "부피", "직육면체"],
        examples: ["What is volume?", "How do you find volume of a box?"]
      },
      {
        id: "math-elem-5-coordinate-plane",
        name: "Coordinate Plane",
        nameKo: "좌표평면",
        description: "Plotting points, x-axis, y-axis, quadrants",
        keywords: ["coordinate", "plane", "x-axis", "y-axis", "좌표", "평면"],
        examples: ["What is a coordinate plane?", "How do you plot (3, 5)?"]
      }
    ]
  },
  {
    grade: "6",
    schoolLevel: "elementary",
    subject: "math",
    topics: [
      {
        id: "math-elem-6-ratios",
        name: "Ratios and Proportions",
        nameKo: "비와 비율",
        description: "Understanding ratios, solving proportions",
        keywords: ["ratio", "proportion", "비", "비율"],
        examples: ["What is a ratio?", "How do you solve proportions?"]
      },
      {
        id: "math-elem-6-percentages",
        name: "Percentages",
        nameKo: "백분율",
        description: "Converting between fractions, decimals, percentages",
        keywords: ["percentage", "percent", "백분율", "퍼센트"],
        examples: ["What is 50%?", "How do you find 25% of 80?"]
      },
      {
        id: "math-elem-6-integers",
        name: "Integers",
        nameKo: "정수",
        description: "Positive and negative numbers, number line",
        keywords: ["integer", "positive", "negative", "정수", "양수", "음수"],
        examples: ["What is an integer?", "What is -5 + 3?"]
      },
      {
        id: "math-elem-6-algebraic-expressions",
        name: "Algebraic Expressions",
        nameKo: "대수식",
        description: "Variables, evaluating expressions, writing expressions",
        keywords: ["algebra", "variable", "expression", "대수", "변수", "식"],
        examples: ["What is 2x + 3?", "What is a variable?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // Middle School (Grades 7-9)
  // ────────────────────────────────────────────────────────────
  {
    grade: "7",
    schoolLevel: "middle",
    subject: "math",
    topics: [
      {
        id: "math-mid-7-equations",
        name: "Solving Equations",
        nameKo: "방정식 풀이",
        description: "One-step, two-step, multi-step equations",
        keywords: ["equation", "solve", "방정식", "해", "풀이"],
        examples: ["How do you solve 2x + 5 = 13?", "What is an equation?"]
      },
      {
        id: "math-mid-7-inequalities",
        name: "Inequalities",
        nameKo: "부등식",
        description: "Solving and graphing inequalities",
        keywords: ["inequality", "부등식", "greater than", "less than"],
        examples: ["How do you solve x + 3 > 7?", "What is an inequality?"]
      },
      {
        id: "math-mid-7-probability",
        name: "Probability",
        nameKo: "확률",
        description: "Simple probability, experimental vs theoretical",
        keywords: ["probability", "chance", "확률", "가능성"],
        examples: ["What is probability?", "How do you find probability of a coin flip?"]
      },
      {
        id: "math-mid-7-statistics",
        name: "Statistics",
        nameKo: "통계",
        description: "Mean, median, mode, range",
        keywords: ["statistics", "mean", "median", "mode", "통계", "평균"],
        examples: ["What is mean?", "How do you find median?"]
      }
    ]
  },
  {
    grade: "8",
    schoolLevel: "middle",
    subject: "math",
    topics: [
      {
        id: "math-mid-8-linear-equations",
        name: "Linear Equations",
        nameKo: "일차방정식",
        description: "Slope-intercept form, graphing linear equations",
        keywords: ["linear", "slope", "일차방정식", "기울기", "y절편"],
        examples: ["What is y = mx + b?", "How do you find slope?"]
      },
      {
        id: "math-mid-8-systems",
        name: "Systems of Equations",
        nameKo: "연립방정식",
        description: "Solving systems by graphing, substitution, elimination",
        keywords: ["system", "연립방정식", "substitution", "elimination"],
        examples: ["How do you solve a system of equations?", "What is substitution method?"]
      },
      {
        id: "math-mid-8-functions",
        name: "Functions",
        nameKo: "함수",
        description: "Function notation, domain, range",
        keywords: ["function", "f(x)", "domain", "range", "함수", "정의역", "치역"],
        examples: ["What is a function?", "What is f(3) if f(x) = 2x + 1?"]
      },
      {
        id: "math-mid-8-pythagorean",
        name: "Pythagorean Theorem",
        nameKo: "피타고라스 정리",
        description: "a² + b² = c², right triangles",
        keywords: ["pythagorean", "theorem", "right triangle", "피타고라스", "직각삼각형"],
        examples: ["What is Pythagorean theorem?", "How do you use a² + b² = c²?"]
      }
    ]
  },
  {
    grade: "9",
    schoolLevel: "middle",
    subject: "math",
    topics: [
      {
        id: "math-mid-9-quadratic-intro",
        name: "Introduction to Quadratics",
        nameKo: "이차방정식 입문",
        description: "Solving quadratic equations by factoring",
        keywords: ["quadratic", "이차방정식", "factoring", "인수분해"],
        examples: ["How do you solve x² + 5x + 6 = 0?", "What is factoring?"]
      },
      {
        id: "math-mid-9-exponents",
        name: "Exponents and Radicals",
        nameKo: "지수와 근",
        description: "Laws of exponents, square roots, simplifying radicals",
        keywords: ["exponent", "radical", "square root", "지수", "근", "제곱근"],
        examples: ["What is x³ × x²?", "What is √16?"]
      },
      {
        id: "math-mid-9-polynomials",
        name: "Polynomials",
        nameKo: "다항식",
        description: "Adding, subtracting, multiplying polynomials",
        keywords: ["polynomial", "다항식", "monomial", "binomial"],
        examples: ["What is (x + 2)(x + 3)?", "How do you multiply polynomials?"]
      },
      {
        id: "math-mid-9-data-analysis",
        name: "Data Analysis",
        nameKo: "자료 분석",
        description: "Box plots, scatter plots, correlation",
        keywords: ["data", "box plot", "scatter plot", "correlation", "자료", "상관관계"],
        examples: ["What is a box plot?", "What is correlation?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // High School (Grades 10-12)
  // ────────────────────────────────────────────────────────────
  {
    grade: "10",
    schoolLevel: "high",
    subject: "math",
    topics: [
      {
        id: "math-high-10-algebra2",
        name: "Algebra 2",
        nameKo: "대수 2",
        description: "Quadratic formula, complex numbers, rational expressions",
        keywords: ["algebra 2", "quadratic formula", "complex", "대수", "이차공식"],
        examples: ["What is the quadratic formula?", "How do you solve ax² + bx + c = 0?"]
      },
      {
        id: "math-high-10-exponential",
        name: "Exponential Functions",
        nameKo: "지수함수",
        description: "Exponential growth/decay, logarithms",
        keywords: ["exponential", "logarithm", "지수함수", "로그"],
        examples: ["What is exponential growth?", "What is a logarithm?"]
      },
      {
        id: "math-high-10-sequences",
        name: "Sequences and Series",
        nameKo: "수열과 급수",
        description: "Arithmetic, geometric sequences and series",
        keywords: ["sequence", "series", "arithmetic", "geometric", "수열", "급수"],
        examples: ["What is an arithmetic sequence?", "What is geometric series?"]
      },
      {
        id: "math-high-10-geometry",
        name: "Geometry",
        nameKo: "기하",
        description: "Proofs, triangles, circles, transformations",
        keywords: ["geometry", "proof", "triangle", "circle", "기하", "증명"],
        examples: ["How do you prove congruence?", "What is a geometric proof?"]
      }
    ]
  },
  {
    grade: "11",
    schoolLevel: "high",
    subject: "math",
    topics: [
      {
        id: "math-high-11-precalculus",
        name: "Pre-Calculus",
        nameKo: "미적분 준비",
        description: "Trigonometry, polar coordinates, conic sections",
        keywords: ["precalculus", "trigonometry", "미적분", "삼각함수"],
        examples: ["What is sin(x)?", "How do you use trigonometry?"]
      },
      {
        id: "math-high-11-trigonometry",
        name: "Trigonometry",
        nameKo: "삼각법",
        description: "Unit circle, trig identities, solving trig equations",
        keywords: ["trigonometry", "sin", "cos", "tan", "삼각함수", "단위원"],
        examples: ["What is sin²(x) + cos²(x)?", "What is the unit circle?"]
      },
      {
        id: "math-high-11-vectors",
        name: "Vectors and Matrices",
        nameKo: "벡터와 행렬",
        description: "Vector operations, matrix multiplication",
        keywords: ["vector", "matrix", "벡터", "행렬"],
        examples: ["What is a vector?", "How do you multiply matrices?"]
      },
      {
        id: "math-high-11-sat-act-math",
        name: "SAT/ACT Math",
        nameKo: "SAT/ACT 수학",
        description: "Problem solving, data analysis, advanced math for standardized tests",
        keywords: ["sat", "act", "standardized test", "수능"],
        examples: ["How do you prepare for SAT Math?", "What is tested on ACT Math?"]
      }
    ]
  },
  {
    grade: "12",
    schoolLevel: "high",
    subject: "math",
    topics: [
      {
        id: "math-high-12-calculus",
        name: "Calculus (AP Calculus AB)",
        nameKo: "미적분 (AP Calculus AB)",
        description: "Limits, derivatives, integrals, fundamental theorem",
        keywords: ["calculus", "derivative", "integral", "limit", "미적분", "도함수", "적분"],
        examples: ["What is a derivative?", "How do you find the integral of x²?"]
      },
      {
        id: "math-high-12-ap-calculus-bc",
        name: "AP Calculus BC",
        nameKo: "AP 미적분 BC",
        description: "Advanced integration, series, parametric equations",
        keywords: ["ap calculus bc", "series", "parametric", "polar"],
        examples: ["What is a Taylor series?", "How do you integrate by parts?"]
      },
      {
        id: "math-high-12-statistics-ap",
        name: "AP Statistics",
        nameKo: "AP 통계",
        description: "Probability distributions, hypothesis testing, regression",
        keywords: ["ap statistics", "hypothesis", "regression", "통계", "가설검정"],
        examples: ["What is a normal distribution?", "How do you test a hypothesis?"]
      },
      {
        id: "math-high-12-discrete-math",
        name: "Discrete Mathematics",
        nameKo: "이산수학",
        description: "Logic, sets, counting, graph theory",
        keywords: ["discrete", "logic", "set", "graph theory", "이산수학"],
        examples: ["What is set theory?", "What is graph theory?"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  // University (Undergraduate)
  // ────────────────────────────────────────────────────────────
  {
    grade: "university-1",
    schoolLevel: "university",
    subject: "math",
    topics: [
      {
        id: "math-univ-1-calculus-multi",
        name: "Multivariable Calculus",
        nameKo: "다변수 미적분",
        description: "Partial derivatives, multiple integrals, vector calculus",
        keywords: ["multivariable", "partial derivative", "다변수", "편미분", "중적분"],
        examples: ["What is a partial derivative?", "How do you compute ∂f/∂x?"]
      },
      {
        id: "math-univ-1-linear-algebra",
        name: "Linear Algebra",
        nameKo: "선형대수",
        description: "Vector spaces, eigenvalues, linear transformations",
        keywords: ["linear algebra", "eigenvalue", "vector space", "선형대수", "고유값"],
        examples: ["What is an eigenvalue?", "What is a vector space?"]
      },
      {
        id: "math-univ-1-differential-equations",
        name: "Differential Equations",
        nameKo: "미분방정식",
        description: "ODEs, PDEs, solution methods",
        keywords: ["differential equation", "ode", "pde", "미분방정식"],
        examples: ["How do you solve a differential equation?", "What is an ODE?"]
      },
      {
        id: "math-univ-1-probability-theory",
        name: "Probability Theory",
        nameKo: "확률론",
        description: "Random variables, distributions, expectation",
        keywords: ["probability theory", "random variable", "distribution", "확률론"],
        examples: ["What is a random variable?", "What is expected value?"]
      },
      {
        id: "math-univ-1-real-analysis",
        name: "Real Analysis",
        nameKo: "해석학",
        description: "Sequences, series, continuity, convergence",
        keywords: ["real analysis", "convergence", "continuity", "해석학", "수렴"],
        examples: ["What is convergence?", "What is real analysis?"]
      },
      {
        id: "math-univ-1-abstract-algebra",
        name: "Abstract Algebra",
        nameKo: "추상대수",
        description: "Groups, rings, fields, homomorphisms",
        keywords: ["abstract algebra", "group", "ring", "field", "추상대수"],
        examples: ["What is a group?", "What is abstract algebra?"]
      }
    ]
  }
];

/**
 * ════════════════════════════════════════════════════════════════
 * SCIENCE CURRICULUM DATABASE
 * ════════════════════════════════════════════════════════════════
 */

export const SCIENCE_CURRICULUM: GradeCurriculum[] = [
  // Elementary School (Grades 3-6)
  {
    grade: "3",
    schoolLevel: "elementary",
    subject: "science",
    topics: [
      {
        id: "sci-elem-3-states-matter",
        name: "States of Matter",
        nameKo: "물질의 상태",
        description: "Solid, liquid, gas properties and changes",
        keywords: ["matter", "solid", "liquid", "gas", "물질", "고체", "액체", "기체"],
        examples: ["What is matter?", "What are the states of matter?"]
      },
      {
        id: "sci-elem-3-plants",
        name: "Plants and Life Cycles",
        nameKo: "식물과 생명 주기",
        description: "Plant parts, growth, and life cycles",
        keywords: ["plant", "life cycle", "growth", "식물", "생명주기"],
        examples: ["What do plants need?", "How do plants grow?"]
      }
    ]
  },

  // Middle School
  {
    grade: "7",
    schoolLevel: "middle",
    subject: "science",
    topics: [
      {
        id: "sci-mid-7-cell-biology",
        name: "Cell Structure and Function",
        nameKo: "세포 구조와 기능",
        description: "Cell organelles, plant vs animal cells",
        keywords: ["cell", "organelle", "nucleus", "mitochondria", "세포"],
        examples: ["What is a cell?", "What are organelles?"]
      },
      {
        id: "sci-mid-7-forces",
        name: "Forces and Motion",
        nameKo: "힘과 운동",
        description: "Newton's laws, gravity, friction",
        keywords: ["force", "motion", "gravity", "Newton", "힘", "운동"],
        examples: ["What is Newton's first law?", "What is gravity?"]
      }
    ]
  },

  // High School
  {
    grade: "10",
    schoolLevel: "high",
    subject: "science",
    topics: [
      {
        id: "sci-high-10-chemistry-basics",
        name: "Chemical Reactions",
        nameKo: "화학 반응",
        description: "Types of reactions, balancing equations",
        keywords: ["chemistry", "reaction", "equation", "화학", "반응"],
        examples: ["What is a chemical reaction?", "How to balance equations?"]
      },
      {
        id: "sci-high-10-biology",
        name: "Genetics and DNA",
        nameKo: "유전학과 DNA",
        description: "DNA structure, inheritance, genetics",
        keywords: ["DNA", "genetics", "inheritance", "유전", "유전학"],
        examples: ["What is DNA?", "How does inheritance work?"]
      }
    ]
  }
];

/**
 * ════════════════════════════════════════════════════════════════
 * SOCIAL STUDIES CURRICULUM (사회)
 * Based on National Curriculum Standards
 * ════════════════════════════════════════════════════════════════
 */
export const SOCIAL_STUDIES_CURRICULUM: GradeCurriculum[] = [
  // Elementary School (Grade 3)
  {
    grade: "3",
    schoolLevel: "elementary",
    subject: "social-studies",
    topics: [
      {
        id: "soc-elem-3-my-community",
        name: "My Community",
        nameKo: "우리 동네",
        description: "Understanding local community, places, and roles",
        keywords: ["community", "neighborhood", "local", "동네", "지역사회", "마을"],
        examples: ["What is a community?", "What are community helpers?"]
      },
      {
        id: "soc-elem-3-maps-globes",
        name: "Maps and Globes",
        nameKo: "지도와 지구본",
        description: "Basic geography, cardinal directions, map symbols",
        keywords: ["map", "globe", "direction", "north", "south", "지도", "지구본", "방향"],
        examples: ["How to read a map?", "What are cardinal directions?"]
      }
    ]
  },
  // Middle School (Grade 7)
  {
    grade: "7",
    schoolLevel: "middle",
    subject: "social-studies",
    topics: [
      {
        id: "soc-middle-7-world-geography",
        name: "World Geography",
        nameKo: "세계 지리",
        description: "Continents, countries, climate zones, physical features",
        keywords: ["geography", "continent", "country", "climate", "지리", "대륙", "기후"],
        examples: ["What are the continents?", "How does climate affect regions?"]
      },
      {
        id: "soc-middle-7-ancient-civilizations",
        name: "Ancient Civilizations",
        nameKo: "고대 문명",
        description: "Mesopotamia, Egypt, Greece, Rome, ancient China",
        keywords: ["ancient", "civilization", "mesopotamia", "egypt", "rome", "고대", "문명"],
        examples: ["What were ancient civilizations?", "How did ancient Egypt develop?"]
      }
    ]
  },
  // High School (Grade 10)
  {
    grade: "10",
    schoolLevel: "high",
    subject: "social-studies",
    topics: [
      {
        id: "soc-high-10-world-history",
        name: "World History",
        nameKo: "세계사",
        description: "Major historical events, revolutions, world wars",
        keywords: ["history", "revolution", "war", "enlightenment", "역사", "혁명", "전쟁"],
        examples: ["What caused World War I?", "What was the Industrial Revolution?"]
      },
      {
        id: "soc-high-10-government-systems",
        name: "Government Systems",
        nameKo: "정부 체제",
        description: "Democracy, monarchy, communism, political structures",
        keywords: ["government", "democracy", "politics", "constitution", "정부", "민주주의", "정치"],
        examples: ["What is democracy?", "How does government work?"]
      }
    ]
  }
];

/**
 * ════════════════════════════════════════════════════════════════
 * CURRICULUM LOOKUP FUNCTIONS
 * ════════════════════════════════════════════════════════════════
 */

/**
 * Get curriculum for specific grade and subject
 */
export function getCurriculum(
  grade: string,
  subject: Subject
): GradeCurriculum | undefined {
  const database =
    subject === 'english' ? ENGLISH_CURRICULUM :
    subject === 'math' ? MATH_CURRICULUM :
    subject === 'science' ? SCIENCE_CURRICULUM :
    subject === 'social-studies' ? SOCIAL_STUDIES_CURRICULUM :
    [];
  return database.find(c => c.grade === grade && c.subject === subject);
}

/**
 * Get all topics for a school level and subject
 */
export function getTopicsByLevel(
  schoolLevel: SchoolLevel,
  subject: Subject
): CurriculumTopic[] {
  const database =
    subject === 'english' ? ENGLISH_CURRICULUM :
    subject === 'math' ? MATH_CURRICULUM :
    subject === 'science' ? SCIENCE_CURRICULUM :
    subject === 'social-studies' ? SOCIAL_STUDIES_CURRICULUM :
    [];
  return database
    .filter(c => c.schoolLevel === schoolLevel)
    .flatMap(c => c.topics);
}

/**
 * Search topics by keyword
 */
export function searchTopics(
  keyword: string,
  subject: Subject,
  schoolLevel?: SchoolLevel
): CurriculumTopic[] {
  const database =
    subject === 'english' ? ENGLISH_CURRICULUM :
    subject === 'math' ? MATH_CURRICULUM :
    subject === 'science' ? SCIENCE_CURRICULUM :
    subject === 'social-studies' ? SOCIAL_STUDIES_CURRICULUM :
    [];
  const lowerKeyword = keyword.toLowerCase();

  return database
    .filter(c => !schoolLevel || c.schoolLevel === schoolLevel)
    .flatMap(c => c.topics)
    .filter(topic =>
      topic.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      topic.name.toLowerCase().includes(lowerKeyword) ||
      topic.nameKo.includes(keyword) ||
      topic.description.toLowerCase().includes(lowerKeyword)
    );
}

/**
 * Check if a topic is appropriate for a grade level
 */
export function isTopicInGrade(
  topicId: string,
  grade: string,
  subject: Subject
): boolean {
  const curriculum = getCurriculum(grade, subject);
  if (!curriculum) return false;

  return curriculum.topics.some(t => t.id === topicId);
}

/**
 * Get grade level for a topic
 */
export function getTopicGrade(
  topicId: string,
  subject: Subject
): string | undefined {
  const database =
    subject === 'english' ? ENGLISH_CURRICULUM :
    subject === 'math' ? MATH_CURRICULUM :
    subject === 'science' ? SCIENCE_CURRICULUM :
    subject === 'social-studies' ? SOCIAL_STUDIES_CURRICULUM :
    [];

  for (const curriculum of database) {
    if (curriculum.topics.some(t => t.id === topicId)) {
      return curriculum.grade;
    }
  }

  return undefined;
}

/**
 * Get all curriculum data (for testing/debugging)
 */
export function getAllCurriculum() {
  return {
    english: ENGLISH_CURRICULUM,
    math: MATH_CURRICULUM,
    science: SCIENCE_CURRICULUM,
    'social-studies': SOCIAL_STUDIES_CURRICULUM
  };
}
