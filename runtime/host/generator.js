import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { readJson, writeText, writeJson, mkdir, bfPath } from '../core/io.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '../..');

const hostSpec=() => {
  const specPath = path.join(pkgRoot, 'specs', 'hosts', 'host-adapters.json');
  return readJson(specPath);
};
const target=(project,host)=>({
  'claude-code':'.claude/skills','cursor':'.agents/skills','windsurf':'.agents/skills','antigravity':'.agent/skills','antigravity-cli':'.agents/skills','github-copilot':'.agents/skills','gemini':'.agents/skills','kiro':'bookforge/generated/skills','devin':'bookforge/generated/skills','codex-cli':'bookforge/generated/skills','opencode':'bookforge/generated/skills','kilocode':'bookforge/generated/skills','generic':'bookforge/generated/skills'
}[host]||'bookforge/generated/skills');
export function generate(project,host='generic'){
  const spec=hostSpec().hosts[host]||hostSpec().hosts.generic; const root=path.join(project,target(project,host)); const skills=['bookforge-help','bookforge-route','bookforge-context-pack','bookforge-graph-sync','bookforge-workflow'];
  for(const s of skills){const d=path.join(root,s); mkdir(d); writeText(path.join(d,'SKILL.md'),`# ${s}\n\nThis is a generated BookForge launcher.\n\nRead the canonical project state in bookforge/ before acting. Use the BookForge CLI to route, pack context, execute workflow contracts and synchronize graph memory. Do not invent project facts.\n`);}
  const out=bfPath(project,'generated','hosts',host); mkdir(out); writeJson(path.join(out,'host.json'),{host,capabilities:spec.capabilities,installation:spec.installation,skills_root:target(project,host),generated_at:new Date().toISOString()});
  return {host,skills_root:target(project,host),capabilities:spec.capabilities};
}
