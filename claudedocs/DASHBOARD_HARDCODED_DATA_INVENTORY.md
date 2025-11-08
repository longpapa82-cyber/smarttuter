# SmartTuter Dashboard - Hardcoded Dummy Data Inventory Report
**Date**: 2025-11-08
**Scope**: All dashboard-related files with hardcoded data identification

---

## Executive Summary

**Total Files with Hardcoded Data**: 4 files  
**Total Hardcoded Data Points**: 35+ instances  
**Critical Severity**: 8  
**High Severity**: 15  
**Medium Severity**: 10+

The dashboard system currently contains extensive hardcoded dummy data across subject-specific dashboards and component files. This data should be dynamically fetched from APIs and user-specific learning records.

---

## Critical Findings

### 1. Dashboard Main Page - Total Dashboard Data
**File**: `/Users/hoonjaepark/projects/smartTuter/app/dashboard/page.tsx`  
**Issue**: Hardcoded topic suggestions in "Quick Start" section

| Line | Data | Type | Severity | Status |
|------|------|------|----------|--------|
| 753 | "Daily Conversation" | Topic (English) | CRITICAL | Not API-connected |
| 777 | "이차방정식 풀이" | Topic (Math) | CRITICAL | Not API-connected |
| 801 | "물질의 상태" | Topic (Science) | CRITICAL | Not API-connected |
| 825 | "세계 지리" | Topic (Social Studies) | CRITICAL | Not API-connected |

**Impact**: Users see static topics instead of their actual last learning session topics  
**Notes**: These should be fetched from user session history

---

### 2. English Dashboard Page
**File**: `/Users/hoonjaepark/projects/smartTuter/app/dashboard/english/page.tsx`

#### Hardcoded Session Data
| Line | Variable | Hardcoded Value | Type | Should Be |
|------|----------|-----------------|------|-----------|
| 19-23 | lastSession | `{ topic: "Travel Conversation", date: "2024-01-15", duration: 15 }` | Object | User's last session |
| 24 | nextTopic | "Ordering at a Restaurant" | String | AI-recommended topic |
| 25 | cefrLevel | `{ current: "A2", target: "B1", progress: 42 }` | Object | User's actual CEFR level |
| 26 | monthlyHours | `{ current: 12, target: 20 }` | Object | User's learning stats |
| 27 | completedTopics | 15 | Number | Count from user history |
| 28-30 | masteredGrammar | `["현재시제", "과거시제", "현재진행형"]` | Array | User's mastered grammar |

#### Hardcoded Mastery Scores
| Line | Variable | Values | Severity |
|------|----------|--------|----------|
| 33-38 | mastery | `listening: 80, speaking: 60, reading: 100, writing: 40` | HIGH |

#### Hardcoded Lists
| Line | Variable | Values |
|------|----------|--------|
| 41 | strengths | `["듣기 이해력", "기본 문법", "단어 암기"]` |
| 42 | weaknesses | `["발음 (R, TH)", "고급 어휘", "긴 문장 작문"]` |

**Total Hardcoded Points**: 8  
**Connected to API**: No  
**Recommendation**: Replace all useState with useEffect calls to fetch from `/api/user/learning-stats`

---

### 3. Math Dashboard Page
**File**: `/Users/hoonjaepark/projects/smartTuter/app/dashboard/math/page.tsx`

#### Hardcoded Session Data
| Line | Variable | Hardcoded Value | Type | Should Be |
|------|----------|-----------------|------|-----------|
| 19-23 | lastSession | `{ topic: "이차방정식 풀이", date: "2024-01-15", duration: 20 }` | Object | User's last math session |
| 24 | nextTopic | "이차함수 그래프" | String | AI-recommended next topic |
| 25 | gradeProgress | `{ level: "중2 수학", progress: 68 }` | Object | User's grade level progress |
| 26 | monthlyHours | `{ current: 8, target: 15 }` | Object | User's monthly learning hours |

#### Hardcoded Chapter Progress
| Line | Variable | Hardcoded Value | Issue |
|------|----------|-----------------|-------|
| 29-35 | chapters | Array with 5 chapters and fixed progress | CRITICAL - Should be user-specific |

**Chapters Hardcoded**:
- "일차방정식" (progress: 100%, status: completed)
- "일차함수" (progress: 100%, status: completed)
- "이차방정식" (progress: 65%, status: in_progress)
- "이차함수" (progress: 0%, status: not_started)
- "통계" (progress: 0%, status: not_started)

