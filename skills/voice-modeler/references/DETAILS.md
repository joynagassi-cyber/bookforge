# voice-modeler — Detailed Reference

## Purpose
Create a durable voice/style profile from author samples and explicit preferences.

## Procedure

### Step 1: Collect Voice Samples
Gather from:
- Author's previous writing samples
- Books the author loves
- Explicit preferences stated in the interview
- Target audience expectations

### Step 2: Analyze Voice Dimensions
For each dimension, provide a score (1-10):

| Dimension | Description |
|-----------|-------------|
| Formality | 1 = casual, 10 = academic |
| Warmth | 1 = distant, 10 = friendly |
| Complexity | 1 = simple, 10 = sophisticated |
| Humor | 1 = serious, 10 = playful |
| Directness | 1 = subtle, 10 = direct |

### Step 3: Define Voice Profile
Create `bookforge/state/voice-profile.md`:

```markdown
---
voice_id: primary
name: "The Mentor"
persona: experienced_guide
cadence: measured
sentence_shape: varied
lexical_profile: precise; concrete
relationship_to_reader: guides without condescension
---

## Voice Specifications

### Do
- Use concrete examples
- Explain complex ideas simply
- Address the reader directly
- Use short paragraphs
- Include real-world applications

### Don't
- Use jargon without explanation
- Be preachy or condescending
- Write long rambling sentences
- Use passive voice excessively
- Make unsubstantiated claims

### Signature Patterns
- Opening: Start with a question or surprising fact
- Transitions: Use "Here's the key insight" or "Now let's see how"
- Closing: End with an actionable takeaway
- Examples: Always include at least one concrete example per concept
```

### Step 4: Create Voice Bible
Generate `bookforge/state/style-bible.md` with:
- Preferred sentence lengths
- Vocabulary preferences
- Punctuation style
- Paragraph length guidelines
- Common phrases to use/avoid
- Tone examples (good vs bad)

### Step 5: Validate with Samples
Test the voice profile against:
- Author's existing writing (if available)
- Generated sample paragraph
- Reader feedback (if available)

## Voice Template Library

### Mentor (experienced guide)
- Measured cadence, precise concrete language
- Guides without condescension
- Use: Technical topics, skill-building, professional development

### Companion (trusted peer)
- Warm, conversational, accessible
- Walks alongside the reader
- Use: Personal stories, emotional topics, building trust

### Investigator (curious analyst)
- Probing, evidence-heavy, invites scrutiny
- Use: Research books, data analysis, critical thinking

### Storyteller (narrative guide)
- Rhythmic, sensory, immersive
- Use: Fiction, memoir, narrative nonfiction

### Teacher (clear instructor)
- Steady, structured, pedagogical
- Use: How-to guides, instructional content

### Witness (first-person experiencer)
- Irregular, authentic, reflective
- Use: Memoir, personal essays, experiential accounts

## Output Contract
Return:
- `status`: 'completed' | 'needs_samples' | 'failed'
- `result`: Voice profile document
- `changes`: New voice-profile.md created
- `evidence`: Samples analyzed
- `risks`: Voice consistency concerns
- `next_workflow`: 'draft-chapter' | null
