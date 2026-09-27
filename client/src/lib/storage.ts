import type { StoredArticle } from '../types/analysis';

const KEY = 'readcraft:latest';

export function saveLatest(article: StoredArticle): void {
  localStorage.setItem(KEY, JSON.stringify(article));
}

export function loadLatest(): StoredArticle | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredArticle;
  } catch {
    return null;
  }
}
