#!/usr/bin/env python3
import json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[2]
errors=[]
for rel in ['package.json','specs/plugins/plugin.schema.json','specs/plugins/module.schema.json','specs/hosts/host-adapters.json']:
    p=ROOT/rel
    try: json.loads(p.read_text())
    except Exception as e: errors.append(f'{rel}: {e}')
for rel in ['runtime/plugin/registry.js','runtime/context/router.js','runtime/context/packer.js','runtime/workflow/engine.js','runtime/graph/synchronizer.js','runtime/host/generator.js']:
    if not (ROOT/rel).exists(): errors.append(f'missing {rel}')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print('PASS BookForge Runtime v0.5 contract')
