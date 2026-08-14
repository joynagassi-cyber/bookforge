#!/usr/bin/env python3
import json,pathlib,collections,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.')/'bookforge'/'graph'
p=root/'events.jsonl'
counts=collections.Counter(); events=0
if p.exists():
  for line in p.read_text().splitlines():
    try:
      e=json.loads(line); counts[e.get('operation','unknown')]+=1; events+=1
    except json.JSONDecodeError: pass
out=root/'snapshot.json'; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps({'version':'0.5.0','events':events,'operations':counts},indent=2)+'\n')
print(json.dumps({'events':events,'operations':counts},indent=2))
