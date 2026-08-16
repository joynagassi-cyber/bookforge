# revision-loop — Detailed Reference

## Purpose
Iterate draft → targeted critique → revision without rewriting unrelated sections.

## Procedure

### Step 1: Load Target Chapter
- Read the manuscript chapter to revise
- Load the original chapter packet
- Load the quality findings for this chapter

### Step 2: Categorize Findings
Group findings by type:
- **Style**: AI slop, cliches, repetition, filler
- **Structure**: Pacing, beats, chapter flow
- **Voice**: Drift from voice profile
- **Continuity**: Cross-chapter inconsistencies
- **Facts**: Unverified claims, missing citations

### Step 3: Apply Targeted Revisions
For each category, apply specific fixes:

#### Style Fixes
- Replace AI slop patterns with concrete alternatives
- Swap cliches for fresh expressions
- Consolidate repetitive passages
- Remove filler content

#### Structure Fixes
- Add missing beats from outline
- Reorder sections for better flow
- Expand weak sections
- Trim overlong sections

#### Voice Fixes
- Apply voice profile constraints
- Adjust sentence length variation
- Fix tone inconsistencies
- Add signature patterns

#### Continuity Fixes
- Correct character name/description inconsistencies
- Fix timeline errors
- Reference unresolved threads
- Maintain terminology consistency

### Step 4: Validate Changes
- Run quality checks on revised chapter
- Verify no new issues introduced
- Check continuity with neighboring chapters
- Ensure voice consistency maintained

### Step 5: Save Revision Log
Write to `bookforge/state/revisions/chapter-N-revision-log.md`:

```markdown
## Revision Log: Chapter N
Date: 2024-01-15
Findings addressed: 12
Changes made:
- Replaced 3 cliches with fresh expressions
- Consolidated 2 repetitive paragraphs
- Fixed timeline inconsistency in paragraph 4
- Adjusted voice to match mentor profile
Findings remaining:
- 1 medium-severity AI slop pattern (flagged for human review)
```

## Output Contract
Return:
- `status`: 'completed' | 'needs_more_revisions' | 'failed'
- `result`: Revised chapter content
- `changes`: List of specific changes made
- `evidence`: Quality findings addressed
- `risks`: Any concerns about the revision
- `next_workflow`: 'chapter-qa' | 'release-gate' | null

## Revision Limits
- Maximum 3 revision cycles per chapter
- If still failing after 3 cycles, flag for human review
- Never silently override canonical artifacts
