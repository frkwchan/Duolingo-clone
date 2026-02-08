export interface LessonQuestion {
  id: number;
  question: string; // The phrase in target language or prompt
  translation: string; // The english meaning
  options: string[]; // Multiple choice options (English translations)
  correctAnswerIndex: number;
  imagePrompt: string; // Description for Gemini Image Gen
}

export interface UserState {
  hearts: number;
  xp: number;
  streak: number;
}

export enum AppScreen {
  HOME = 'HOME',
  LESSON_LOADING = 'LESSON_LOADING',
  LESSON_ACTIVE = 'LESSON_ACTIVE',
  LESSON_COMPLETE = 'LESSON_COMPLETE',
}

export type ImageSize = '1K' | '2K' | '4K';
