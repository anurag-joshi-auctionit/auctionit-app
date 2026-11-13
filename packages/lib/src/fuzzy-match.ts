import { ratio, token_sort_ratio } from "fuzzball";

/** Default score at or above which a single best match is considered confident. */
export const FUZZY_MATCH_CONFIDENT_THRESHOLD = 90;

/** Max suggestion ids returned for ambiguous matches. */
export const FUZZY_MATCH_TOP_K = 3;

const SCORE_OPTS = { full_process: false as const };

/**
 * Normalize a label for fuzzy comparison:
 * lowercase, NBSP/unicode spaces → ASCII, strip light punctuation, collapse whitespace.
 */
export function normalizeFuzzyText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u00a0\u1680\u2000-\u200b\u202f\u205f\u3000]/g, " ")
    .replace(/[.,;:/\\|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * FuzzyWuzzy-style score: max(simple ratio, token_sort_ratio) after normalize.
 * Token sort treats word-order flips (e.g. "plastic drum" / "drum plastic") as equal.
 */
export function fuzzyMatchScore(a: string, b: string): number {
  const left = normalizeFuzzyText(a);
  const right = normalizeFuzzyText(b);
  if (!left.length || !right.length) return 0;
  if (left === right) return 100;
  const simple = ratio(left, right, SCORE_OPTS);
  const tokenSort = token_sort_ratio(left, right, SCORE_OPTS);
  return Math.max(simple, tokenSort);
}

export type FuzzyCorpusEntry = {
  /** Already-normalized key used for exact lookup / scoring. */
  normalizedName: string;
  itemId: number;
};

export type FuzzyMatchResult = {
  /** 1 = confident single pick; 2 = ambiguous / pick required. */
  fuzzyCandidate: 1 | 2;
  score: number;
  suggestedItemIds: number[];
  /** Pre-selected when fuzzyCandidate === 1. */
  selectedItemId: number | null;
};

/**
 * Match a query string against a corpus of normalized name → itemId entries.
 * Caller should build corpus with history-first, items-second (no overwrite of history).
 */
export function matchAgainstCorpus(
  query: string,
  corpus: ReadonlyArray<FuzzyCorpusEntry>,
  options?: {
    confidentThreshold?: number;
    topK?: number;
  },
): FuzzyMatchResult {
  const confidentThreshold =
    options?.confidentThreshold ?? FUZZY_MATCH_CONFIDENT_THRESHOLD;
  const topK = options?.topK ?? FUZZY_MATCH_TOP_K;
  const normalizedQuery = normalizeFuzzyText(query);

  if (!normalizedQuery || corpus.length === 0) {
    return {
      fuzzyCandidate: 2,
      score: 0,
      suggestedItemIds: [],
      selectedItemId: null,
    };
  }

  const exact = corpus.find((c) => c.normalizedName === normalizedQuery);
  if (exact) {
    return {
      fuzzyCandidate: 1,
      score: 100,
      suggestedItemIds: [exact.itemId],
      selectedItemId: exact.itemId,
    };
  }

  const scored: { itemId: number; score: number }[] = [];
  const bestByItem = new Map<number, number>();

  for (const entry of corpus) {
    const score = fuzzyMatchScore(normalizedQuery, entry.normalizedName);
    const prev = bestByItem.get(entry.itemId);
    if (prev == null || score > prev) {
      bestByItem.set(entry.itemId, score);
    }
  }

  for (const [itemId, score] of bestByItem) {
    scored.push({ itemId, score });
  }
  scored.sort((a, b) => b.score - a.score || a.itemId - b.itemId);

  const top = scored.slice(0, topK);
  const best = top[0];
  if (!best || best.score <= 0) {
    return {
      fuzzyCandidate: 2,
      score: 0,
      suggestedItemIds: [],
      selectedItemId: null,
    };
  }

  if (best.score >= confidentThreshold) {
    return {
      fuzzyCandidate: 1,
      score: best.score,
      suggestedItemIds: [best.itemId],
      selectedItemId: best.itemId,
    };
  }

  return {
    fuzzyCandidate: 2,
    score: best.score,
    suggestedItemIds: top.map((t) => t.itemId),
    selectedItemId: null,
  };
}