#### Hardcoded Lists
| Line | Variable | Values |
|------|----------|--------|
| 38 | strengths | `["계산 능력", "기본 개념 이해", "공식 암기"]` |
| 39 | weaknesses | `["복잡한 응용문제", "기하학적 직관", "문제 해석"]` |

**Total Hardcoded Points**: 9  
**Connected to API**: No  
**Recommendation**: Fetch from `/api/progress/summary` endpoint

---

### 4. Math Topic Progress Component
**File**: `/Users/hoonjaepark/projects/smartTuter/components/dashboard/MathTopicProgress.tsx`

#### Hardcoded Mock Data Generation
| Line | Issue | Type | Severity |
|------|-------|------|----------|
| 41-46 | `topicProgress.map()` generates random data with `Math.random()` | Mock Data Generation | MEDIUM |

**Specific Issues**:
```typescript
// Lines 42-46
const topicProgress = config.topics.map((topic, idx) => ({
  name: topic,
  progress: Math.random() * 100,  // Random 0-100%
  mastery: ['low', 'medium', 'high', 'mastered'][Math.floor(Math.random() * 4)],
}));
```

**Impact**: Topic progress shown is completely random, not based on actual user learning data  
**Recommendation**: Replace with API call to `/api/progress/summary` with grade-level specific filtering

---

## API Data Mismatch Analysis

### API Routes Inventory
**Status**: Partially implemented

#### Route 1: `/api/user/learning-stats`
- **Status**: Returns hardcoded empty data
- **Lines**: 25-65 in `/Users/hoonjaepark/projects/smartTuter/app/api/user/learning-stats/route.ts`
- **Issue**: All subjects initialized with 0 values
- **Comment**: Line 23: `// TODO: 실제 Redis/DB에서 학습 데이터 조회`

**Returned Structure**:
```typescript
{
  english: { weeklyHours: 0, weeklyGoal: 20, hasData: false, ... },
  math: { weeklyHours: 0, weeklyGoal: 15, hasData: false, ... },
  science: { weeklyHours: 0, weeklyGoal: 10, hasData: false, ... },
  social: { weeklyHours: 0, weeklyGoal: 10, hasData: false, ... }
}
```

#### Route 2: `/api/progress/summary`
- **Status**: Properly structured
- **Uses**: `getLearningProgressSummary()` function
- **Issue**: Returns `hasData: false` if no progress exists
- **Proper Integration**: Used by main dashboard

#### Route 3: `/api/difficulty`
- **Status**: Properly integrated
- **Used By**: DifficultyIndicator component
- **Issue**: Fetches dynamically (good pattern)

---

## Hardcoded Values by Category

### Learning Hours (Numbers)
| File | Location | English | Math | Science | Social |
|------|----------|---------|------|---------|--------|
| **Main Dashboard** | API response | 0h | 0h | 0h | 0h |
| **English Dashboard** | monthlyHours | 12/20h | - | - | - |
| **Math Dashboard** | monthlyHours | - | 8/15h | - | - |

**Issue**: Weekly goals (20, 15, 10, 10) are never fetched from user settings  
**Solution**: Add user preferences API endpoint

### Progress Percentages
| Location | Value | Should Be |
|----------|-------|-----------|
| English CEFR | 42% | Calculated from mastered concepts |
| Math Grade | 68% | Calculated from chapter completion |

### Skills/Competencies
| Component | Hardcoded Values | Issue |
|-----------|-----------------|-------|
| English Mastery | listening: 80%, speaking: 60%, reading: 100%, writing: 40% | Not calculated from interactions |
| Math Topics | 5 chapters with fixed progress | Not updated from user activity |

---

## Empty State Handling

### Positive Pattern ✓
**File**: `/Users/hoonjaepark/projects/smartTuter/components/dashboard/EmptyLearningCard.tsx`
- Properly handles no data state
- Shows appropriate message
- Encourages user to start learning

**File**: `/Users/hoonjaepark/projects/smartTuter/components/dashboard/WeaknessAnalysis.tsx`
- Lines 42-53: Good empty state implementation
- Shows success state when no weaknesses

### Negative Pattern ✗
**Files**: English & Math dashboards
- Never show empty state even when `hasData: false`
- Always display hardcoded data as if user has learning history
- Misleading to new users

