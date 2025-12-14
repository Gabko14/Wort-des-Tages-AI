export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface EnrichedWord {
  wordId: number;
  definition?: string;
  exampleSentence?: string;
  quiz?: Quiz;
}

export interface AiEnrichResponse {
  enrichedWords?: EnrichedWord[];
}
