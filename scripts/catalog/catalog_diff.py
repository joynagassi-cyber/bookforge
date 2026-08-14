import argparse,json
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--old',required=True); p.add_argument('--new',required=True); a=p.parse_args(); old=json.loads(Path(a.old).read_text()); new=json.loads(Path(a.new).read_text()); oi={x['id'] for x in old.get('catalogs',[])}; ni={x['id'] for x in new.get('catalogs',[])}; print('ADDED',sorted(ni-oi)); print('REMOVED',sorted(oi-ni)); print('UNCHANGED',len(oi&ni))
