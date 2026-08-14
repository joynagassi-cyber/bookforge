from _lib import load_master
D=load_master(); missing=[c['id'] for c in D['catalogs'] if not c.get('reference_sources')]; print('catalogs without reference_sources:',missing)
