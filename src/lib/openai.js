// lib/openai.js
// A single OpenAI client, set up once and imported everywhere an AI feature
// needs it (useAI.js is the only place that should import this directly —
// every component goes through useAI, never through this file).
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Catches BOTH "no key set" and the extremely common case of the .env.example
// placeholder being left in place unmodified — a plain "is it truthy" check
// would silently treat "sk-your-key-here" as a valid key and only fail once
// OpenAI itself rejects the request, which is a much more confusing error to
// debug than catching it here, up front.
export const isAIConfigured = Boolean(apiKey) && !apiKey.includes('your-key-here');

if (!isAIConfigured && import.meta.env.DEV) {
  console.warn(
    '[AI] VITE_OPENAI_API_KEY is missing or still the placeholder value. ' +
      'Copy .env.example to .env and paste in a real key to use AI features.'
  );
}

const openai = new OpenAI({
  apiKey: apiKey || 'missing-key',
  // Required for a frontend-only app calling OpenAI directly with no backend
  // proxy, per the assignment's architecture (no backend allowed).
  dangerouslyAllowBrowser: true,
});

export const AI_MODEL = 'gpt-4o-mini';
export const AI_MAX_TOKENS = 300;

export default openai;
