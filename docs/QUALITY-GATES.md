# Quality and Integrity Gates

## Quality dimensions

| Dimension | Validator family |
|---|---|
| Structure | developmental editor |
| Voice | voice auditor |
| Continuity | continuity auditor |
| Facts | fact checker |
| Citations | citation validator |
| Source provenance | source ledger |
| Similarity | originality auditor |
| AI slop | slop detector |
| Cliches | cliche detector |
| Repetition | repetition detector |
| Filler | filler detector |
| Genre fit | genre validator |
| Readability | style validator |
| Reader value | target-reader review |
| Packaging | design/package validator |
| Release | human gate |

## Severity

- CRITICAL: blocks release and usually blocks downstream workflow
- HIGH: blocks release unless explicitly waived
- MEDIUM: revision expected
- LOW: advisory

## Anti-bypass rule

A validator may report PASS only for its own domain.

No validator can certify the complete manuscript.

## Human gate

Human review must answer:

1. Is the book faithful to the author's intent?
2. Does it have distinctive value?
3. Does it sound intentional rather than mechanically generated?
4. Are the risk findings understood?
5. Is the manuscript acceptable for the intended readership?
6. Are packaging and claims appropriate?

## AI-slop policy

The objective is not detector evasion.

The objective is better writing:

- specificity;
- concrete evidence;
- variation;
- authentic voice;
- meaningful transitions;
- non-generic observations;
- controlled rhetorical repetition;
- intentional metaphor.

## Similarity policy

Similarity is not synonymous with plagiarism.

The system must show:

- matched span;
- source;
- similarity measure;
- contextual reason;
- attribution state;
- reviewer decision.

## Regression

Every corrected issue can become:

- a regression fixture;
- a catalog rule;
- a validator test;
- a project-specific preference.
