import json
from pathlib import Path
from _lib import load_master
root=Path(__file__).resolve().parents[2]
for c in load_master()['catalogs']:
 d=root/'knowledge/catalogs'/c['id']; d.mkdir(parents=True,exist_ok=True); (d/'template.json').write_text(json.dumps({k:None for k in c['entry_schema']},indent=2)+'\n'); (d/'examples.json').write_text('[]\n'); (d/'README.md').write_text(f"# {c['name']}\n\nGenerated from the master catalog; seed entries require review.\n")
print('templates generated')
