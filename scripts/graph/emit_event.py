#!/usr/bin/env python3
import argparse, hashlib, json, pathlib, datetime

def main():
    p=argparse.ArgumentParser(); p.add_argument('--project',default='.'); p.add_argument('--operation',required=True); p.add_argument('--entity-id',required=True); p.add_argument('--entity-type',required=True); p.add_argument('--properties',default='{}'); p.add_argument('--source-artifact',default=''); a=p.parse_args()
    props=json.loads(a.properties); payload=f'{a.operation}|{a.entity_id}|{a.entity_type}|{json.dumps(props,sort_keys=True)}|{a.source_artifact}'.encode(); eid=hashlib.sha256(payload).hexdigest()[:24]
    event={'event_id':eid,'operation':a.operation,'entity':{'id':a.entity_id,'type':a.entity_type,'properties':props},'source_artifact':a.source_artifact,'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actor':'bookforge'}
    d=pathlib.Path(a.project)/'bookforge/events'; d.mkdir(parents=True,exist_ok=True); (d/f'{eid}.json').write_text(json.dumps(event,indent=2)+'\n',encoding='utf8'); print(eid)
if __name__=='__main__': main()
