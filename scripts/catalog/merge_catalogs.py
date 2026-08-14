import argparse,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--inputs',nargs='+',required=True); p.add_argument('--output',required=True); a=p.parse_args(); rows=[]
for f in a.inputs: rows.extend(json.loads(Path(f).read_text()))
by={r.get('id'):r for r in rows}; Path(a.output).write_text(json.dumps([by[k] for k in sorted(by)],ensure_ascii=False,indent=2)+'\n'); print('merged',len(by))
