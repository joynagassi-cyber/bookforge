from __future__ import annotations
import argparse, json, sys
from pathlib import Path

ROOT = Path.cwd() / "bookforge"

def load_manifest():
    p = ROOT / "manifest.yaml"
    if not p.exists():
        raise SystemExit("BookForge project not initialized. Run: bookforge init")
    return p.read_text(encoding="utf-8")

def init_project():
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "state").mkdir(exist_ok=True)
    (ROOT / "state" / "book-state.yaml").write_text(
        "phase: initialized\ncurrent_chapter: null\nopen_findings: []\n",
        encoding="utf-8",
    )
    (ROOT / "manifest.yaml").write_text(
        "project_id: new-book\nframework_version: 0.2.0\nstatus: initialized\n",
        encoding="utf-8",
    )
    print("Initialized BookForge project.")

def status():
    print(load_manifest())
    state = ROOT / "state" / "book-state.yaml"
    if state.exists():
        print("\nSTATE\n" + state.read_text(encoding="utf-8"))

def validate():
    required = [
        ROOT / "manifest.yaml",
        ROOT / "state" / "book-state.yaml",
    ]
    missing = [str(p) for p in required if not p.exists()]
    result = {"status": "FAIL" if missing else "PASS", "missing": missing}
    print(json.dumps(result, indent=2))
    return 1 if missing else 0

def catalog_status():
    root = Path(__file__).resolve().parents[3]
    idx = root / "knowledge" / "indexes" / "catalog-index.json"
    if not idx.exists():
        print(json.dumps({"status":"MISSING","index":str(idx)}, indent=2)); return 1
    data=json.loads(idx.read_text(encoding="utf-8")); print(json.dumps({"status":"PASS","catalog_count":data.get("catalog_count"),"index":str(idx)}, indent=2)); return 0

def route(task):
    t = task.lower()
    if any(x in t for x in ["typo", "orthographe", "punctuation", "ponctuation"]):
        wf, complexity = "revision-loop", "tiny"
    elif any(x in t for x in ["nouveau chapitre", "new chapter", "add a chapter"]):
        wf, complexity = "chapter-plan", "medium"
    elif any(x in t for x in ["change the central promise", "changer la promesse", "restructure"]):
        wf, complexity = "correct-course", "large"
    elif any(x in t for x in ["publication", "publish", "publier"]):
        wf, complexity = "release-gate", "large"
    else:
        wf, complexity = "help", "small"
    print(json.dumps({
        "task_type": task,
        "complexity": complexity,
        "workflow": wf,
        "human_gate": wf == "release-gate",
        "required_artifacts": [],
    }, indent=2))
    return 0

def main():
    parser = argparse.ArgumentParser(prog="bookforge")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init")
    sub.add_parser("status")
    sub.add_parser("validate")
    c = sub.add_parser("catalog-status")
    r = sub.add_parser("route")
    r.add_argument("task")
    args = parser.parse_args()
    if args.command == "init":
        return init_project()
    if args.command == "status":
        return status()
    if args.command == "validate":
        return validate()
    if args.command == "catalog-status":
        return catalog_status()
    if args.command == "route":
        return route(args.task)
    return 0

if __name__ == "__main__":
    main()
