#!/usr/bin/env python3
import argparse,json,pathlib

def main():
 p=argparse.ArgumentParser(); p.add_argument('--project',default='.'); p.add_argument('--output',default='bookforge/graph/book-graph.json'); a=p.parse_args(); root=pathlib.Path(a.project); events=root/'bookforge/events'; nodes={}; edges=[]
 for f in sorted(events.glob('*.json')):
  e=json.loads(f.read_text()); ent=e.get('entity',{}); nodes[ent.get('id')]=ent
  if e.get('edge'): edges.append(e['edge'])
 graph={'schema_version':'1.0.0','nodes':list(nodes.values()),'edges':edges,'event_count':len(list(events.glob('*.json')))}; out=root/a.output; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(graph,indent=2)+'\n'); print(json.dumps({'nodes':len(nodes),'edges':len(edges),'output':str(out)},indent=2))
if __name__=='__main__': main()
