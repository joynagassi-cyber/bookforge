#!/usr/bin/env python3
import argparse,json,pathlib

def main():
 p=argparse.ArgumentParser(); p.add_argument('--project',default='.'); p.add_argument('--provider',default='neo4j-mcp'); a=p.parse_args(); root=pathlib.Path(a.project)/'bookforge/generated/mcp'; root.mkdir(parents=True,exist_ok=True)
 cfg={'mcpServers':{'bookforge-graph':{'command':'neo4j-mcp','env':{'NEO4J_URI':'bolt://localhost:7687','NEO4J_DATABASE':'neo4j','NEO4J_READ_ONLY':'false','NEO4J_TELEMETRY':'false'}}}}
 (root/'claude-cursor.json').write_text(json.dumps(cfg,indent=2)+'\n'); print(root/'claude-cursor.json')
if __name__=='__main__': main()
