import json
from pathlib import Path
from _lib import write_json
root=Path(__file__).resolve().parents[2]; wf=json.loads((root/'manifests/workflows.json').read_text()); out={x['id']:{'required':[],'optional':[]} for x in wf}; write_json(root/'knowledge/indexes/workflow-catalog-map.json',out); print('workflow map initialized; curate required catalogs per workflow')
