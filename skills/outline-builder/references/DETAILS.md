# outline-builder — Detailed Reference

## Purpose
Create a chapter-by-chapter outline from the book contract using genre-specific patterns.

## Procedure

### Step 1: Load Book Contract
Read `bookforge/state/book-contract.md` and extract:
- Title and subtitle
- Genre and subgenre
- Target audience
- Central promise (what the reader gets)
- Tone and voice
- Target length (total words, per chapter)

### Step 2: Determine Structure Type
Based on genre, select the structural approach:

| Genre | Structure | Example |
|-------|-----------|---------|
| Self-help | Problem → Mechanism → Application | "The 5 Principles of Productivity" |
| Business | Case Study → Framework → Implementation | "How Company X Scaled to $100M" |
| Thriller | Setup → Inciting Incident → Escalation → Climax | Three-act structure |
| Memoir | Chronological with thematic threads | "Growing up in [Place]" |
| Research | Question → Evidence → Analysis → Implication | Academic monograph |
| Devotional | Daily readings with reflection | 30-day spiritual journey |

### Step 3: Generate Outline Nodes
For each chapter, create a node with:

```yaml
chapter_id: ch-001
number: 1
title: "The Hook"
goal: "Establish the problem and why it matters"
beats:
  - "Open with a compelling scene or statistic"
  - "Introduce the central problem"
  - "Make the promise explicit"
target_words: 3000
voice: primary
dependencies: []
genre_specific:
  pattern: ch-001  # from chapter-patterns.csv
  warnings:
    - "avoid generic promise"
```

### Step 4: Ensure Progression
Each chapter must:
1. Build on previous chapters (dependencies)
2. Advance the central promise
3. Introduce new information or develop existing threads
4. End with a clear transition to the next chapter

### Step 5: Validate Against Contract
- Total word count matches target
- Each chapter has a clear goal
- Structure follows genre conventions
- No redundant chapters
- All promised content is covered

### Step 6: Save Outline
Write to `bookforge/state/outline/outline.yaml`:

```yaml
version: "1.0.0"
generated_at: "2024-01-15T10:00:00Z"
genre: "nonfiction-business"
pattern: "problem-mechanism-application"
chapters:
  ch-001:
    title: "The Hidden Cost of Busy"
    goal: "Hook reader with relatable problem"
    target_words: 2500
  # ... more chapters
metadata:
  total_chapters: 12
  estimated_word_count: 36000
  estimated_reading_time: "3 hours"
```

## Output Contract
Return:
- `status`: 'completed' | 'needs_revision' | 'failed'
- `result`: Outline structure (YAML or markdown)
- `changes`: List of outline nodes created/modified
- `evidence`: Source patterns used
- `risks`: Any structural concerns
- `next_workflow`: 'draft-chapter' | 'voice-profile' | null

## Warnings
- Don't make chapters too long or too short
- Ensure variety in chapter structure
- Leave room for discoveries during drafting
- Don't over-plan — outline is a guide, not a contract
