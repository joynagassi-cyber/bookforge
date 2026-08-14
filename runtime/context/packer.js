import { search } from '../retrieval.js';
import { route } from './router.js';

export async function pack(project, opts = {}) {
  const decision = route(project, opts);
  const catalogs = [...decision.required, ...decision.optional];
  const entries = [];
  for (const c of catalogs) {
    const found = await search(project, opts.task || '', { catalog: c, limit: opts.perCatalog || 8 });
    entries.push(...found.map(x => ({
      ...x,
      retrieval_role: decision.required.includes(c) ? 'required' : 'optional'
    })));
  }
  const seen = new Set();
  const unique = entries.filter(x => !seen.has(x.id) && (seen.add(x.id), true));
  return {
    version: '0.5.0',
    task_id: `ctx-${Date.now()}`,
    task_type: decision.task_type,
    agent: opts.agent || null,
    workflow: opts.workflow || null,
    scale: decision.scale,
    route: decision,
    retrieval: {
      mode: 'deterministic-first',
      levels: [0, 1, 2, 3, 4, 5]
    },
    entries: unique.slice(0, opts.maxEntries || 60),
    token_budget: opts.budget || 5000,
    metadata: {
      generated_at: new Date().toISOString(),
      required_catalogs: decision.required.length,
      optional_catalogs: decision.optional.length,
      total_entries: unique.length
    }
  };
}

export function estimateTokens(packet) {
  let total = 0;
  for (const entry of packet.entries || []) {
    total += (entry.content?.length || 0) / 4;
  }
  return Math.min(total, packet.token_budget || 5000);
}

export function truncatePacket(packet, maxTokens) {
  if (!maxTokens || packet.entries.length === 0) return packet;
  let currentTokens = 0;
  const kept = [];
  for (const entry of packet.entries) {
    const entryTokens = (entry.content?.length || 0) / 4;
    if (currentTokens + entryTokens > maxTokens) break;
    kept.push(entry);
    currentTokens += entryTokens;
  }
  return { ...packet, entries: kept, metadata: { ...packet.metadata, truncated: true, kept_entries: kept.length } };
}
