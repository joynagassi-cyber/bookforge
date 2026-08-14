import json
from pathlib import Path
from _lib import load_master,write_json
root=Path(__file__).resolve().parents[2]; agents={a['id'] for a in json.loads((root/'manifests/agents.json').read_text())}; d=load_master(); out={a:{'required':[]} for a in sorted(agents)}
for c in d['catalogs']:
 for consumer in c.get('primary_consumers',[]):
  slug=consumer.lower().replace(' ','-')
  if slug in out: out[slug]['required'].append(c['id'])
write_json(root/'knowledge/indexes/agent-catalog-map.json',out); print('agent map built')