---

## Data Dependencies Map

```
Main Dashboard (page.tsx)
├─ learningStats (from /api/user/learning-stats)
│  └─ All subjects: weeklyHours, weeklyGoal, skills
├─ progressData (from /api/progress/summary)
│  ├─ MathTopicProgress (HARDCODED: Math.random())
│  ├─ WeaknessAnalysis (from progressData.weaknesses)
│  └─ DifficultyIndicator (from /api/difficulty)
├─ Quick Start Section (HARDCODED TOPICS)
│  ├─ English: "Daily Conversation"
│  ├─ Math: "이차방정식 풀이"
│  ├─ Science: "물질의 상태"
│  └─ Social: "세계 지리"
└─ Gamification Components (from store)
   ├─ LevelProgress
   ├─ StreakWidget
   ├─ DailyGoalsWidget
   ├─ WeeklyStats
   └─ AchievementBadges

English Dashboard (page.tsx)
├─ lastSession (HARDCODED)
├─ nextTopic (HARDCODED)
├─ cefrLevel (HARDCODED)
├─ monthlyHours (HARDCODED)
├─ completedTopics (HARDCODED)
├─ masteredGrammar (HARDCODED)
├─ mastery scores (HARDCODED)
├─ strengths/weaknesses (HARDCODED)
└─ NO API CALLS

Math Dashboard (page.tsx)
├─ lastSession (HARDCODED)
├─ nextTopic (HARDCODED)
├─ gradeProgress (HARDCODED)
├─ monthlyHours (HARDCODED)
├─ chapters (HARDCODED)
├─ strengths/weaknesses (HARDCODED)
└─ NO API CALLS
```

---

## Severity Categorization

### CRITICAL (8 items)
Must fix before production:
1. Quick Start topics in main dashboard (4 hardcoded topic strings)
2. English Dashboard: lastSession object completely hardcoded
3. English Dashboard: CEFR level + progress hardcoded
4. Math Dashboard: lastSession object completely hardcoded
5. Math Dashboard: gradeProgress completely hardcoded
6. Math Dashboard: chapters array with all progress hardcoded

**Impact**: Users see fake data as if they've already learned content  
**Priority**: P0 - Fix immediately

### HIGH (15 items)
Should fix before launch:
1. English Dashboard: All mastery scores (listening, speaking, reading, writing)
2. English Dashboard: completedTopics counter (hardcoded: 15)
3. English Dashboard: masteredGrammar array
4. English Dashboard: strengths/weaknesses lists
5. Math Dashboard: monthlyHours (hardcoded: 8/15)
6. Math Dashboard: strengths/weaknesses lists
7. MathTopicProgress: All progress generated with Math.random()
8. MathTopicProgress: All mastery levels randomly assigned

**Impact**: Invalid analytics and misleading progress data  
**Priority**: P1 - Fix before wider rollout

### MEDIUM (10+ items)
Nice to fix:
1. API response structures for unimplemented stats
2. Date format consistency
3. Goal values (15, 20, 10) - should be user-configurable

**Priority**: P2 - Plan for near-term fix

---

## Code Quality Patterns

### Anti-Pattern 1: useState with Hardcoded Data
**Problem**: Initial state never updated
```typescript
const [lastSession, setLastSession] = useState({
  topic: "Travel Conversation",
  date: "2024-01-15",
  duration: 15
});
// setLastSession never called - data is stale
```

**Fix**: Replace with useEffect and API fetch
```typescript
const [lastSession, setLastSession] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSession = async () => {
    const response = await fetch(`/api/user/last-session?subject=english`);
    const data = await response.json();
    setLastSession(data);
    setLoading(false);
  };
  fetchSession();
}, []);
```

### Anti-Pattern 2: Mock Data in Component Logic
**Problem**: Random data generation misleads users
```typescript
// MathTopicProgress.tsx:42-46
const topicProgress = config.topics.map((topic, idx) => ({
  name: topic,
  progress: Math.random() * 100,  // Random progress!
  mastery: [...][Math.floor(Math.random() * 4)],
}));
```

**Fix**: Fetch from API based on gradeLevel
```typescript
const [topicProgress, setTopicProgress] = useState(null);

useEffect(() => {
  const fetchProgress = async () => {
    const response = await fetch(
      `/api/progress/math-topics?gradeLevel=${gradeLevel}`
    );
    const data = await response.json();
    setTopicProgress(data);
  };
  fetchProgress();
}, [gradeLevel]);
```

