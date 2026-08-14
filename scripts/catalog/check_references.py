from _lib import load_master
D=load_master(); ids={c['id'] for c in D['catalogs']}; unresolved=[]
for c in D['catalogs']:
 for r in c.get('relations',[]): unresolved.append((c['id'],r))
print(f'{len(unresolved)} relation labels require target resolution; no destructive assumptions made.')
