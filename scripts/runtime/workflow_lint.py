#!/usr/bin/env python3
import pathlib,re,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'workflows')
errors=[]
for p in sorted(root.glob('*/WORKFLOW.md')):
    text=p.read_text()
    for heading in ['## Purpose','## Phase','## Inputs','## Procedure','## Stop conditions']:
        if heading not in text: errors.append(f'{p}: missing {heading}')
if errors: print('\n'.join(errors)); sys.exit(1)
print(f'PASS {len(list(root.glob("*/WORKFLOW.md")))} workflow contracts')
