/**
 * Enhanced Chapter Generator Skill
 *
 * Generates chapters using genre-specific patterns from catalogs.
 * Each genre has its own structural template and voice constraints.
 */

---
name: "chapter-generator"
description: "Generate a chapter from an approved chapter packet using genre-specific patterns."
version: "1.0.0"
triggers:
  - "chapter-generator"
  - "draft chapter"
  - "write chapter"
scope: "task-bounded"
owner: "bookforge"
genre_aware: true
---

# chapter-generator

## Purpose
Generate a complete chapter from an approved chapter packet, following genre-specific structural patterns and voice constraints.

## Activation
Activate only when the task matches this skill's responsibility — drafting a new chapter or rewriting an existing one.

## Context Requirements
Load in order:
1. Current task packet (from context engine)
2. Book contract (`bookforge/state/book-contract.md`)
3. Outline node for this chapter (`bookforge/state/outline/chapter-N.yaml`)
4. Style bible (`bookforge/state/style-bible.md`)
5. Voice profile (`bookforge/state/voice-profile.md`)
6. Relevant chapter patterns from `catalogs/chapter-patterns.csv`
7. Previous chapter manuscript for continuity (`manuscript/chapter-N-1.md`)

## Procedure

### Step 1: Validate Prerequisites
- [ ] Chapter packet exists and is valid
- [ ] Outline node has required fields (title, goal, beats)
- [ ] Style bible and voice profile are loaded
- [ ] Previous chapter exists (if not chapter 1)

### Step 2: Select Chapter Pattern
Based on the book's genre, select the appropriate pattern:

| Genre | Pattern ID | Structure |
|-------|------------|-----------|
| Fiction (general) | ch-001 | scene → complication → choice → consequence |
| Thriller | ch-004 | setup → reversal → escalation → hook |
| Nonfiction (business) | ch-001 | problem → mechanism → example → application |
| Nonfiction (research) | ch-002 | question → evidence → interpretation → implication |
| Memoir | ch-005 | event → sensory detail → reflection → meaning |
| Devotional | ch-006 | text → reflection → application → response |

**Action:** Load the pattern from `catalogs/chapter-patterns.csv` and apply it to the chapter outline.

### Step 3: Generate Prose
Write the chapter following these constraints:

1. **Voice**: Apply voice profile constraints (tone, sentence shape, lexical profile)
2. **Structure**: Follow the selected chapter pattern exactly
3. **Continuity**: Reference events/characters from previous chapters
4. **Beats**: Hit each beat from the outline node
5. **Length**: Target the word count from the packet constraints

**Voice Examples:**
- `mentor`: Measured cadence, precise concrete language, guides without condescension
- `companion`: Warm, short-medium sentences, accessible personal tone
- `investigator`: Probing questions, evidence-heavy, invites scrutiny
- `storyteller`: Rhythmic cadence, sensory details, immersive narrative

### Step 4: Apply Quality Filters
Before finalizing, check:
- [ ] No AI slop patterns (from `catalogs/ai-slop-patterns.csv`)
- [ ] No cliches (from `catalogs/cliches.csv`)
- [ ] No excessive repetition
- [ ] Continuity with previous chapters maintained
- [ ] Voice consistency maintained

### Step 5: Persist Output
Write to: `manuscript/chapter-N.md`

Include metadata header:
```markdown
---
chapter: N
title: "Chapter Title"
genre: [from contract]
voice: [from voice profile]
pattern: [pattern ID used]
word_count: [actual count]
generated_at: [timestamp]
---

# Chapter N: Title

[Chapter content here...]
```

## Invariants
- Do not invent facts not in the outline or contract
- Preserve chapter voice consistency
- Never overwrite existing manuscript without approval
- Surface uncertainty explicitly

## Output Contract
Return:
- `status`: 'completed' | 'needs_revision' | 'failed'
- `result`: Chapter content or error message
- `changes`: List of artifacts created/modified
- `evidence`: Sources used for generation
- `risks`: Any continuity or quality concerns
- `next_workflow`: 'chapter-qa' | 'revision-loop' | null

## Progressive Disclosure
Detailed reference material is in `references/DETAILS.md`.
Load additional resources only when the task requires them.
