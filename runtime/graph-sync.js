import fs from 'node:fs'; import path from 'node:path';
export function sync(project){
 const events=path.join(project,'bookforge','events'); const out=path.join(project,'bookforge','graph','events.jsonl'); fs.mkdirSync(events,{recursive:true}); fs.mkdirSync(path.dirname(out),{recursive:true});
 const files=fs.existsSync(events)?fs.readdirSync(events).filter(x=>x.endsWith('.json')):[]; let appended=0;
 const seen=new Set(fs.existsSync(out)?fs.readFileSync(out,'utf8').split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x).event_id}catch{return null}}):[]);
 const lines=[]; for(const f of files){const e=JSON.parse(fs.readFileSync(path.join(events,f),'utf8')); if(!seen.has(e.event_id)){lines.push(JSON.stringify(e)); appended++;}}
 if(lines.length)fs.appendFileSync(out,lines.join('\n')+'\n'); console.log(JSON.stringify({status:'ok',provider:'event-log',events_seen:files.length,events_appended:appended,graph_projection:out},null,2));
}
