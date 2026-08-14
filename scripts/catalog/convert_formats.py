import argparse,csv,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('input'); p.add_argument('output'); a=p.parse_args(); src=Path(a.input); dst=Path(a.output); data=json.loads(src.read_text())
if dst.suffix=='.csv':
 rows=data if isinstance(data,list) else data.get('entries',[]); keys=sorted({k for r in rows for k in r});
 with dst.open('w',newline='',encoding='utf-8') as f: w=csv.DictWriter(f,fieldnames=keys); w.writeheader(); w.writerows(rows)
else: dst.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(dst)
