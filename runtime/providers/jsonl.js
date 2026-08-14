import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, bfPath, mkdir, exists } from '../core/io.js';

export function create(project) {
  const out = bfPath(project, 'graph', 'events.jsonl');
  mkdir(path.dirname(out));
  let lineCount = 0;
  if (exists(out)) {
    lineCount = fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).length;
  }
  return {
    name: 'jsonl',
    path: out,
    async apply(event) {
      const line = JSON.stringify({
        ...event,
        _meta: {
          provider: 'jsonl',
          written_at: new Date().toISOString(),
          hash: crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')
        }
      });
      fs.appendFileSync(out, line + '\n');
      lineCount++;
      return { ok: true, provider: 'jsonl', path: out, line: lineCount };
    },
    async query(eventId) {
      if (!exists(out)) return null;
      const lines = fs.readFileSync(out, 'utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.event_id === eventId) return event;
        } catch { /* skip malformed lines */ }
      }
      return null;
    },
    async list(query = {}) {
      if (!exists(out)) return [];
      const lines = fs.readFileSync(out, 'utf8').split('\n').filter(Boolean);
      return lines.map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean).filter(event => {
        if (!query.operation) return true;
        return event.operation === query.operation;
      }).reverse();
    },
    async stats() {
      if (!exists(out)) return { total_events: 0, path: out };
      const lines = fs.readFileSync(out, 'utf8').split('\n').filter(Boolean);
      const operations = {};
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          operations[event.operation] = (operations[event.operation] || 0) + 1;
        } catch { /* skip */ }
      }
      return { total_events: lines.length, path: out, operations };
    },
    close() { return Promise.resolve(); }
  };
}
