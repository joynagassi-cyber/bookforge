import json
from pathlib import Path
from _lib import load_master,write_json
D=load_master(); write_json(Path(__file__).resolve().parents[2]/'reports/catalog-stats.json',{'catalogs':len(D['catalogs']),'seed_entries':sum(len(c.get('seed_entries',[])) for c in D['catalogs']),'domains':sorted({c['domain'] for c in D['catalogs']})}); print('stats generated')
