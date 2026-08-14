# Security and Integrity Notes

BookForge may process manuscripts, unpublished research and personally identifiable metadata.

Implementations should:

- keep private project data local by default;
- make external search/corpus calls explicit;
- preserve provenance of retrieved material;
- avoid silently uploading manuscripts to third-party services;
- log external tool calls when provenance matters;
- expose human approval boundaries.

Never treat AI-generated originality or authorship detection as definitive evidence.
