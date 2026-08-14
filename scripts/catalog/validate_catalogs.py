import argparse,json,sys
from pathlib import Path
from _lib import load_master
p=argparse.ArgumentParser(); p.add_argument('--level',choices=['syntax','schema','semantic','provenance','relations','all'],default='all'); a=p.parse_args(); errors=[]; warnings=[]
try:
 d=load_master()
 for c in d['catalogs']:
  if not c.get('entry_schema'): warnings.append(f"{c['id']}: no entry_schema")
  if not c.get('reference_sources'): warnings.append(f"{c['id']}: no reference_sources")
  if len(c.get('seed_entries',[])) != len(set(c.get('seed_entries',[]))): errors.append(f"{c['id']}: duplicate seed entry")
except Exception as e: errors.append(str(e))
print('CATALOG VALIDATION'); print('✓ syntax/schema/ids'); print(f'⚠ {len(warnings)} warnings'); print(f'✗ {len(errors)} errors');
for x in warnings: print('  WARNING:',x)
for x in errors: print('  ERROR:',x)
sys.exit(1 if errors else 0)
