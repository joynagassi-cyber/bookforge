import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');
function mkdir(p){fs.mkdirSync(p,{recursive:true})}
function cp(src,dst){mkdir(path.dirname(dst)); fs.cpSync(src,dst,{recursive:true})}
function write(p,s){mkdir(path.dirname(p)); fs.writeFileSync(p,s)}
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export async function initProject(project,{template='book',host='auto',graph='none'}={}){
  const bf=path.join(project,'.bookforge'); mkdir(bf);
  cp(path.join(root,'templates','PROJECT-CONSTITUTION.md'),path.join(project,'bookforge','PROJECT-CONSTITUTION.md'));
  cp(path.join(root,'templates','bookforge-state.md'),path.join(project,'bookforge','state','bookforge-state.md'));
  cp(path.join(root,'templates','chapter-packet.md'),path.join(project,'bookforge','templates','chapter-packet.md'));
  write(path.join(project,'bookforge','config.yaml'), `version: 0.5.0\ntemplate: ${template}\nhost: ${host}\ngraph:\n  provider: ${graph}\n  sync_mode: event-driven\n  canonical_store: files\n  graph_is_projection: true\n`);
  write(path.join(project,'bookforge','project.json'), JSON.stringify({version:'0.5.0',template,host,graph,created_at:new Date().toISOString(),canonical:{artifacts:'bookforge/artifacts',state:'bookforge/state',knowledge:'bookforge/knowledge'}},null,2)+'\n');
  mkdir(path.join(project,'bookforge','artifacts')); mkdir(path.join(project,'bookforge','state')); mkdir(path.join(project,'bookforge','knowledge')); mkdir(path.join(project,'bookforge','events')); mkdir(path.join(project,'bookforge','plugins')); mkdir(path.join(project,'bookforge','generated')); mkdir(path.join(project,'bookforge','graph'));
  const hosts = host==='all' ? ['claude-code','cursor','windsurf','antigravity','github-copilot','gemini','kiro','devin','codex-cli','opencode','kilocode','generic'] : host==='auto' ? [fs.existsSync(path.join(project,'.claude'))?'claude-code':fs.existsSync(path.join(project,'.cursor'))?'cursor':'generic'] : [host];
  cp(path.join(root,'project-templates','default','plugins','registry.json'),path.join(project,'bookforge','plugins','registry.json'));
  cp(path.join(root,'project-templates','default','workflows','book-project-lifecycle.yaml'),path.join(project,'bookforge','workflows','book-project-lifecycle.yaml'));
  cp(path.join(root,'project-templates','default','agents','bookforge-orchestrator.json'),path.join(project,'bookforge','agents','bookforge-orchestrator.json'));
  if(graph!=='none') write(path.join(project,'bookforge','graph','provider.json'),JSON.stringify({provider:graph==='jsonl'?'jsonl':graph,sync_mode:'event-driven',canonical_store:'files',write_policy:'validated-events-only'},null,2)+'\n');
  console.log(`Host targets: ${hosts.join(', ')}`);
  const {generate}=await import('../../runtime/host/generator.js'); for(const h of hosts) generate(project,h);
  console.log(`BookForge initialized in ${project}`);
  console.log('Canonical project state lives in bookforge/. IDE/CLI integration is generated separately.');
}
export function status(project){
 const p=path.join(project,'bookforge','project.json'); if(!fs.existsSync(p)) return console.log('BookForge: not initialized');
 const x=readJson(p); console.log(JSON.stringify({version:x.version,template:x.template,host:x.host,graph:x.graph,initialized:true},null,2));
}
export function validate(project){
 const required=['bookforge/project.json','bookforge/config.yaml','bookforge/PROJECT-CONSTITUTION.md','bookforge/state/bookforge-state.md']; const missing=required.filter(x=>!fs.existsSync(path.join(project,x))); if(missing.length){console.error('FAIL',missing); process.exitCode=2;} else console.log('PASS BookForge project contract');
}
export function installPlugin(project,id,source){ if(!id||!source) throw new Error('plugin requires --id and --source'); const dst=path.join(project,'bookforge','plugins',id); if(source.startsWith('.')||source.startsWith('/')||source.startsWith('file:')) cp(path.resolve(project,source.replace(/^file:/,'')),dst); else { write(path.join(dst,'plugin.source.json'),JSON.stringify({id,source},null,2)+'\n'); } console.log(`Plugin registered: ${id}`); }
export function configureHost(project,id,mode='generate'){ if(!id) throw new Error('host requires --id'); const spec=readJson(path.join(root,'specs','hosts','host-adapters.json')); const h=spec.hosts[id]||spec.hosts.generic; const out=path.join(project,'bookforge','generated','hosts',`${id}.json`); write(out,JSON.stringify({host:id,mode,capabilities:h.capabilities,installation:h.installation,generated_at:new Date().toISOString()},null,2)+'\n'); const skillRoot=id==='claude-code'?path.join(project,'.claude','skills'):['cursor','windsurf'].includes(id)?path.join(project,'.agents','skills'):path.join(project,'bookforge','generated','skills'); mkdir(skillRoot); const sd=path.join(skillRoot,'bookforge-help'); mkdir(sd); write(path.join(sd,'SKILL.md'),'# bookforge-help\n\nRead bookforge/PROJECT-CONSTITUTION.md and bookforge/state before acting. Determine the next workflow step without inventing project facts.\n'); console.log(`Host adapter generated: ${out}`); }
export function graphStatus(project){const p=path.join(project,'bookforge','graph','provider.json'); console.log(fs.existsSync(p)?fs.readFileSync(p,'utf8'):'No graph provider configured.');}
