import json
from pathlib import Path
from _lib import load_master,write_json
root=Path(__file__).resolve().parents[2]; d=load_master(); entries=[]; tags={}
for c in d['catalogs']:
 for s in c.get('seed_entries',[]):
  eid=f"{c['id']}.{s}"; entries.append({'id':eid,'catalog_id':c['id'],'domain':c['domain']})
  for t in c.get('taxonomies',[]): tags.setdefault(t,[]).append(eid)
write_json(root/'knowledge/indexes/entry-index.json',{'entries':sorted(entries,key=lambda x:x['id'])}); write_json(root/'knowledge/indexes/tag-index.json',{k:sorted(v) for k,v in sorted(tags.items())}); print('indexes built')
