from __future__ import annotations
import json, hashlib, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
MASTER=ROOT/'knowledge/master/bookforge-knowledge-catalog-master-v1.0.json'

def load_master(path=MASTER):
    data=json.loads(Path(path).read_text(encoding='utf-8'))
    if data.get('catalog_count') != len(data.get('catalogs',[])):
        raise ValueError(f"catalog_count mismatch: declared={data.get('catalog_count')} actual={len(data.get('catalogs',[]))}")
    ids=[c.get('id') for c in data['catalogs']]
    if len(ids)!=len(set(ids)) or any(not x for x in ids): raise ValueError('catalog IDs must be unique and non-empty')
    return data

def write_json(path,obj):
    path=Path(path); path.parent.mkdir(parents=True,exist_ok=True); path.write_text(json.dumps(obj,ensure_ascii=False,indent=2,sort_keys=True)+'\n',encoding='utf-8')

def stable_hash(obj):
    raw=json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode(); return hashlib.sha256(raw).hexdigest()

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
