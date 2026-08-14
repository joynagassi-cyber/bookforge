import fs from 'node:fs';
import path from 'node:path';

export function mkdir(p){ fs.mkdirSync(p,{recursive:true}); }
export function exists(p){ return fs.existsSync(p); }
export function readText(p){ return fs.readFileSync(p,'utf8'); }
export function writeText(p,s){ mkdir(path.dirname(p)); fs.writeFileSync(p,s); }
export function readJson(p){ return JSON.parse(readText(p)); }
export function writeJson(p,v){ writeText(p, JSON.stringify(v,null,2)+'\n'); }
export function projectRoot(project){ return path.resolve(project); }
export function bfPath(project,...parts){ return path.join(project,'bookforge',...parts); }
