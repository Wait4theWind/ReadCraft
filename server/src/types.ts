import { z } from 'zod';

export const VocabularyItemSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
  meaning: z.string(),
  example: z.string(),
});

export const KeyPointSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string(),
});

export const SentenceSchema = z.object({
  original: z.string(),
  analysis: z.string(),
  translation: z.string(),
});

export const ParagraphSchema = z.object({
  english: z.string(),
  translation: z.string(),
});

export const AnalysisResultSchema = z.object({
  paragraphs: z.array(ParagraphSchema),
  summary: z.object({
    english: z.string(),
    chinese: z.string(),
  }),
  difficulty: z.string(),
  vocabulary: z.array(VocabularyItemSchema),
  keyPoints: z.array(KeyPointSchema),
  sentences: z.array(SentenceSchema),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
