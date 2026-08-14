import json
from pathlib import Path
from _lib import load_master,write_json
root=Path(__file__).resolve().parents[2]; d=load_master(); rows=[]
for c in d['catalogs']:
 for r in c.get('relations',[]): rows.append({'source_catalog':c['id'],'relation':r,'target':'unresolved','status':'candidate'})
write_json(root/'knowledge/relations/catalog-relations.json',{'relations':rows}); print('relation index built')
