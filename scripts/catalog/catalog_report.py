import json
from pathlib import Path
from _lib import load_master
D=load_master(); lines=['# BookForge Catalog Coverage Report','',f"Master catalogs: **{len(D['catalogs'])}**",f"Seed entries: **{sum(len(c.get('seed_entries',[])) for c in D['catalogs'])}**",'','| Catalog | Domain | Priority | Seeds |','|---|---|---|---:|']
for c in D['catalogs']: lines.append(f"| `{c['id']}` | {c['domain']} | {c['priority']} | {len(c.get('seed_entries',[]))} |")
p=Path(__file__).resolve().parents[2]/'reports/catalog-coverage.md'; p.write_text('\n'.join(lines)+'\n',encoding='utf-8'); print(p)
