export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

export interface KeyPoint {
  type: string;
  title: string;
  content: string;
}

export interface Sentence {
  original: string;
  analysis: string;
  translation: string;
}

export interface Paragraph {
  english: string;
  translation: string;
}

export interface AnalysisResult {
  paragraphs: Paragraph[];
  summary: {
    english: string;
    chinese: string;
  };
  difficulty: string;
  vocabulary: VocabularyItem[];
  keyPoints: KeyPoint[];
  sentences: Sentence[];
}

export interface StoredArticle {
  originalText: string;
  analysis: AnalysisResult;
  createdAt: string;
}
