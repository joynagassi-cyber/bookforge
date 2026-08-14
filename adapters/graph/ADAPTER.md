# Graph Adapter

## Purpose
Provide graph database integration for BookForge's event history and relationship mapping.

## Supported Providers
- JSONL (default, zero dependencies)
- Neo4j (optional, requires neo4j-driver)

## Configuration

```yaml
graph:
  provider: jsonl  # or neo4j
  uri: neo4j://localhost:7687
  database: neo4j
  username: neo4j
  password: ${NEO4J_PASSWORD}
```

## Operations

### emit(event)
Write an event to the graph stream.

```javascript
await emit(project, {
  event_id: 'evt-001',
  operation: 'draft',
  agent: 'writer',
  workflow: 'draft-chapter',
  timestamp: new Date().toISOString()
});
```

### sync()
Synchronize pending events to the graph provider.

```javascript
const result = await sync(project);
// { status: 'ok', applied: 5, skipped: 2, errors: 0 }
```

### query(event_id)
Retrieve a specific event.

```javascript
const event = await query(project, 'evt-001');
```

### list(query)
List events with optional filters.

```javascript
const events = await list(project, { operation: 'draft', limit: 100 });
```

## State Management
- Events are stored in `bookforge/events/*.json`
- Sync state is tracked in `bookforge/graph/sync-state.json`
- Provider config in `bookforge/graph/provider.json`

## Idempotency
All sync operations are idempotent. Re-running sync will not duplicate events.

## Error Handling
- JSONL provider: events are buffered, sync retries on failure
- Neo4j provider: connection errors are logged, events remain pending
- Both providers: malformed events are skipped with error logging
