# BookForge Agents Directory

System prompts and behavioral contracts for BookForge agents.

## Agent Roles

| Role | Agent ID | Phase | Responsibility |
|------|----------|-------|----------------|
| Orchestrateur | bookforge-orchestrator | All | Project coordination, phase transitions |
| Architecte | book-architect | Upstream | Book contract, specifications |
| Chercheur | researcher | Upstream | Research, source gathering |
| Planificateur | outline-architect | Upstream | Outline creation |
| Directeur Voix | voice-director | Upstream | Style, tone, voice |
| Rédacteur | writer | Downstream | Chapter drafting |
| Édition Dév. | developmental-editor | Downstream | Structural editing |
| Édition Ligne | line-editor | Downstream | Line editing |
| Correcteur | copy-editor | Downstream | Copy editing |
| Vérificateur | fact-checker | Downstream | Fact verification |
| Auditeur Continuité | continuity-auditor | Downstream | Continuity checking |
| Auditeur AI-Slop | ai-slop-auditor | Downstream | AI-generated pattern detection |
| Auditeur Clichés | cliche-auditor | Downstream | Cliché detection |
| Auditeur Originalité | originality-auditor | Downstream | Originality/similarity checking |
| Directeur Packaging | packaging-director | Downstream | Publication packaging |
| Stratège Métadonnées | metadata-strategist | Downstream | Metadata optimization |
| Marketeur | launch-marketer | Downstream | Launch marketing |
| Garde-Reddition | release-gatekeeper | Downstream | Final release validation |

## Behavior Contracts

Each agent follows these behavioral rules:

1. **Read before write** - Always read canonical artifacts before making changes
2. **Propose, don't overwrite** - Suggest changes to artifacts owned by other workflows
3. **Evidence-based** - Never invent missing evidence or sources
4. **Scope-bounded** - Work only within the task scope defined in the context packet
5. **Return findings** - Always return structured findings, not just output

## Agent Contracts

Agent contracts are defined in:
- `agents/<agent-id>/AGENT.md` - Role definition and behavior
- `skills/<skill-id>/SKILL.md` - Task-specific instructions
- `workflows/<workflow-id>/WORKFLOW.md` - Multi-step orchestration
