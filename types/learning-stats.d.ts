export interface SubjectStats {
  hasData: boolean;
  weeklyHours: number;
  weeklyGoal: number;
  gradeLevel?: string;
  cefrLevel?: string;
  skills?: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  completedUnits?: number;
  totalUnits?: number;
  currentTopic?: string;
}

export interface LearningStats {
  english?: SubjectStats;
  math?: SubjectStats;
  science?: SubjectStats;
  social?: SubjectStats;
}