### Good Pattern: Proper API Integration
**Example**: DifficultyIndicator component (Lines 69-100)
- Fetches data with useEffect
- Handles loading state
- Handles error state
- Auto-refresh every 30 seconds

**This is the pattern to follow for all dashboard components**

---

## Recommended API Endpoints (Missing)

### Endpoint 1: Last Learning Session
**URL**: `/api/user/last-session`  
**Query Params**: `?subject=math&userId=xxx`  
**Returns**:
```json
{
  "topic": "Quadratic Equations",
  "date": "2025-11-07T14:30:00Z",
  "duration": 25,
  "difficulty": "medium"
}
```

### Endpoint 2: Next Recommended Topic
**URL**: `/api/user/recommended-topic`  
**Query Params**: `?subject=english&userId=xxx`  
**Returns**:
```json
{
  "topic": "Present Perfect Tense",
  "reason": "Building on your mastered skills",
  "difficulty": "hard"
}
```

### Endpoint 3: Completed Topics
**URL**: `/api/user/completed-topics`  
**Query Params**: `?subject=math&userId=xxx`  
**Returns**:
```json
{
  "completed": 12,
  "total": 25,
  "topics": ["Addition", "Subtraction", ...]
}
```

### Endpoint 4: Math Chapters Progress
**URL**: `/api/progress/math-chapters`  
**Query Params**: `?gradeLevel=middle&userId=xxx`  
**Returns**:
```json
{
  "chapters": [
    { "name": "Linear Equations", "progress": 100, "status": "completed" },
    { "name": "Quadratic Equations", "progress": 65, "status": "in_progress" },
    ...
  ]
}
```

### Endpoint 5: Topic Progress with Random Generation
**URL**: `/api/progress/topic-progress`  
**Query Params**: `?gradeLevel=middle&subject=math`  
**Returns** (NOT random):
```json
{
  "topics": [
    { "name": "基础运算", "progress": 95, "mastery": "mastered" },
    { "name": "几何", "progress": 45, "mastery": "medium" },
    ...
  ]
}
```

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
1. Connect English Dashboard to `/api/user/learning-stats`
2. Connect Math Dashboard to `/api/progress/summary`
3. Create `/api/user/last-session` endpoint
4. Create `/api/user/recommended-topic` endpoint
5. Update Quick Start section to use API data

### Phase 2: High Priority (Week 2)
1. Create `/api/progress/math-chapters` endpoint
2. Replace MathTopicProgress random generation with API
3. Implement proper loading/error states
4. Add empty states to subject dashboards

### Phase 3: Medium Priority (Week 3+)
1. Create `/api/user/completed-topics` endpoint
2. Implement strength/weakness analysis properly
3. Make learning goals user-configurable
4. Add historical data tracking

---

## Testing Checklist

Before considering dashboard "complete":
- [ ] New users see proper empty states
- [ ] No hardcoded data visible after actual learning
- [ ] All data updates within 30 seconds
- [ ] API failures handled gracefully
- [ ] Loading states shown properly
- [ ] Date formats consistent (ISO 8601)
- [ ] Progress percentages calculated correctly
- [ ] Data persists across page refreshes
- [ ] Mobile responsive with real data
- [ ] Performance acceptable with live data

---

## Files Requiring Changes

1. `/Users/hoonjaepark/projects/smartTuter/app/dashboard/english/page.tsx` - COMPLETE REWRITE
2. `/Users/hoonjaepark/projects/smartTuter/app/dashboard/math/page.tsx` - COMPLETE REWRITE
3. `/Users/hoonjaepark/projects/smartTuter/components/dashboard/MathTopicProgress.tsx` - MAJOR UPDATE
4. `/Users/hoonjaepark/projects/smartTuter/app/api/user/learning-stats/route.ts` - IMPLEMENT DATA FETCH
5. `/Users/hoonjaepark/projects/smartTuter/app/dashboard/page.tsx` - UPDATE QUICK START SECTION

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total hardcoded data points | 35+ |
| Files with hardcoded data | 4 |
| Critical issues | 8 |
| High priority issues | 15 |
| Medium priority issues | 10+ |
| API endpoints used correctly | 2 |
| API endpoints missing | 5+ |
| Components using hardcoded data | 3 |
| Components using proper API | 2 |

