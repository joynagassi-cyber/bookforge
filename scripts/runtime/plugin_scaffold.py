#!/usr/bin/env python3
import json, pathlib, sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve(); pid=sys.argv[2] if len(sys.argv)>2 else 'my-plugin'
p=root/pid; p.mkdir(parents=True,exist_ok=True)
manifest={'id':pid,'version':'0.1.0','kind':'bundle','framework':{'bookforge':'>=0.5.0 <1.0.0'},'entrypoints':{'agents':[],'workflows':[],'skills':[]},'capabilities':[],'provides':[],'consumes':[]}
(p/'plugin.json').write_text(json.dumps(manifest,indent=2)+'\n'); (p/'README.md').write_text(f'# {pid}\n\nBookForge plugin.\n')
print(p)
