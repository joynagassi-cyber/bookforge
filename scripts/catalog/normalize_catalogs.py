import argparse,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('directory'); a=p.parse_args(); root=Path(a.directory); count=0
for f in root.rglob('entries.json'):
 data=json.loads(f.read_text(encoding='utf-8')); data=sorted(data,key=lambda x:x.get('id','')); [x.update({'tags':sorted(set(x.get('tags',[])))}) for x in data]; f.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); count+=1
print(f'normalized {count} catalogs')
