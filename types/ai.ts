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
  exampleSentences?: string[];
  quiz?: Quiz;
  stattXSagY?: string;
  collocations?: string[];
  register?: string;
  // Legacy field for backward compatibility with cached data
  exampleSentence?: string;
}

export interface AiEnrichResponse {
  enrichedWords?: EnrichedWord[];
}
