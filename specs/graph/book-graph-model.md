# BookForge Book Graph

The graph is a projection of canonical artifacts, never the sole source of truth.

## Core nodes

`Book`, `Part`, `Chapter`, `Section`, `Scene`, `Character`, `Place`, `Organization`, `Concept`, `Theme`, `Claim`, `Source`, `Quote`, `Event`, `Artifact`, `Revision`, `Agent`, `Workflow`, `CatalogEntry`, `Issue`.

## Core edges

`CONTAINS`, `FOLLOWS`, `DEPENDS_ON`, `APPEARS_IN`, `LOCATED_IN`, `KNOWS`, `RELATED_TO`, `CONTRADICTS`, `SUPPORTS`, `CITES`, `DERIVED_FROM`, `IMPLEMENTS`, `VALIDATED_BY`, `FLAGS`, `SUPERSEDES`.

## Event rule

Agents never silently write graph state. They emit graph events tied to an artifact hash. The graph synchronizer validates the event, applies idempotently, and records provenance.
