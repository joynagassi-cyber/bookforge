# Quickstart

```bash
npx bookforge@latest init --template book --host auto --graph none
```

Then configure the host:

```bash
bookforge host --id claude-code
```

or:

```bash
bookforge host --id cursor
```

For a generic environment:

```bash
bookforge host --id generic
```

Configure graph memory later:

```bash
bookforge init --graph neo4j
bookforge graph-sync
bookforge watch
```

Start with the portable `json` graph if no external service is available.
