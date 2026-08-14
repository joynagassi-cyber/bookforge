# Overrides

Never modify installed defaults to customize the framework.

Create sparse overrides instead:

```text
overrides/
├── agents/
│   └── writer.yaml
├── workflows/
│   └── chapter-qa.yaml
├── skills/
│   └── human-voice-editor.yaml
└── catalogs/
    └── writing-styles-local.csv
```

Precedence:

1. framework defaults
2. module extension
3. project override
4. user-local override

An override changes only the explicitly declared fields.
