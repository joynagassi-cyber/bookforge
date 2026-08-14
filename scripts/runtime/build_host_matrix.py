#!/usr/bin/env python3
import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=json.loads((ROOT/'specs/hosts/host-adapters.json').read_text())
out=ROOT/'reports/host-compatibility-matrix.json'
rows=[]
for host,data in sorted(spec['hosts'].items()):
    rows.append({'host':host,'capabilities':data.get('capabilities',[]),'installation':data.get('installation',{})})
out.write_text(json.dumps({'version':'0.5.0','hosts':rows},indent=2)+'\n')
print(f'Wrote {out}')
