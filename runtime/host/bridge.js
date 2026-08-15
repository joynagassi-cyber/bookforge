import fs from 'node:fs';
import path from 'node:path';
import { writeJson, mkdir, exists } from '../core/io.js';

export function loadHostSpecs(project) {
  const paths = [
    path.join(project, 'bookforge', 'generated', 'hosts'),
    path.join(project, '.claude', 'skills'),
    path.join(project, '.agents', 'skills'),
    path.join(project, 'bookforge', 'generated', 'skills')
  ];
  const specs = {};
  for (const p of paths) {
    if (!exists(p)) continue;
    for (const skill of fs.readdirSync(p)) {
      const skillPath = path.join(p, skill);
      if (!fs.statSync(skillPath).isDirectory()) continue;
      const skillMd = path.join(skillPath, 'SKILL.md');
      if (exists(skillMd)) {
        specs[skill] = { path: skillPath, source: p };
      }
    }
  }
  return specs;
}

export function resolveCapabilities(project, requiredCapabilities) {
  const hostSpecs = loadHostSpecs(project);
  const matching = new Set();
  for (const [skillName, skillInfo] of Object.entries(hostSpecs)) {
    const skillMd = fs.readFileSync(skillInfo.path, 'utf8');
    for (const cap of requiredCapabilities) {
      if (skillMd.toLowerCase().includes(cap.toLowerCase())) {
        matching.add(cap);
      }
    }
  }
  return Array.from(matching);
}

export function findBestHost(project, requiredCapabilities) {
  const scores = {};
  const hostSpecs = loadHostSpecs(project);
  for (const [skillName, skillInfo] of Object.entries(hostSpecs)) {
    const skillMd = fs.readFileSync(skillInfo.path, 'utf8');
    let score = 0;
    for (const cap of requiredCapabilities) {
      if (skillMd.toLowerCase().includes(cap.toLowerCase())) score++;
    }
    if (score > 0) scores[skillName] = score;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

export function generateHostBridge(project, capabilities) {
  const bridgePath = path.join(project, 'bookforge', 'generated', 'host-bridge.json');
  mkdir(path.dirname(bridgePath));
  const bridge = {
    version: '0.6.0',
    generated_at: new Date().toISOString(),
    capabilities: capabilities || [],
    available_hosts: loadHostSpecs(project)
  };
  writeJson(bridgePath, bridge);
  return bridge;
}

export function mapCapabilityToHost(project, capability) {
  const hostSpecs = loadHostSpecs(project);
  for (const [skillName, skillInfo] of Object.entries(hostSpecs)) {
    const skillMd = fs.readFileSync(skillInfo.path, 'utf8');
    if (skillMd.toLowerCase().includes(capability.toLowerCase())) {
      return { skill: skillName, host: skillInfo.source };
    }
  }
  return null;
}
