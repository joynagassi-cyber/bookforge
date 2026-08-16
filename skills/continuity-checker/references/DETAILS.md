# continuity-checker — Detailed Reference

## Purpose
Audit characters, terminology, chronology, and cross-chapter state to ensure consistency.

## Procedure

### Step 1: Load Continuity State
Read from:
- `bookforge/state/continuity.md` (if exists)
- `bookforge/state/book-contract.md` (for character list)
- All previous chapter manuscripts

### Step 2: Check Character Consistency
For each character mentioned in the current chapter:
- [ ] Name spelling matches previous mentions
- [ ] Physical description is consistent
- [ ] Personality traits are consistent
- [ ] Relationships match previous chapters
- [ ] Knowledge/state is consistent (what they know/remember)

### Step 3: Check Timeline Consistency
- [ ] Dates and times match previous chapters
- [ ] Sequence of events is logical
- [ ] Character ages are consistent
- [ ] Season/weather references match

### Step 4: Check Terminology Consistency
- [ ] Technical terms defined consistently
- [ ] Acronyms expanded correctly
- [ ] Fictional terms (places, objects) named consistently
- [ ] Tone/register matches chapter 1

### Step 5: Check Plot Thread Consistency
- [ ] Unresolved threads from previous chapters are referenced
- [ ] No plot holes introduced
- [ ] Foreshadowing is consistent
- [ ] Character motivations remain clear

### Step 6: Generate Continuity Report
Create/update `bookforge/state/continuity.md`:

```yaml
last_updated: "2024-01-15T10:00:00Z"
characters:
  - name: "John Smith"
    first_seen: "ch-001"
    description: "Protagonist, 35, detective"
    current_state: "Investigating the murder"
terminology:
  - term: "The Agency"
    defined_in: "ch-001"
    meaning: "Federal investigation bureau"
threads:
  - id: "murder-investigation"
    status: "active"
    last_mentioned: "ch-005"
    resolution: null
violations:
  - chapter: "ch-006"
    type: "character"
    description: "John's eye color changed from brown to blue"
    severity: "high"
```

## Output Contract
Return:
- `status`: 'pass' | 'concerns' | 'fail'
- `result`: Continuity report
- `changes`: Any continuity state updates
- `evidence`: Cross-references to previous chapters
- `risks`: Potential continuity issues
- `next_workflow`: 'revision-loop' | null

## Warnings
- Don't flag minor inconsistencies (e.g., "the chair was red" vs "the sofa was red")
- Distinguish between character development and continuity errors
- Note foreshadowing that pays off later (not a violation)
