import json
from pathlib import Path
from _lib import load_master
D=load_master(); ids=[c['id'] for c in D['catalogs']]; print('unique catalog IDs:',len(ids)==len(set(ids)))
