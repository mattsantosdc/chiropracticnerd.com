# One-time Model identifier migration

This complete one-to-one map was recorded before applying the identifier migration. It covers all
16 existing Model entries, including the Framework entries. Each destination is unique across the
whole Model. `ARG-###` identifiers remain unchanged.

| Previous ID | Permanent ID | Unchanged content file under `src/content/model/` |
| --- | --- | --- |
| `F-001` | `M-001` | `framework/philosophy-science-art.md` |
| `F-002` | `M-002` | `framework/claim-discipline.md` |
| `F-003` | `M-003` | `framework/explicit-reasoning-empirical-testing.md` |
| `P-001` | `M-004` | `philosophy/functional-potential.md` |
| `P-002` | `M-005` | `philosophy/purpose.md` |
| `P-003` | `M-006` | `philosophy/care-beyond-symptoms.md` |
| `S-001` | `M-007` | `science/nervous-system-integration.md` |
| `S-002` | `M-008` | `science/state-dependent-neuromotor-function.md` |
| `S-003` | `M-009` | `science/neuromotor-opportunity.md` |
| `S-004` | `M-010` | `science/salient-perturbation.md` |
| `S-005` | `M-011` | `science/chiropractic-inputs.md` |
| `S-006` | `M-012` | `science/broader-functional-benefit.md` |
| `S-007` | `M-013` | `science/neural-mediation.md` |
| `A-001` | `M-014` | `art/assessment.md` |
| `A-002` | `M-015` | `art/chiropractic-application.md` |
| `A-003` | `M-016` | `art/reassessment-cycle.md` |

The allocation records this migration only. Numeric values and ranges carry no ordering,
hierarchy, domain, or inferential meaning. Keep IDs permanently assigned; use `domain` for grouping
and `order` for presentation order. IDs must not determine sorting or graph layout.

The migration applies to frontmatter, dependencies, related links, argument endpoints, prose,
repository examples, tests, and reviewed references. Claims, qualifiers, confidence, slugs,
domains, order values, dependency roles and notes, and argument structure are preserved apart
from ID substitutions. Old IDs in this table are historical lookup keys, not accepted aliases.
