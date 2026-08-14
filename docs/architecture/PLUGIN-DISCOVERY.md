# Plugin Discovery

BookForge supports four sources in deterministic priority order:

```text
project plugins
    ↓
local development plugins
    ↓
configured registries
    ↓
remote package source
```

A plugin is discoverable when its manifest validates and its framework range is compatible.

Recommended future CLI:

```bash
bookforge plugin list
bookforge plugin add @scope/bookforge-narrative
bookforge plugin add github:owner/bookforge-narrative
bookforge plugin enable narrative
bookforge plugin disable narrative
bookforge plugin remove narrative
```

No plugin is auto-enabled solely because it is installed.
