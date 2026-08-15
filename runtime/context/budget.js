import { readJson, exists } from '../core/io.js';

const BUDGET_TIERS = {
  tiny: { maxTokens: 1000, levels: [0, 1] },
  small: { maxTokens: 2500, levels: [0, 1, 2] },
  medium: { maxTokens: 5000, levels: [0, 1, 2, 3] },
  large: { maxTokens: 10000, levels: [0, 1, 2, 3, 4] },
  'book-scale': { maxTokens: 20000, levels: [0, 1, 2, 3, 4, 5] }
};

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function truncateToBudget(entries, maxTokens) {
  let total = 0;
  const kept = [];
  for (const entry of entries) {
    const tokens = estimateTokens(entry.content || entry.text || JSON.stringify(entry));
    if (total + tokens > maxTokens) break;
    kept.push(entry);
    total += tokens;
  }
  return { entries: kept, tokensUsed: total, truncated: kept.length < entries.length };
}

export function applyBudget(packet, budgetTier = 'medium') {
  const tier = BUDGET_TIERS[budgetTier] || BUDGET_TIERS.medium;
  const result = truncateToBudget(packet.entries || [], tier.maxTokens);
  return {
    ...packet,
    entries: result.entries,
    budget: {
      tier: budgetTier,
      maxTokens: tier.maxTokens,
      tokensUsed: result.tokensUsed,
      truncated: result.truncated,
      levels: tier.levels
    }
  };
}

export function validateBudget(packet) {
  const tokens = packet.budget?.tokensUsed || 0;
  const maxTokens = packet.budget?.maxTokens || 5000;
  return {
    within_budget: tokens <= maxTokens,
    tokens_used: tokens,
    tokens_max: maxTokens,
    utilization: (tokens / maxTokens * 100).toFixed(1) + '%'
  };
}
