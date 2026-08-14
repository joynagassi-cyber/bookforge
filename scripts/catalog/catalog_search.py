import argparse,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('query'); a=p.parse_args(); q=a.query.lower(); root=Path(__file__).resolve().parents[2]/'knowledge/catalogs'; hits=[]
for f in root.rglob('entries.json'):
 for e in json.loads(f.read_text()):
  if q in json.dumps(e,ensure_ascii=False).lower(): hits.append(e)
print(json.dumps(hits[:50],ensure_ascii=False,indent=2))
