import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, bfPath, mkdir, exists } from '../core/io.js';
import { create as jsonl } from '../providers/jsonl.js';
import { create as neo4j } from '../providers/neo4j.js';

function eventFiles(project) {
  const d = bfPath(project, 'events');
  if (!exists(d)) return [];
  return fs.readdirSync(d).filter(x => x.endsWith('.json')).sort().map(x => path.join(d, x));
}

export async function sync(project, { provider = null, dryRun = false } = {}) {
  let cfg = { provider: 'jsonl' };
  const p = bfPath(project, 'graph', 'provider.json');
  if (exists(p)) cfg = readJson(p);
  const name = provider || cfg.provider || 'jsonl';
  const sink = name === 'neo4j' ? await neo4j(project, cfg) : jsonl(project);
  const marker = bfPath(project, 'graph', 'sync-state.json');
  const state = exists(marker) ? readJson(marker) : { events: {} };
  let applied = 0, skipped = 0, errors = 0;
  for (const fp of eventFiles(project)) {
    try {
      const e = readJson(fp);
      const digest = crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
      if (state.events[e.event_id] === digest) {
        skipped++;
        continue;
      }
      if (!dryRun) {
        await sink.apply(e);
      }
      state.events[e.event_id] = digest;
      applied++;
    } catch (err) {
      errors++;
      console.error(`Sync error for ${fp}: ${err.message}`);
    }
  }
  mkdir(path.dirname(marker));
  fs.writeFileSync(marker, JSON.stringify({
    provider: name,
    updated_at: new Date().toISOString(),
    applied,
    skipped,
    errors,
    events: state.events
  }, null, 2) + '\n');
  if (sink.close) await sink.close();
  return { status: 'ok', provider: name, applied, skipped, errors };
}

export async function emit(project, event) {
  const eventId = event.event_id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const eventWithMeta = {
    ...event,
    event_id: eventId,
    emitted_at: new Date().toISOString(),
    source_hash: event.source_hash || crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')
  };
  const eventsDir = bfPath(project, 'events');
  mkdir(eventsDir);
  const fp = path.join(eventsDir, `${eventId}.json`);
  writeJson(fp, eventWithMeta);
  return eventWithMeta;
}

export async function getEvent(project, eventId) {
  const marker = bfPath(project, 'graph', 'sync-state.json');
  if (!exists(marker)) return null;
  const state = readJson(marker);
  const digest = state.events?.[eventId];
  if (!digest) return null;
  const fp = path.join(bfPath(project, 'events'), `${eventId}.json`);
  if (!exists(fp)) return null;
  return readJson(fp);
}

export async function listEvents(project, opts = {}) {
  const files = eventFiles(project);
  let events = files.map(fp => readJson(fp));
  if (opts.operation) {
    events = events.filter(e => e.operation === opts.operation);
  }
  if (opts.limit) {
    events = events.slice(0, opts.limit);
  }
  return events.reverse();
}
