import fs from 'node:fs'; import path from 'node:path';
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory())walk(p,out); else if(e.name.endsWith('.json'))out.push(p)} return out}
export async function search(project,q,{catalog=null,limit=20}={}){
 const root=path.join(project,'bookforge','knowledge'); const idx=path.join(root,'indexes','entry-index.json');
 if(!fs.existsSync(idx)) return [];
 const data=load(idx); const query=q.toLowerCase();
 return Object.values(data.entries||data).filter(x=>!catalog||x.catalog_id===catalog).map(x=>({x,score:score(x,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.x.id.localeCompare(b.x.id)).slice(0,limit).map(x=>({...x.x,_score:x.score}));
}
function score(x,q){const fields=[x.id,x.name,x.definition,x.purpose,...(x.tags||[]),...(x.genres||[])].join(' ').toLowerCase(); if(fields.includes(q))return 100; let s=0; for(const t of q.split(/\s+/)){if(t&&fields.includes(t))s+=10} return s}
export async function contextPack(project,q,{catalog=null,agent=null,workflow=null,budget=5000}={}){
 const entries=await search(project,q,{catalog,limit:20}); return {version:'1.0.0',task_id:`retrieval-${Date.now()}`,agent,workflow,retrieval:{query:q,mode:'deterministic-lexical',catalog,progressive_disclosure:[0,1,2,3]},entries,token_budget:budget,policy:'exact-id > taxonomy > metadata > lexical > semantic-fallback'};
}
