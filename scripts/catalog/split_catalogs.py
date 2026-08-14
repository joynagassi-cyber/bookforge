import argparse,json
from pathlib import Path
from _lib import load_master
p=argparse.ArgumentParser(); p.add_argument('--master',default=str(Path(__file__).resolve().parents[2]/'knowledge/master/bookforge-knowledge-catalog-master-v1.0.json')); p.add_argument('--output',default=str(Path(__file__).resolve().parents[2]/'knowledge/catalogs')); a=p.parse_args(); d=load_master(a.master)
for c in d['catalogs']:
 out=Path(a.output)/c['id']; out.mkdir(parents=True,exist_ok=True); (out/'manifest.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('generated',c['id'])
