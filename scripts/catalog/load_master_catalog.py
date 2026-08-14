from _lib import load_master
if __name__=='__main__':
 d=load_master(); print(f"OK: {len(d['catalogs'])} catalogs; version={d['version']}")
