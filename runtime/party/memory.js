import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readJson, writeJson, bfPath, mkdir, exists, writeText } from '../core/io.js';

const MEMORY_DIR = 'bookforge/generated/party-memory';

export function memoryDir(project, partyId) {
  return path.join(project, MEMORY_DIR, partyId);
}

export function initMemory(project, partyId, { members = [] } = {}) {
  const dir = memoryDir(project, partyId);
  mkdir(dir);
  const memlog = path.join(dir, '.memlog.md');
  const header = `# Party Memory: ${partyId}\n\nGenerated: ${new Date().toISOString()}\nMembers: ${members.map(m => m.name || m.id).join(', ')}\n\n`;
  writeText(memlog, header);
  const membersFile = path.join(dir, 'members.json');
  writeJson(membersFile, {
    party_id: partyId,
    members: members.map(m => ({
      id: m.id || crypto.randomUUID(),
      name: m.name || m.id,
      role: m.role || 'participant',
      persona: m.persona || null,
      added_at: new Date().toISOString()
    }))
  });
  return { party_id: partyId, memlog, members_count: members.length };
}

export function appendMemory(project, partyId, entry) {
  const dir = memoryDir(project, partyId);
  if (!exists(dir)) {
    initMemory(project, partyId, { members: [] });
  }
  const memlog = path.join(dir, '.memlog.md');
  const timestamp = new Date().toISOString();
  const line = `## ${timestamp}\n\n${entry}\n\n`;
  writeText(memlog, line, { append: true });
  return { appended: true, timestamp };
}

export function getMemory(project, partyId) {
  const memlog = path.join(memoryDir(project, partyId), '.memlog.md');
  if (!exists(memlog)) return null;
  return {
    memlog: readJson(memlog.replace('.memlog.md', '/members.json')).members || [],
    history: fs.readFileSync(memlog, 'utf8')
  };
}

export function clearMemory(project, partyId) {
  const dir = memoryDir(project, partyId);
  if (exists(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return { cleared: true };
}
