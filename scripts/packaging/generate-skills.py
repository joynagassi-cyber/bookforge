#!/usr/bin/env python3
import argparse,json,pathlib

def main():
 p=argparse.ArgumentParser(); p.add_argument('--project',default='.'); a=p.parse_args(); root=pathlib.Path(a.project); out=root/'bookforge/generated/skills'; out.mkdir(parents=True,exist_ok=True)
 skills={'bookforge-help':'Guide the user through BookForge state and next action.','bookforge-write':'Execute the writing workflow using the current task packet and book contract.','bookforge-retrieve':'Retrieve only task-relevant knowledge with progressive disclosure.','bookforge-validate':'Run quality, continuity, originality, cliche and AI-slop checks as applicable.','bookforge-sync-graph':'Emit validated graph events from canonical artifacts.'}
 for name,body in skills.items():
  d=out/name; d.mkdir(exist_ok=True); (d/'SKILL.md').write_text(f'# {name}\n\n{body}\n\nCanonical state is authoritative. Never invent missing project facts.\n',encoding='utf8')
 print(json.dumps({'skills':len(skills),'output':str(out)},indent=2))
if __name__=='__main__':main()
