# Scale-Adaptive Execution

BookForge uses the smallest sufficient workflow.

## Tiny
Single local correction.
No outline rebuild.

## Small
Bounded rewrite or polishing.
Load local section + style profile.

## Medium
New chapter/section.
Load chapter dependencies + outline node + style + required evidence.

## Large
Structural change, packaging or publication.
Reconcile canonical artifacts and run impact analysis.

## Book-scale
New book or major rewrite.
Run upstream specification, research, planning and readiness gates.

## Override

A user can explicitly request a deeper workflow than the router selects.

The system must not silently select a shallower workflow when a change is classified as structural.
