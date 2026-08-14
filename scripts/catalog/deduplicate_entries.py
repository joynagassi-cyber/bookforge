import argparse,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('directory'); a=p.parse_args(); seen={}; candidates=[]
for f in Path(a.directory).rglob('entries.json'):
 for e in json.loads(f.read_text()):
  key=(e.get('name','').strip().lower(),e.get('definition'))
  if key in seen: candidates.append({'first':seen[key],'duplicate':e.get('id')})
  else: seen[key]=e.get('id')
out=Path(a.directory).parents[1]/'reports/catalog-merge-candidates.json'; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(candidates,indent=2)+'\n'); print(f'{len(candidates)} duplicate candidates')
