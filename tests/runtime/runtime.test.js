import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { register, list, enable, remove } from '../../runtime/plugin/registry.js';
import { route } from '../../runtime/context/router.js';
import { start, transition } from '../../runtime/workflow/engine.js';
import { sync } from '../../runtime/graph/synchronizer.js';

test('plugin registry is deterministic',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'bf-plugin-'));
  register(d,{id:'demo.plugin',version:'1.0.0',kind:'skill',entrypoints:{skills:['demo']}});
  assert.equal(list(d).length,1); assert.equal(enable(d,'demo.plugin',false).enabled,false); assert.equal(remove(d,'demo.plugin'),true); assert.equal(list(d).length,0);
});

test('context router combines workflow and task hints',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'bf-route-'));
  fs.mkdirSync(path.join(d,'bookforge','knowledge','indexes'),{recursive:true});
  fs.writeFileSync(path.join(d,'bookforge','knowledge','indexes','agent-catalog-map.json'),JSON.stringify({writer:{required:['voice'],optional:['style']}}));
  fs.writeFileSync(path.join(d,'bookforge','knowledge','indexes','workflow-catalog-map.json'),JSON.stringify({draft:{required:['scenes']}}));
  fs.writeFileSync(path.join(d,'bookforge','knowledge','indexes','catalog-index.json'),'{}');
  fs.writeFileSync(path.join(d,'bookforge','knowledge','indexes','entry-index.json'),'{}');
  const r=route(d,{task:'write a dialogue scene',agent:'writer',workflow:'draft'}); assert.deepEqual(r.required,['beats','conflict','dialogue','pacing','scenes','stakes','subtext','voice']); assert.deepEqual(r.optional,['style']);
});

test('graph sync is idempotent',async()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'bf-graph-')); fs.mkdirSync(path.join(d,'bookforge','events'),{recursive:true}); fs.mkdirSync(path.join(d,'bookforge','graph'),{recursive:true});
  fs.writeFileSync(path.join(d,'bookforge','graph','provider.json'),'{}');
  fs.writeFileSync(path.join(d,'bookforge','events','a.json'),JSON.stringify({event_id:'e1',operation:'upsert_node'}));
  const a=await sync(d); const b=await sync(d); assert.equal(a.applied,1); assert.equal(b.applied,0);
});

test('workflow run state persists',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'bf-run-')); fs.mkdirSync(path.join(d,'bookforge','runtime','runs'),{recursive:true});
  const r=start(d,{workflow:{id:'x'},state:'READY'}); assert.equal(r.state,'CONTEXT_BUILT'); const r2=transition(d,r.run_id,'EXECUTING'); assert.equal(r2.state,'EXECUTING');
});
