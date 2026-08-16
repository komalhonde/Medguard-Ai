import { RAGDocumentChunk } from '../types/clinical';
import { CLINICAL_GUIDELINES } from '../data/clinicalGuidelines';

export interface RAGQueryResult {
  query: string;
  totalFound: number;
  retrievedChunks: RAGDocumentChunk[];
  searchTimeMs: number;
}

/**
 * Clinical synonym dictionary for doctor terms
 */
const CLINICAL_SYNONYMS: Record<string, string[]> = {
  heart: ['cardiac', 'myocardial', 'infarction', 'chest pain', 'troponin', 'ecg', 'acs', 'angina'],
  attack: ['infarction', 'myocardial', 'troponin', 'ischemic', 'stroke'],
  cardiac: ['heart', 'chest pain', 'troponin', 'ecg', 'myocardial'],
  sugar: ['glucose', 'dka', 'diabetic', 'ketoacidosis', 'insulin', 'potassium'],
  diabetes: ['glucose', 'dka', 'diabetic', 'ketoacidosis', 'insulin'],
  diabetic: ['glucose', 'dka', 'ketoacidosis', 'insulin'],
  dka: ['diabetic', 'ketoacidosis', 'glucose', 'insulin', 'potassium', 'acidosis'],
  bp: ['hypertension', 'blood pressure', 'nicardipine', 'labetalol', 'hypotension', 'map'],
  pressure: ['blood pressure', 'hypertension', 'hypotension', 'map', 'systolic'],
  hypertension: ['blood pressure', 'crisis', 'nicardipine', 'labetalol', 'emergency', 'bp'],
  sepsis: ['infection', 'lactate', 'hypotension', 'fever', 'tachycardia', 'shock', 'blood cultures'],
  infection: ['sepsis', 'septic', 'fever', 'lactate', 'antibiotic', 'antimicrobial'],
  fever: ['infection', 'sepsis', 'temperature', 'antimicrobial'],
  breath: ['respiratory', 'copd', 'asthma', 'dyspnea', 'wheezing', 'oxygen', 'bipap'],
  breathing: ['respiratory', 'copd', 'asthma', 'dyspnea', 'wheezing', 'oxygen'],
  asthma: ['copd', 'albuterol', 'ipratropium', 'dyspnea', 'wheezing', 'respiratory'],
  copd: ['asthma', 'albuterol', 'dyspnea', 'bipap', 'oxygen', 'hypercapnia'],
  stroke: ['alteplase', 'thrombolysis', 'fast', 'paralysis', 'brain', 'facial droop', 'speech'],
  paralysis: ['stroke', 'ischemic', 'alteplase', 'facial droop'],
  brain: ['stroke', 'head ct', 'alteplase', 'thrombolysis', 'gcs'],
  pain: ['chest pain', 'angina', 'distress', 'troponin'],
  triage: ['esi', 'news2', 'qsofa', 'resuscitation', 'urgent', 'priority']
};

/**
 * Tokenizes text for semantic and lexical vector scoring
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

/**
 * Computes semantic relevance score between query and guideline chunk
 */
function computeRelevanceScore(query: string, queryTokens: string[], chunk: RAGDocumentChunk): number {
  if (queryTokens.length === 0) return 0.5;

  const normalizedQuery = query.toLowerCase().trim();
  const fullContent = `${chunk.guidelineTitle} ${chunk.sectionTitle} ${chunk.content} ${chunk.category} ${chunk.keywords.join(' ')} ${chunk.authoringBody}`.toLowerCase();

  // Direct substring bonus
  let directMatchBonus = 0;
  if (fullContent.includes(normalizedQuery)) {
    directMatchBonus += 0.8;
  }

  let matchScore = 0;
  for (const token of queryTokens) {
    // Direct token hit in title/section/keywords
    if (chunk.guidelineTitle.toLowerCase().includes(token)) matchScore += 0.4;
    if (chunk.sectionTitle.toLowerCase().includes(token)) matchScore += 0.3;
    if (chunk.keywords.some(k => k.toLowerCase().includes(token))) matchScore += 0.4;
    if (chunk.content.toLowerCase().includes(token)) matchScore += 0.2;
    if (chunk.category.toLowerCase().includes(token)) matchScore += 0.2;

    // Expand clinical synonyms
    const synonyms = CLINICAL_SYNONYMS[token] || [];
    for (const syn of synonyms) {
      if (fullContent.includes(syn)) {
        matchScore += 0.25;
      }
    }
  }

  return Math.min(1.0, directMatchBonus + matchScore);
}

/**
 * Vector / Semantic RAG search across verified clinical protocols
 */
export function searchClinicalGuidelines(query: string, topK: number = 8, categoryFilter?: string): RAGQueryResult {
  const startTime = performance.now();
  const trimmedQuery = query.trim();
  const queryTokens = tokenize(trimmedQuery);

  let candidateChunks = [...CLINICAL_GUIDELINES];

  if (categoryFilter && categoryFilter !== 'ALL') {
    candidateChunks = candidateChunks.filter(c => c.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }

  // If query is empty, return all category chunks
  if (!trimmedQuery) {
    return {
      query: '',
      totalFound: candidateChunks.length,
      retrievedChunks: candidateChunks.slice(0, topK),
      searchTimeMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  const scoredChunks = candidateChunks
    .map(chunk => {
      const score = computeRelevanceScore(trimmedQuery, queryTokens, chunk);
      return {
        ...chunk,
        relevanceScore: score
      };
    })
    .filter(chunk => (chunk.relevanceScore || 0) > 0.05);

  scoredChunks.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const topResults = (scoredChunks.length > 0 ? scoredChunks : candidateChunks).slice(0, topK);
  const searchTimeMs = Number((performance.now() - startTime).toFixed(2));

  return {
    query,
    totalFound: topResults.length,
    retrievedChunks: topResults,
    searchTimeMs
  };
}
