# BookForge Folder Map

```text
bookforge/
├── agents/                 # role contracts; no host-specific code
├── workflows/              # deterministic process definitions
├── skills/                 # reusable task instructions
├── catalogs/               # compact legacy/user-facing CSV catalogs
├── knowledge/              # Master Catalog + structured knowledge system
├── schemas/                # artifact/task/route/validator contracts
├── manifests/              # agent/workflow registries
├── adapters/               # external systems and providers
│   ├── graph/
│   └── hosts/
├── runtime/                # retrieval, context and graph runtime
├── scripts/                # deterministic Python automation
│   ├── catalog/
│   ├── graph/
│   └── packaging/
├── specs/                  # extension, host and graph contracts
├── templates/              # project initialization templates
├── project-templates/      # ready project profiles
├── evaluation/             # golden cases and evaluation harness
├── harness/                # test/evaluation orchestration
├── overrides/              # documented override mechanisms
├── docs/                   # architecture and operational documentation
└── bin/                    # npm CLI entrypoint
```

## Installed project

The framework package is not copied wholesale into the book. `bookforge init` creates a small project control plane:

```text
book-project/
├── bookforge/
│   ├── artifacts/          # canonical book artifacts
│   ├── state/              # current workflow state
│   ├── knowledge/          # project-specific additions/overrides
│   ├── events/             # graph events
│   ├── graph/              # graph projection metadata
│   ├── plugins/            # installed plugin registrations
│   ├── generated/          # host-specific generated surfaces
│   ├── templates/
│   ├── PROJECT-CONSTITUTION.md
│   ├── config.yaml
│   └── project.json
└── manuscript/             # user book content, if desired
```
