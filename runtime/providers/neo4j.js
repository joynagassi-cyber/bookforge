export async function create(project, config = {}) {
  let neo4j;
  try {
    neo4j = await import('neo4j-driver');
  } catch {
    throw new Error('Neo4j provider requires optional dependency neo4j-driver. Install with: npm install neo4j-driver');
  }
  const uri = config.uri || process.env.NEO4J_URI || 'neo4j://localhost:7687';
  const user = config.username || process.env.NEO4J_USERNAME || 'neo4j';
  const pass = config.password || process.env.NEO4J_PASSWORD;
  if (!pass) throw new Error('NEO4J_PASSWORD environment variable is required for Neo4j provider');
  const database = config.database || process.env.NEO4J_DATABASE || 'neo4j';
  const driver = neo4j.default.driver(uri, neo4j.default.auth.basic(user, pass));
  const session = driver.session({ database });
  await session.run(`
    CREATE CONSTRAINT bookforge_event_id IF NOT EXISTS
    FOR (e:BookForgeEvent) REQUIRE e.event_id IS UNIQUE
  `);
  return {
    name: 'neo4j',
    async apply(event) {
      const s = driver.session({ database });
      try {
        await s.run(
          `MERGE (e:BookForgeEvent {event_id: $id})
           SET e += $props, e.updated_at = datetime()
           RETURN e`,
          {
            id: event.event_id,
            props: {
              operation: event.operation,
              source_artifact: event.source_artifact || null,
              source_hash: event.source_hash || null,
              timestamp: event.timestamp || null,
              agent: event.agent || null,
              workflow: event.workflow || null
            }
          }
        );
        return { ok: true, provider: 'neo4j', event_id: event.event_id };
      } finally {
        await s.close();
      }
    },
    async query(eventId) {
      const s = driver.session({ database });
      try {
        const result = await s.run(
          `MATCH (e:BookForgeEvent {event_id: $id}) RETURN e`,
          { id: eventId }
        );
        const record = result.records[0];
        return record ? record.get('e').properties : null;
      } finally {
        await s.close();
      }
    },
    async list(query = {}) {
      const s = driver.session({ database });
      try {
        let cypher = 'MATCH (e:BookForgeEvent) RETURN e';
        const params = {};
        if (query.operation) {
          cypher += ' WHERE e.operation = $operation';
          params.operation = query.operation;
        }
        if (query.agent) {
          cypher += ' AND e.agent = $agent';
          params.agent = query.agent;
        }
        cypher += ' ORDER BY e.timestamp DESC LIMIT 100';
        const result = await s.run(cypher, params);
        return result.records.map(r => r.get('e').properties);
      } finally {
        await s.close();
      }
    },
    async stats() {
      const s = driver.session({ database });
      try {
        const result = await s.run('MATCH (e:BookForgeEvent) RETURN count(e) as total');
        const total = result.records[0].get('total');
        return { total_events: total, path: uri };
      } finally {
        await s.close();
      }
    },
    async close() {
      await driver.close();
    }
  };
}
