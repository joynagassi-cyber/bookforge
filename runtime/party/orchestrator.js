import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { exists, readJson, writeJson } from '../core/io.js';
import { memoryDir, initMemory, appendMemory, getMemory, clearMemory } from './memory.js';

export function createParty(project, partyId, { members = [], scene = null } = {}) {
  const mem = initMemory(project, partyId, { members });
  return {
    party_id: partyId,
    status: 'active',
    created_at: new Date().toISOString(),
    scene,
    members_count: members.length,
    memory_path: mem.memlog
  };
}

export function getParty(project, partyId) {
  const mem = getMemory(project, partyId);
  if (!mem) return null;
  return { party_id: partyId, status: 'active', memory: mem };
}

export function listParties(project) {
  const dir = memoryDir(project, '');
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter(d => fs.statSync(path.join(dir, d)).isDirectory())
    .map(id => ({ party_id: id, ...getMemory(project, id) }));
}

export function addMember(project, partyId, member) {
  const party = getParty(project, partyId);
  if (!party) throw new Error(`Party not found: ${partyId}`);
  const membersFile = path.join(memoryDir(project, partyId), 'members.json');
  const members = exists(membersFile) ? readJson(membersFile).members : [];
  members.push({
    id: member.id || crypto.randomUUID(),
    name: member.name,
    role: member.role || 'participant',
    persona: member.persona || null,
    added_at: new Date().toISOString()
  });
  writeJson(membersFile, { party_id: partyId, members });
  appendMemory(project, partyId, `**Member added:** ${member.name} (${member.role})`);
  return { members_count: members.length };
}

export function removeMember(project, partyId, memberId) {
  const membersFile = path.join(memoryDir(project, partyId), 'members.json');
  if (!exists(membersFile)) throw new Error(`Party not found: ${partyId}`);
  const data = readJson(membersFile);
  const before = data.members.length;
  data.members = data.members.filter(m => m.id !== memberId);
  writeJson(membersFile, data);
  appendMemory(project, partyId, `**Member removed:** ${memberId}`);
  return { removed: before !== data.members.length };
}

export function addTurn(project, partyId, turn) {
  const content = `**${turn.speaker}**: ${turn.content}\n\n`;
  appendMemory(project, partyId, content);
  return { turn_id: crypto.randomUUID(), timestamp: new Date().toISOString() };
}

export function getHistory(project, partyId, opts = {}) {
  const party = getParty(project, partyId);
  if (!party) throw new Error(`Party not found: ${partyId}`);
  let history = party.memory?.history || '';
  if (opts.lines) {
    const lines = history.split('\n');
    history = lines.slice(-opts.lines).join('\n');
  }
  return {
    party_id: partyId,
    members: party.memory?.members || [],
    history
  };
}

export function endParty(project, partyId) {
  clearMemory(project, partyId);
  return { party_id: partyId, status: 'ended', ended_at: new Date().toISOString() };
}
