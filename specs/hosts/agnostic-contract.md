# Host-Agnostic Contract

BookForge does not depend on an IDE's proprietary agent runtime.

The portable layer consists of:

1. Markdown instruction surfaces
2. JSON/YAML manifests
3. filesystem artifacts
4. CLI commands
5. MCP descriptors when supported
6. deterministic task/context packets

A host adapter may add native skills, commands or MCP registration, but must not alter workflow semantics.

Unknown host: use `generic` adapter and expose generated instructions + task packets.
