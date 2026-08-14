#!/usr/bin/env python3
import argparse,json,pathlib,sys

def main():
 p=argparse.ArgumentParser(); p.add_argument('--project',default='.'); a=p.parse_args(); root=pathlib.Path(a.project); ids=set(); errors=[]
 for f in sorted((root/'bookforge/events').glob('*.json')):
  try:e=json.loads(f.read_text())
  except Exception as ex: errors.append(f'{f}: invalid JSON {ex}'); continue
  if not e.get('event_id'): errors.append(f'{f}: missing event_id')
  ent=e.get('entity',{});
  if not ent.get('id') or not ent.get('type'): errors.append(f'{f}: invalid entity')
  ids.add(ent.get('id'))
 print(json.dumps({'status':'PASS' if not errors else 'FAIL','errors':errors,'entities':len(ids)},indent=2)); sys.exit(1 if errors else 0)
if __name__=='__main__': main()
