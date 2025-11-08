/**
 * Korean Language RAG Content
 *
 * Verified Korean language learning content for elementary to university levels
 * Covers: Reading, Writing, Grammar, Literature
 * Based on: 2015 Revised Korean National Curriculum
 */

import type { VerifiedContent, Subject, SchoolLevel } from './rag-system';

export const KOREAN_VERIFIED_CONTENT: VerifiedContent[] = [
  // ═══════════════════════════════════════════════════════════
  // ELEMENTARY GRADE 1-2: 한글 기초 (Hangul Basics)
  // ═══════════════════════════════════════════════════════════

  // 1. Hangul Vowels (한글 모음)
  {
    id: "kor-elem-hangul-vowels",
    subject: "korean" as Subject,
    topic: "Hangul Vowels",
    topicKo: "한글 모음",
    gradeLevel: "1",
    schoolLevel: "elementary",
    content: `Korean vowels (모음) are the sounds that form syllables with consonants.

Basic Vowels (10):
ㅏ (a), ㅑ (ya), ㅓ (eo), ㅕ (yeo), ㅗ (o)
ㅛ (yo), ㅜ (u), ㅠ (yu), ㅡ (eu), ㅣ (i)

Compound Vowels (11):
ㅐ (ae), ㅒ (yae), ㅔ (e), ㅖ (ye)
ㅘ (wa), ㅙ (wae), ㅚ (oe), ㅝ (wo), ㅞ (we), ㅟ (wi), ㅢ (ui)

Writing Rules:
1. Vertical vowels (ㅏ, ㅓ, etc.): written to the right of consonant (가, 거)
2. Horizontal vowels (ㅗ, ㅜ, etc.): written below consonant (고, 구)`,
    contentKo: `한글 모음은 소리를 만드는 글자입니다. 자음과 함께 글자를 만들어요.

기본 모음 (10개):
ㅏ (아), ㅑ (야), ㅓ (어), ㅕ (여), ㅗ (오)
ㅛ (요), ㅜ (우), ㅠ (유), ㅡ (으), ㅣ (이)

복합 모음 (11개):
ㅐ (애), ㅒ (얘), ㅔ (에), ㅖ (예)
ㅘ (와), ㅙ (왜), ㅚ (외), ㅝ (워), ㅞ (웨), ㅟ (위), ㅢ (의)

쓰는 방법:
1. 세로 모음 (ㅏ, ㅓ 등): 자음 오른쪽에 써요 (가, 거)
2. 가로 모음 (ㅗ, ㅜ 등): 자음 아래에 써요 (고, 구)

연습:
- 기본 모음을 먼저 익혀요
- 소리 내어 읽으면서 써요
- 비슷한 모양의 모음을 구분해요 (ㅏ/ㅓ, ㅗ/ㅜ)`,
    examples: [
      "가방 (bag) - vertical vowel ㅏ",
      "고양이 (cat) - horizontal vowel ㅗ",
      "의자 (chair) - compound vowel ㅢ",
      "왜 (why) - compound vowel ㅙ"
    ],
    examplesKo: [
      "가방 - 세로 모음 ㅏ를 사용해요",
      "고양이 - 가로 모음 ㅗ를 사용해요",
      "의자 - 복합 모음 ㅢ를 사용해요",
      "왜 - 복합 모음 ㅙ를 사용해요",
      "우유 - 가로 모음 ㅜ를 두 번 사용해요"
    ],
    commonMistakes: [
      "❌ ㅐ vs ㅔ confusion - Practice pronunciation difference",
      "❌ Mixing vertical/horizontal positions",
      "❌ Forgetting compound vowels are single sounds"
    ],
    keyPoints: [
      "Learn 10 basic vowels first",
      "Vertical vowels go right, horizontal go below",
      "Compound vowels are combinations of basic vowels"
    ],
    keyPointsKo: [
      "기본 모음 10개를 먼저 외워요",
      "세로 모음은 오른쪽, 가로 모음은 아래에 써요",
      "복합 모음은 기본 모음을 합친 거예요",
      "소리를 들으면서 구분 연습을 해요"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // 2. Hangul Consonants (한글 자음)
  {
    id: "kor-elem-hangul-consonants",
    subject: "korean" as Subject,
    topic: "Hangul Consonants",
    topicKo: "한글 자음",
    gradeLevel: "1",
    schoolLevel: "elementary",
    content: `Korean consonants (자음) are sounds that block air to create syllables.

Basic Consonants (14):
ㄱ (g/k), ㄴ (n), ㄷ (d/t), ㄹ (r/l), ㅁ (m)
ㅂ (b/p), ㅅ (s), ㅇ (ng/silent), ㅈ (j), ㅊ (ch)
ㅋ (k), ㅌ (t), ㅍ (p), ㅎ (h)

Double Consonants (5):
ㄲ (kk), ㄸ (tt), ㅃ (pp), ㅆ (ss), ㅉ (jj)

Position Rules:
1. Initial consonant: starts syllable (가, 나, 다)
2. Final consonant (받침): ends syllable (각, 난, 달)
3. ㅇ is silent when initial, "ng" sound when final`,
    contentKo: `한글 자음은 소리를 막아서 만드는 글자예요.

기본 자음 (14개):
ㄱ (기역), ㄴ (니은), ㄷ (디귿), ㄹ (리을), ㅁ (미음)
ㅂ (비읍), ㅅ (시옷), ㅇ (이응), ㅈ (지읒), ㅊ (치읓)
ㅋ (키읔), ㅌ (티읕), ㅍ (피읖), ㅎ (히읗)

쌍자음 (5개):
ㄲ (쌍기역), ㄸ (쌍디귿), ㅃ (쌍비읍), ㅆ (쌍시옷), ㅉ (쌍지읒)

위치와 소리:
1. 첫소리: 글자 맨 처음 (가, 나, 다)
2. 받침: 글자 맨 끝 (각, 난, 달)
3. ㅇ은 첫소리일 때 조용해요, 받침일 때는 "ㅇ" 소리가 나요

쓰는 순서:
- 왼쪽 → 오른쪽
- 위 → 아래
- ㄱ: 가로 → 세로
- ㄴ: 가로 → 세로`,
    examples: [
      "가 (ga) - ㄱ initial",
      "각 (gak) - ㄱ final (받침)",
      "강 (gang) - ㅇ final makes 'ng' sound",
      "아 (a) - ㅇ initial is silent",
      "까 (kka) - double consonant ㄲ"
    ],
    examplesKo: [
      "가방 - ㄱ이 첫소리로 와요",
      "각도 - ㄱ이 받침으로 와요",
      "강아지 - ㅇ 받침은 '응' 소리",
      "아이 - ㅇ 첫소리는 조용해요",
      "까마귀 - 쌍자음 ㄲ를 사용해요"
    ],
    commonMistakes: [
      "❌ Confusing ㄱ/ㅋ, ㄷ/ㅌ, ㅂ/ㅍ sounds",
      "❌ Forgetting ㅇ is silent when initial",
      "❌ Wrong stroke order when writing"
    ],
    keyPoints: [
      "14 basic consonants + 5 double consonants",
      "ㅇ is silent initially, 'ng' sound finally",
      "Double consonants are tenser sounds",
      "Follow stroke order: left→right, top→bottom"
    ],
    keyPointsKo: [
      "기본 자음 14개, 쌍자음 5개를 외워요",
      "ㅇ은 첫소리면 조용, 받침이면 '응'",
      "쌍자음은 더 세게 소리 내요",
      "쓰는 순서를 지켜요: 왼쪽→오른쪽, 위→아래"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // 3. Word Spacing (띄어쓰기)
  {
    id: "kor-elem-word-spacing",
    subject: "korean" as Subject,
    topic: "Word Spacing",
    topicKo: "띄어쓰기",
    gradeLevel: "2",
    schoolLevel: "elementary",
    content: `Word spacing (띄어쓰기) separates words to make sentences easier to read.

Basic Rules:
1. Space between words: 나는 학생이다 (I am a student)
2. No space within compound words: 학교생활 (school life)
3. Space after particles: 나는 (I + topic particle)

Common Patterns:
- Name + particle: 철수가, 영희는
- Noun + verb: 밥을 먹다 (eat rice)
- Numbers + counters: 한 개, 두 명`,
    contentKo: `띄어쓰기는 단어와 단어 사이를 띄워서 문장을 읽기 쉽게 해요.

기본 규칙:
1. 단어와 단어는 띄워요: 나는 학생이다
2. 붙여 쓰는 말도 있어요: 학교생활, 우리나라
3. 조사는 앞말에 붙여요: 나는, 학교에서

띄어쓰는 곳:
- 이름 다음: 철수가 학교에 간다
- 명사 + 동사: 밥을 먹다, 책을 읽다
- 숫자 + 단위: 한 개, 두 명

붙여 쓰는 곳:
- 조사: 가, 는, 을, 를, 에, 에서
- 합친 낱말: 학교생활, 우리나라
- 보조 용언: ~해 주다, ~고 싶다

연습 방법:
- 문장을 천천히 읽으면서 의미 단위로 끊어요
- 조사는 앞말에 붙인다고 기억해요`,
    examples: [
      "나는 학생이다 (I am a student)",
      "학교에서 공부한다 (study at school)",
      "책을 읽고 싶다 (want to read a book)"
    ],
    examplesKo: [
      "✅ 나는 학교에 간다 (올바른 띄어쓰기)",
      "❌ 나는학교에간다 (틀린 띄어쓰기)",
      "✅ 철수가 밥을 먹는다",
      "❌ 철 수가밥을먹는다",
      "✅ 우리나라는 아름답다 (우리나라는 붙여 써요)"
    ],
    commonMistakes: [
      "❌ Spacing particles: 나 는 (wrong) → 나는 (correct)",
      "❌ Separating compound words: 학교 생활 → 학교생활",
      "❌ Not spacing between nouns and verbs"
    ],
    keyPoints: [
      "Space between separate words",
      "Particles attach to preceding word",
      "Compound words stay together",
      "Practice by reading slowly"
    ],
    keyPointsKo: [
      "단어와 단어 사이는 띄워요",
      "조사는 앞말에 붙여 써요",
      "합친 낱말은 붙여 써요",
      "천천히 읽으면서 연습해요"
    ],
    source: "2015 개정 교육과정 - 국어 2학년",
    lastVerified: "2025-01-08"
  },

  // ═══════════════════════════════════════════════════════════
  // ELEMENTARY GRADE 3-4: 문법 기초 (Basic Grammar)
  // ═══════════════════════════════════════════════════════════

  // 4. Sentence Components (문장 성분)
  {
    id: "kor-elem-sentence-components",
    subject: "korean" as Subject,
    topic: "Sentence Components",
    topicKo: "문장 성분",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `Korean sentences are made of components with specific roles.

Main Components:
1. Subject (주어): who/what does action - ends with 이/가
   Example: 철수가 학교에 간다 (subject: 철수가)

2. Predicate (서술어): action or state - verb/adjective
   Example: 철수가 학교에 간다 (predicate: 간다)

3. Object (목적어): receives action - ends with 을/를
   Example: 나는 책을 읽는다 (object: 책을)

4. Complement (보어): completes meaning - ends with 이/가
   Example: 철수는 학생이다 (complement: 학생이)

Modifier Components:
1. Modifier (관형어): modifies noun - 어떤, 무슨
   Example: 예쁜 꽃이 핀다 (modifier: 예쁜)

2. Adverb (부사어): modifies verb/adjective - 어떻게, 얼마나
   Example: 철수가 빨리 달린다 (adverb: 빨리)`,
    contentKo: `문장은 여러 성분으로 이루어져 있어요. 각 성분은 역할이 달라요.

주요 성분:
1. 주어: 동작이나 상태의 주체 ("누가", "무엇이")
   예: 철수가 학교에 간다 (주어: 철수가)
   - 보통 '~이/가'로 끝나요

2. 서술어: 주어의 동작이나 상태 ("어떻게 하다", "어떠하다")
   예: 철수가 학교에 간다 (서술어: 간다)
   - 동사나 형용사로 표현해요

3. 목적어: 동작의 대상 ("무엇을", "누구를")
   예: 나는 책을 읽는다 (목적어: 책을)
   - 보통 '~을/를'로 끝나요

4. 보어: 주어나 목적어를 보충 설명 ("무엇이 되다", "무엇이다")
   예: 철수는 학생이다 (보어: 학생이)
   - 보통 '~이/가'로 끝나요

부속 성분:
1. 관형어: 명사를 꾸며줌 ("어떤", "무슨")
   예: 예쁜 꽃이 핀다 (관형어: 예쁜)

2. 부사어: 동작이나 상태를 꾸며줌 ("어떻게", "얼마나")
   예: 철수가 빨리 달린다 (부사어: 빨리)

찾는 방법:
- 주어: "누가/무엇이" 물어봐요
- 서술어: "어떻게 한다/어떠하다" 찾아요
- 목적어: "무엇을/누구를" 물어봐요`,
    examples: [
      "Subject + Predicate: 새가 / 운다 (bird sings)",
      "Subject + Object + Predicate: 고양이가 / 쥐를 / 잡는다 (cat catches mouse)",
      "Subject + Complement + Predicate: 장미는 / 꽃이 / 이다 (rose is a flower)",
      "Modifier + Subject + Predicate: 빨간 / 사과가 / 떨어진다 (red apple falls)"
    ],
    examplesKo: [
      "주어 + 서술어: 새가 / 운다",
      "주어 + 목적어 + 서술어: 고양이가 / 쥐를 / 잡는다",
      "주어 + 보어 + 서술어: 장미는 / 꽃이 / 이다",
      "관형어 + 주어 + 서술어: 빨간 / 사과가 / 떨어진다",
      "주어 + 부사어 + 서술어: 토끼가 / 빨리 / 뛴다"
    ],
    commonMistakes: [
      "❌ Confusing 이/가 (subject) vs 이/가 (complement)",
      "❌ Mistaking adverbs for modifiers",
      "❌ Missing the predicate in analysis"
    ],
    keyPoints: [
      "Subject and predicate are essential",
      "Object ends with 을/를",
      "Complement ends with 이/가 (different from subject)",
      "Modifiers describe nouns, adverbs describe verbs"
    ],
    keyPointsKo: [
      "주어와 서술어는 문장의 필수 성분이에요",
      "목적어는 '~을/를'로 끝나요",
      "보어는 '~이/가'로 끝나요 (주어와 다름)",
      "관형어는 명사를, 부사어는 동사를 꾸며요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // 5. Sentence Types (문장의 종류)
  {
    id: "kor-elem-sentence-types",
    subject: "korean" as Subject,
    topic: "Sentence Types",
    topicKo: "문장의 종류",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `Korean sentences are classified by purpose and ending.

By Purpose:
1. Declarative (평서문): makes statement
   - Ends with: ~다, ~이다
   - Example: 나는 학생이다 (I am a student)

2. Interrogative (의문문): asks question
   - Ends with: ~니?, ~나?, ~까?
   - Example: 너는 학생이니? (Are you a student?)

3. Imperative (명령문): gives command
   - Ends with: ~아라/어라, ~자
   - Example: 숙제를 해라 (Do your homework)

4. Exclamatory (감탄문): expresses emotion
   - Ends with: ~구나!, ~네!
   - Example: 참 예쁘구나! (How pretty!)`,
    contentKo: `문장은 하는 일에 따라 4가지로 나눠요.

1. 평서문: 사실이나 생각을 말해요
   - 끝: ~다, ~이다
   - 예: 나는 학생이다, 날씨가 좋다
   - 느낌: 말하는 듯한 느낌

2. 의문문: 물어보는 문장이에요
   - 끝: ~니?, ~나?, ~까?, ~을까?
   - 예: 너는 학생이니?, 날씨가 좋니?
   - 느낌: 궁금한 듯한 느낌

3. 명령문: 시키거나 부탁하는 문장이에요
   - 끝: ~아라/어라, ~자, ~세요
   - 예: 숙제를 해라, 같이 가자, 앉으세요
   - 느낌: 시키는 듯한 느낌

4. 감탄문: 놀라거나 감동한 마음을 나타내요
   - 끝: ~구나!, ~네!, ~도다!
   - 예: 참 예쁘구나!, 정말 맛있네!
   - 느낌: 놀라운 듯한 느낌

문장 바꾸기:
- 평서문 → 의문문: "이다" → "이니?"
- 평서문 → 명령문: "먹는다" → "먹어라"
- 평서문 → 감탄문: "예쁘다" → "예쁘구나!"`,
    examples: [
      "Declarative: 오늘은 날씨가 좋다 (The weather is nice today)",
      "Interrogative: 오늘은 날씨가 좋니? (Is the weather nice today?)",
      "Imperative: 문을 닫아라 (Close the door)",
      "Exclamatory: 정말 예쁘구나! (How beautiful!)"
    ],
    examplesKo: [
      "평서문: 나는 학생이다 / 책이 재미있다",
      "의문문: 너는 학생이니? / 책이 재미있니?",
      "명령문: 책을 읽어라 / 같이 가자",
      "감탄문: 정말 재미있구나! / 참 예쁘네!",
      "높임: 앉으세요 (명령문 높임)"
    ],
    commonMistakes: [
      "❌ Using wrong ending for sentence type",
      "❌ Forgetting question mark for interrogative",
      "❌ Confusing imperative with declarative"
    ],
    keyPoints: [
      "4 types: declarative, interrogative, imperative, exclamatory",
      "Each type has specific endings",
      "Sentence type changes meaning and tone",
      "Pay attention to ending particles"
    ],
    keyPointsKo: [
      "4가지 종류: 평서문, 의문문, 명령문, 감탄문",
      "각 문장은 특별한 끝말을 가져요",
      "끝말을 바꾸면 문장 종류가 바뀌어요",
      "느낌을 살려서 읽어요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE SCHOOL: 문법 심화 (Advanced Grammar)
  // ═══════════════════════════════════════════════════════════

  // 6. Parts of Speech (품사)
  {
    id: "kor-mid-parts-of-speech",
    subject: "korean" as Subject,
    topic: "Parts of Speech",
    topicKo: "품사",
    gradeLevel: "7",
    schoolLevel: "middle",
    content: `Korean has 9 parts of speech (품사) classified by function and form.

9 Parts of Speech:

1. Noun (명사): names of things
   - Example: 학생 (student), 책상 (desk), 서울 (Seoul)

2. Pronoun (대명사): replaces nouns
   - Example: 나 (I), 너 (you), 그 (he), 이것 (this), 저것 (that)

3. Verb (동사): actions or processes
   - Example: 먹다 (eat), 가다 (go), 공부하다 (study)

4. Adjective (형용사): properties or states
   - Example: 예쁘다 (pretty), 크다 (big), 좋다 (good)

5. Determiner (관형사): modifies nouns without particles
   - Example: 새 (new), 헌 (old), 모든 (all), 어떤 (which)

6. Adverb (부사): modifies verbs or adjectives
   - Example: 매우 (very), 빨리 (quickly), 잘 (well)

7. Particle (조사): shows grammatical relationship
   - Example: 이/가, 을/를, 은/는, 에, 에서

8. Interjection (감탄사): expresses emotion
   - Example: 아 (ah), 오 (oh), 아이고 (oh my), 와 (wow)

9. Ending (어미): attaches to verb/adjective stems
   - Example: -다, -니, -고, -면

Classification:
- Unchangeable (불변어): nouns, pronouns, determiners, adverbs, interjections, particles
- Changeable (가변어): verbs, adjectives (change with endings)`,
    contentKo: `한국어는 9개의 품사로 나뉘어요. 기능과 형태로 분류해요.

9품사:

1. 명사: 사람, 사물, 장소의 이름
   - 예: 학생, 책상, 서울
   - 특징: 형태가 안 바뀌어요

2. 대명사: 명사를 대신하는 말
   - 예: 나, 너, 그, 이것, 저것
   - 특징: 사람이나 사물을 가리켜요

3. 동사: 동작이나 작용을 나타냄
   - 예: 먹다, 가다, 공부하다
   - 특징: 어미에 따라 형태가 바뀌어요

4. 형용사: 성질이나 상태를 나타냄
   - 예: 예쁘다, 크다, 좋다
   - 특징: 어미에 따라 형태가 바뀌어요

5. 관형사: 명사를 꾸며줌 (조사 없이)
   - 예: 새, 헌, 모든, 어떤
   - 특징: 항상 명사 앞에 와요

6. 부사: 동작이나 상태를 꾸며줌
   - 예: 매우, 빨리, 잘
   - 특징: 동사나 형용사를 꾸며요

7. 조사: 명사 뒤에 붙어 문법적 관계 표시
   - 예: 이/가, 을/를, 은/는, 에, 에서
   - 특징: 단독으로 못 쓰고 앞말에 붙어요

8. 감탄사: 감정이나 의지 표현
   - 예: 아, 오, 아이고, 와
   - 특징: 독립적으로 써요

9. 어미: 용언(동사/형용사) 어간 뒤에 붙음
   - 예: -다, -니, -고, -면
   - 특징: 문장을 완성해요

분류:
- 불변어 (형태 안 바뀜): 명사, 대명사, 관형사, 부사, 감탄사, 조사
- 가변어 (형태 바뀜): 동사, 형용사 (어미에 따라 변함)

구분 방법:
- 동사: ~을 수 있다 (먹을 수 있다)
- 형용사: ~는 것 불가능 (예쁘는 것 ✗)
- 관형사 vs 형용사: 관형사는 조사 붙기 불가능`,
    examples: [
      "Noun: 학교에서 책을 읽는다 (school, book)",
      "Verb: 학교에서 책을 읽는다 (read)",
      "Adverb: 매우 빨리 달린다 (very, quickly)",
      "Particle: 철수가 학교에 간다 (가, 에)",
      "Ending: 먹다 → 먹고, 먹으니, 먹으면"
    ],
    examplesKo: [
      "명사: 학교, 책, 학생 (사람/사물 이름)",
      "동사: 먹다, 가다, 읽다 (동작)",
      "형용사: 예쁘다, 크다 (상태)",
      "부사: 매우 예쁘다, 빨리 달리다",
      "조사: 나는, 학교에, 책을",
      "어미: 먹다 → 먹고, 먹으니, 먹으면"
    ],
    commonMistakes: [
      "❌ Confusing determiners (관형사) with adjectives (형용사)",
      "❌ Not recognizing verbs vs adjectives: 동사는 '~는' 가능, 형용사는 불가능",
      "❌ Forgetting particles are bound morphemes"
    ],
    keyPoints: [
      "9 parts of speech in Korean",
      "Unchangeable (불변어) vs Changeable (가변어)",
      "Verbs/adjectives change with endings",
      "Particles show grammatical relationships"
    ],
    keyPointsKo: [
      "한국어는 9품사로 나뉘어요",
      "불변어는 형태가 안 바뀌어요",
      "가변어(용언)는 어미에 따라 바뀌어요",
      "조사는 명사 뒤에만 붙어요",
      "동사는 '~는' 가능, 형용사는 불가능"
    ],
    source: "2015 개정 교육과정 - 국어 1(중학교)",
    lastVerified: "2025-01-08"
  },

  // ═══════════════════════════════════════════════════════════
  // ELEMENTARY GRADE 1: 받침과 문장부호 (Final Consonants & Punctuation)
  // ═══════════════════════════════════════════════════════════

  // 7. Final Consonants (받침)
  {
    id: "kor-elem-final-consonants",
    subject: "korean" as Subject,
    topic: "Final Consonants (Batchim)",
    topicKo: "받침",
    gradeLevel: "1",
    schoolLevel: "elementary",
    content: `Final consonants (받침) are consonants that come at the bottom of a syllable.

7 Representative Sounds:
ㄱ (k), ㄴ (n), ㄷ (t), ㄹ (l), ㅁ (m), ㅂ (p), ㅇ (ng)

Rules:
1. All final consonants belong to one of 7 sounds
2. 각, 갂, 갃, 간, 갇, 갈, 갉 all have different shapes but represent 7 sounds
3. Practice: 감 (m sound), 강 (ng sound), 갑 (p sound)`,
    contentKo: `받침은 글자의 맨 아래에 오는 자음입니다.

7가지 대표 소리:
ㄱ (기역), ㄴ (니은), ㄷ (디귿), ㄹ (리을), ㅁ (미음), ㅂ (비읍), ㅇ (이응)

규칙:
1. 모든 받침은 7가지 소리 중 하나예요
2. 모양은 달라도 소리는 7가지만 나요
3. 예: ㄱ, ㄲ, ㅋ로 끝나면 모두 'ㄱ' 소리
4. 예: ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ로 끝나면 모두 'ㄷ' 소리

연습:
- 감 (미음 받침)
- 강 (이응 받침)
- 갑 (비읍 받침)
- 각 (기역 받침)`,
    examples: [
      "감 (persimmon) - ㅁ final consonant",
      "강 (river) - ㅇ final consonant",
      "밥 (rice) - ㅂ final consonant",
      "산 (mountain) - ㄴ final consonant"
    ],
    examplesKo: [
      "감 - ㅁ 받침 (입을 다물고)",
      "강 - ㅇ 받침 (코로 소리 나요)",
      "밥 - ㅂ 받침 (입을 다물고)",
      "산 - ㄴ 받침 (혀를 위에 대고)",
      "달 - ㄹ 받침 (혀를 굴려요)",
      "집 - ㅂ 받침 (밥과 같은 소리)",
      "꽃 - ㄷ 받침 (ㅅ로 쓰지만 ㄷ 소리)"
    ],
    commonMistakes: [
      "❌ 받침을 빼먹고 쓰기 (ga instead of gak)",
      "❌ 받침 소리를 헷갈리기 (ㄱ/ㅋ 모두 ㄱ 소리)",
      "❌ 겹받침과 혼동하기"
    ],
    keyPoints: [
      "7 representative final consonant sounds",
      "Different letters can make same sound",
      "Essential for reading and writing correctly"
    ],
    keyPointsKo: [
      "받침은 7가지 소리만 있어요",
      "모양은 달라도 같은 소리가 나요",
      "입 모양과 혀의 위치를 기억해요",
      "천천히 소리 내면서 연습해요"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // 8. Punctuation Marks (문장 부호)
  {
    id: "kor-elem-punctuation",
    subject: "korean" as Subject,
    topic: "Punctuation Marks",
    topicKo: "문장 부호",
    gradeLevel: "1",
    schoolLevel: "elementary",
    content: `Punctuation marks help us understand sentences correctly.

Basic Marks:
1. Period (마침표 .) - End of statement
2. Question mark (물음표 ?) - End of question
3. Exclamation mark (느낌표 !) - Strong feeling
4. Comma (쉼표 ,) - Short pause`,
    contentKo: `문장 부호는 글을 읽을 때 어떻게 읽어야 하는지 알려줘요.

기본 문장 부호:

1. 마침표 (.)
   - 문장이 끝날 때 써요
   - 예: 나는 학생입니다.

2. 물음표 (?)
   - 궁금한 것을 물을 때 써요
   - 예: 이것이 무엇인가요?

3. 느낌표 (!)
   - 놀라거나 강한 느낌을 표현할 때 써요
   - 예: 와! 정말 예쁘다!

4. 쉼표 (,)
   - 잠깐 쉬는 곳에 써요
   - 예: 사과, 배, 포도를 샀어요.

사용 방법:
- 문장 부호 뒤에는 한 칸 띄워요
- 문장 끝에는 꼭 마침표, 물음표, 느낌표 중 하나를 써요`,
    examples: [
      "I am a student. (Period)",
      "What is this? (Question mark)",
      "Wow! So beautiful! (Exclamation mark)",
      "I bought apples, pears, and grapes. (Comma)"
    ],
    examplesKo: [
      "나는 학생이에요. (마침표)",
      "오늘 날씨가 어때요? (물음표)",
      "와! 정말 멋지다! (느낌표)",
      "나는 사과, 배, 포도를 좋아해요. (쉼표)",
      "안녕하세요. 반가워요! (마침표와 느낌표 함께)"
    ],
    commonMistakes: [
      "❌ Forgetting periods at the end",
      "❌ Using wrong mark (. for questions)",
      "❌ Not spacing after punctuation"
    ],
    keyPoints: [
      "Period (.) for statements",
      "Question mark (?) for questions",
      "Exclamation mark (!) for strong feelings",
      "Comma (,) for pauses"
    ],
    keyPointsKo: [
      "마침표는 문장 끝에 써요",
      "물음표는 질문할 때 써요",
      "느낌표는 강한 느낌을 나타내요",
      "쉼표는 잠깐 쉬는 곳에 써요",
      "문장 부호 뒤에는 한 칸 띄워요"
    ],
    source: "2015 개정 교육과정 - 국어 1학년",
    lastVerified: "2025-01-08"
  },

  // ═══════════════════════════════════════════════════════════
  // ELEMENTARY GRADE 2: 겹받침과 기초 쓰기 (Double Finals & Basic Writing)
  // ═══════════════════════════════════════════════════════════

  // 9. Double Final Consonants (겹받침)
  {
    id: "kor-elem-double-finals",
    subject: "korean" as Subject,
    topic: "Double Final Consonants",
    topicKo: "겹받침",
    gradeLevel: "2",
    schoolLevel: "elementary",
    content: `Double final consonants are two consonants together at the bottom of a syllable.

Common Double Finals:
ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ

Pronunciation Rules:
1. Usually pronounce only one of them
2. 값 = [gap] (pronounce ㅂ)
3. 닭 = [dak] (pronounce ㄱ)`,
    contentKo: `겹받침은 받침이 두 개 붙어 있는 것이에요.

자주 쓰는 겹받침:
ㄳ (값), ㄵ (않), ㄶ (많), ㄺ (닭), ㄻ (삶), ㄼ (넓), ㄽ (외곬), ㄾ (핥), ㄿ (읊), ㅀ (없), ㅄ (없)

발음 규칙:

1. 기본 규칙: 보통 하나만 소리 나요
   - 값 [갑] - ㅂ 소리만 나요
   - 닭 [닥] - ㄱ 소리만 나요
   - 삶 [삼] - ㅁ 소리만 나요

2. 뒤에 모음이 오면:
   - 값이 [갑씨] - 두 소리 다 나요
   - 닭을 [달글] - 두 소리 다 나요

연습 방법:
- 먼저 모양을 익혀요
- 소리를 들으면서 따라 해요
- 단어 전체를 반복해서 읽어요`,
    examples: [
      "값 [gap] - only ㅂ pronounced",
      "닭 [dak] - only ㄱ pronounced",
      "삶 [sam] - only ㅁ pronounced",
      "값이 [gap-si] - both sounds when followed by vowel"
    ],
    examplesKo: [
      "값 [갑] - 가격을 말할 때",
      "닭 [닥] - 동물 이름",
      "삶 [삼] - 살다의 명사형",
      "많다 [만타] - 수량이 많을 때",
      "없다 [업따] - 무언가가 없을 때",
      "값이 [갑씨] - 뒤에 모음이 오면 두 소리 나요"
    ],
    commonMistakes: [
      "❌ Both consonants pronounced (갑스 instead of 갑)",
      "❌ Wrong consonant chosen",
      "❌ Not knowing which to pronounce"
    ],
    keyPoints: [
      "Usually only one consonant is pronounced",
      "Learn common patterns",
      "Both sounds appear when followed by vowel"
    ],
    keyPointsKo: [
      "겹받침은 보통 하나만 소리 나요",
      "어느 소리가 나는지 외워야 해요",
      "뒤에 모음이 오면 두 소리 다 나요",
      "자주 쓰는 단어로 연습해요"
    ],
    source: "2015 개정 교육과정 - 국어 2학년",
    lastVerified: "2025-01-08"
  },

  // 10. Diary Writing (일기 쓰기)
  {
    id: "kor-elem-diary-writing",
    subject: "korean" as Subject,
    topic: "Diary Writing",
    topicKo: "일기 쓰기",
    gradeLevel: "2",
    schoolLevel: "elementary",
    content: `A diary is a personal record of daily experiences and feelings.

Structure:
1. Date and weather
2. What happened today
3. How you felt
4. What you learned

Tips:
- Write honestly about your feelings
- Use complete sentences
- Include specific details`,
    contentKo: `일기는 하루 동안 있었던 일과 느낀 점을 쓰는 거예요.

일기 쓰는 방법:

1. 날짜와 날씨 쓰기
   - 예: 2025년 1월 8일 화요일 맑음

2. 오늘 있었던 일 쓰기
   - 시간 순서대로 써요
   - 누가, 언제, 어디서, 무엇을, 어떻게

3. 느낀 점 쓰기
   - 기뻤어요, 슬펐어요, 재미있었어요
   - 왜 그렇게 느꼈는지 써요

4. 배운 점이나 다짐 쓰기
   - 오늘 배운 것
   - 내일 할 일

일기 쓰기 팁:
- 솔직하게 써요
- 완전한 문장으로 써요
- 구체적으로 써요 (언제, 어디서, 무엇을)`,
    examples: [
      "Date: January 8, 2025, Tuesday, Sunny",
      "Event: I went to the park with my friend",
      "Feeling: I was very happy because...",
      "Learning: I learned that friends are important"
    ],
    examplesKo: [
      "2025년 1월 8일 화요일 맑음",
      "오늘 친구와 공원에 갔다.",
      "그네를 타고 술래잡기를 했다.",
      "친구와 노는 것이 정말 재미있었다.",
      "내일도 친구와 놀고 싶다.",
      "",
      "또 다른 예:",
      "오늘 학교에서 수학 시험을 봤다.",
      "조금 어려웠지만 열심히 풀었다.",
      "다음에는 더 잘 보고 싶다."
    ],
    commonMistakes: [
      "❌ Too short entries",
      "❌ Only facts, no feelings",
      "❌ Incomplete sentences"
    ],
    keyPoints: [
      "Include date and weather",
      "Write what happened and how you felt",
      "Be honest and specific",
      "Use complete sentences"
    ],
    keyPointsKo: [
      "날짜와 날씨를 먼저 써요",
      "있었던 일을 순서대로 써요",
      "느낀 점을 솔직하게 써요",
      "완전한 문장으로 써요",
      "구체적으로 자세히 써요"
    ],
    source: "2015 개정 교육과정 - 국어 2학년",
    lastVerified: "2025-01-08"
  },

  // ═══════════════════════════════════════════════════════════
  // ELEMENTARY GRADE 3: 문단과 독해 (Paragraphs & Reading Comprehension)
  // ═══════════════════════════════════════════════════════════

  // 11. Paragraph Structure (문단 구성)
  {
    id: "kor-elem-paragraph-structure",
    subject: "korean" as Subject,
    topic: "Paragraph Structure",
    topicKo: "문단 구성",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `A paragraph is a group of sentences about one main idea.

Structure:
1. Topic sentence - Main idea
2. Supporting sentences - Details and examples
3. Concluding sentence - Wrap up (optional)

Rules:
- Start new paragraph for new idea
- Indent first line
- Keep related ideas together`,
    contentKo: `문단은 하나의 중심 생각을 다루는 여러 문장의 모음이에요.

문단 구성:

1. 중심 문장
   - 문단의 핵심 내용을 담아요
   - 보통 문단의 처음이나 끝에 와요

2. 뒷받침 문장
   - 중심 문장을 자세히 설명해요
   - 예시, 이유, 근거를 들어요

3. 마무리 문장 (있어도 되고 없어도 돼요)
   - 문단을 정리해요

문단 쓰기 방법:
- 새로운 생각이 나오면 새 문단을 만들어요
- 문단 첫 문장은 한 칸 들여 써요
- 관련된 내용끼리 한 문단에 써요

좋은 문단의 조건:
- 하나의 중심 생각만 다뤄요
- 3-5개 문장 정도가 적당해요
- 문장들이 자연스럽게 이어져요`,
    examples: [
      "Topic: Dogs are loyal animals.",
      "Support: They stay with their owners for life.",
      "Support: They protect their family.",
      "Conclusion: That's why dogs are great pets."
    ],
    examplesKo: [
      "중심 문장: 개는 충성스러운 동물이다.",
      "뒷받침: 주인을 평생 지킨다.",
      "뒷받침: 가족을 보호한다.",
      "마무리: 그래서 개는 훌륭한 반려동물이다.",
      "",
      "또 다른 예:",
      "나는 축구를 정말 좋아한다. (중심 문장)",
      "친구들과 함께 뛰어다니는 것이 재미있다. (뒷받침)",
      "골을 넣었을 때 정말 기쁘다. (뒷받침)",
      "앞으로도 계속 축구를 하고 싶다. (마무리)"
    ],
    commonMistakes: [
      "❌ 한 문단에 여러 주제 섞기",
      "❌ 문장이 너무 많거나 적음",
      "❌ 들여쓰기 하지 않기"
    ],
    keyPoints: [
      "One main idea per paragraph",
      "Start with topic sentence",
      "Support with details",
      "Indent first line"
    ],
    keyPointsKo: [
      "문단 하나에 중심 생각 하나만",
      "중심 문장으로 시작해요",
      "뒷받침 문장으로 설명해요",
      "첫 줄은 한 칸 들여 써요",
      "관련된 내용끼리 모아요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // 12. Reading Comprehension (독해 기초)
  {
    id: "kor-elem-reading-comprehension",
    subject: "korean" as Subject,
    topic: "Reading Comprehension",
    topicKo: "독해 기초",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `Reading comprehension is understanding what you read.

Strategies:
1. Preview - Look at title and pictures
2. Predict - Guess what it's about
3. Read actively - Think while reading
4. Summarize - Retell main points

Question Types:
- Main idea: What is this mostly about?
- Details: What specific information?
- Inference: What can we guess?
- Vocabulary: What does this word mean?`,
    contentKo: `독해는 글을 읽고 내용을 이해하는 것이에요.

독해 방법:

1. 훑어보기
   - 제목과 그림을 먼저 봐요
   - 어떤 내용일지 생각해요

2. 예측하기
   - 무슨 이야기일지 상상해요
   - 궁금한 것을 떠올려요

3. 적극적으로 읽기
   - 생각하면서 읽어요
   - 중요한 부분에 줄 그어요
   - 모르는 단어는 표시해요

4. 정리하기
   - 중요한 내용을 다시 말해요
   - 누가, 언제, 어디서, 무엇을, 왜, 어떻게

독해 질문 유형:

1. 중심 내용 찾기
   - "이 글은 주로 무엇에 대한 글인가요?"

2. 세부 내용 찾기
   - "○○은 언제 일어났나요?"

3. 추론하기
   - "이 상황에서 주인공은 어떤 기분일까요?"

4. 어휘 이해
   - "이 문장에서 '○○'은 무슨 뜻인가요?"`,
    examples: [
      "Main idea: Finding the most important point",
      "Details: Who, what, when, where, why, how",
      "Inference: Reading between the lines",
      "Vocabulary: Understanding words in context"
    ],
    examplesKo: [
      "제목: '개미와 베짱이'",
      "예측: 아마 개미와 베짱이의 이야기일 거예요",
      "중심 내용: 부지런함의 중요성",
      "세부 내용: 개미는 여름에 일했고, 베짱이는 놀았어요",
      "추론: 베짱이는 겨울에 후회했을 거예요",
      "",
      "독해 연습 예:",
      "Q: 이 글의 주제는 무엇인가요?",
      "A: 부지런히 준비하는 것의 중요성입니다."
    ],
    commonMistakes: [
      "❌ 너무 빨리 읽기",
      "❌ 한 번만 읽고 그만두기",
      "❌ 중요한 부분 건너뛰기",
      "❌ 모르는 단어를 무시하기"
    ],
    keyPoints: [
      "Preview before reading",
      "Think while reading",
      "Find main idea and details",
      "Reread if needed"
    ],
    keyPointsKo: [
      "읽기 전에 제목과 그림을 먼저 봐요",
      "생각하면서 천천히 읽어요",
      "중심 내용과 세부 내용을 찾아요",
      "이해 안 되면 다시 읽어요",
      "중요한 부분에 줄을 그어요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // 13. Story Structure (이야기 구조)
  {
    id: "kor-elem-story-structure",
    subject: "korean" as Subject,
    topic: "Story Structure",
    topicKo: "이야기 구조",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `Stories have a clear structure with beginning, middle, and end.

Story Elements:
1. Characters - Who is in the story?
2. Setting - When and where?
3. Problem - What's wrong?
4. Events - What happens?
5. Solution - How is it solved?

Story Structure:
- Beginning: Introduce characters and setting
- Middle: Problem and events
- End: Solution and conclusion`,
    contentKo: `이야기는 처음-중간-끝의 구조를 가지고 있어요.

이야기 구성 요소:

1. 인물 (누가)
   - 주인공은 누구인가요?
   - 어떤 성격인가요?

2. 배경 (언제, 어디서)
   - 언제 일어난 일인가요?
   - 어디에서 일어났나요?

3. 사건 (무슨 일)
   - 어떤 문제가 생겼나요?
   - 어떤 일들이 일어났나요?

4. 해결 (어떻게)
   - 문제를 어떻게 해결했나요?
   - 결과는 어떻게 되었나요?

이야기 구조:

📖 처음 (시작)
- 인물을 소개해요
- 배경을 알려줘요
- 평화로운 상황

🎭 중간 (전개)
- 문제가 생겨요
- 여러 사건이 일어나요
- 긴장감이 높아져요

✨ 끝 (결말)
- 문제가 해결돼요
- 결론이 나와요
- 교훈이나 느낀 점`,
    examples: [
      "Beginning: Once upon a time, there was a girl named Cinderella...",
      "Middle: She wanted to go to the ball but couldn't...",
      "End: With the fairy's help, she went and met the prince."
    ],
    examplesKo: [
      "처음: 옛날 옛날에 착한 소녀 신데렐라가 살았어요.",
      "배경: 계모와 언니들과 함께 살았어요.",
      "문제: 무도회에 가고 싶지만 갈 수 없었어요.",
      "사건: 요정이 나타나 도와주었어요.",
      "해결: 왕자님을 만나 행복하게 살았어요.",
      "",
      "또 다른 예 (토끼와 거북이):",
      "처음: 토끼와 거북이가 경주를 하기로 했어요.",
      "중간: 토끼는 잠을 자고, 거북이는 계속 걸었어요.",
      "끝: 거북이가 이겼어요. 꾸준함이 중요해요."
    ],
    commonMistakes: [
      "❌ 처음부터 결말 말하기",
      "❌ 사건 순서 뒤섞기",
      "❌ 해결 없이 끝내기"
    ],
    keyPoints: [
      "Stories have beginning, middle, and end",
      "Include characters, setting, problem, solution",
      "Events should be in order",
      "End should solve the problem"
    ],
    keyPointsKo: [
      "이야기는 처음-중간-끝이 있어요",
      "인물, 배경, 사건, 해결을 포함해요",
      "사건은 순서대로 일어나요",
      "끝에는 문제가 해결돼요",
      "교훈이나 느낀 점이 있으면 좋아요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  },

  // 14. Basic Spelling Rules (맞춤법 기초)
  {
    id: "kor-elem-spelling-basics",
    subject: "korean" as Subject,
    topic: "Basic Spelling Rules",
    topicKo: "맞춤법 기초",
    gradeLevel: "3",
    schoolLevel: "elementary",
    content: `Korean spelling rules help us write correctly.

Common Rules:
1. 되/돼: 되 for most cases, 돼 = 되어
2. -ㄴ지/-은지: After vowel ㄴ지, after consonant 은지
3. 안/않: 안 (not) separate, 않 (part of verb)
4. -요 vs -아요/-어요: Learn verb endings

Tips:
- Check ending sounds
- Remember common words
- Practice writing`,
    contentKo: `맞춤법은 한글을 바르게 쓰는 규칙이에요.

자주 틀리는 맞춤법:

1. '되'와 '돼'
   - 기본: 되
   - '되어'를 줄이면: 돼
   - 예: 되다(O), 돼다(X)
   - 예: 돼요 = 되어요

2. '안'과 '않'
   - 안: 부정의 뜻 (따로 씀)
     → 안 가요, 안 먹어요
   - 않: 동사에 붙음
     → 가지 않아요, 먹지 않아요

3. '-던'과 '-든'
   - -던: 과거의 일
     → 먹던 음식
   - -든: 선택
     → 밥이든 빵이든

4. '이/가', '을/를', '은/는'
   - 받침 있으면: 이, 을, 은
   - 받침 없으면: 가, 를, 는
   - 예: 책이, 책을, 책은
   - 예: 공이, 공을, 공은 (받침 ㅇ)

맞춤법 공부 방법:
- 자주 틀리는 것을 적어둬요
- 소리 나는 대로가 아니라 규칙대로 써요
- 많이 읽고 많이 써요`,
    examples: [
      "되/돼: 되다(O), 돼요 = 되어요(O)",
      "안/않: 안 가요(separate), 가지 않아요(attached)",
      "-이/가: 책이, 공이 (after consonant ㄱ/ㅇ)",
      "-가: 사과가, 의자가 (after vowel)"
    ],
    examplesKo: [
      "되다 → 돼요 (되어요)",
      "안 먹어요 (따로) vs 먹지 않아요 (붙여서)",
      "책이 좋아요 (받침 O)",
      "사과가 맛있어요 (받침 X)",
      "먹던 빵 (과거) vs 빵이든 떡이든 (선택)",
      "",
      "자주 틀리는 예:",
      "❌ 돼다 → ✅ 되다",
      "❌ 되요 → ✅ 돼요 (되어요)",
      "❌ 않 가요 → ✅ 안 가요"
    ],
    commonMistakes: [
      "❌ 돼다 (should be 되다)",
      "❌ 되요 (should be 돼요)",
      "❌ 않 가요 (should be 안 가요)",
      "❌ 먹던지 (should be 먹든지 for choice)"
    ],
    keyPoints: [
      "되 is basic, 돼 = 되어",
      "안 is separate, 않 is attached",
      "Particles change based on final consonant",
      "Practice common patterns"
    ],
    keyPointsKo: [
      "소리 나는 대로가 아니라 규칙대로 써요",
      "되/돼, 안/않 구분해요",
      "조사는 받침에 따라 달라져요",
      "자주 쓰는 단어는 외워요",
      "모를 때는 사전을 찾아요"
    ],
    source: "2015 개정 교육과정 - 국어 3학년",
    lastVerified: "2025-01-08"
  }
];
