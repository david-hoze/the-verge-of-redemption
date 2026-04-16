# Claude Code Instructions: Ship EDEN/Adam for Public GitHub Release

**Context:** EDEN/Adam is a local-first, graph-conditioned AI runtime with two implementations: a Python reference and an Idris2 port with 55 machine-checked proofs. The project needs to become publicly accessible on GitHub so that developers, community builders, and thinkers worldwide — especially in the Global South — can understand, use, and adapt it. The goal is to make a system that lets any community build an AI whose values come from their own traditions, running on their own hardware, with mathematical guarantees about its behavior.

**Your job:** Fill every gap between the current state and a compelling, usable public repository. Work in the actual repository. Read existing files before writing new ones. Never invent capabilities that don't exist — this project's integrity depends on honest documentation.

**Important:** Before each task, read the relevant existing files to understand what actually exists. The project is fanatically honest about what it can and cannot do. Maintain that standard in everything you write.

---

## TASK 1: README.md (The Front Door)

**Priority: CRITICAL — do this first.**

The current README is technical and internal-facing. Replace it with a README that serves everyone who lands on the GitHub page. It must do four things in under two minutes of reading.

### Instructions:

1. First, read these files to understand the current state:
   - `README.md` (current)
   - `docs/PROJECT_CHARTER.md`
   - `IDRIS_IMPLEMENTATION_STATUS.md` (if present, otherwise reference the Idris implementation status provided in this document)
   - `docs/CANONICAL_ONTOLOGY.md`
   - `docs/TURN_LOOP_AND_MEMBRANE.md`

2. Write a new `README.md` with this structure:

**Opening paragraph (3 sentences max):** What Adam is, in language a non-developer can understand. Something like: "Adam is an AI runtime that keeps its values in a graph you control, not in weights trained by a corporation. It runs on your hardware. Every decision it makes is recorded, reversible, and yours."

**Section: "Why This Exists" (5-8 sentences):** The problem statement. AI governance frameworks worldwide have no shared theory of human flourishing. The fairness impossibility theorem is proven and unresolved. Ethics boards collapse. Alignment datasets show 30% annotator disagreement. 470+ AI ethics documents globally have voices from the Global South largely absent. Meanwhile, the cost of capable AI has collapsed — processing a million words went from $20 to $0.07 in two years. The gap is not compute anymore. It's the absence of a value architecture that communities can own, embed their traditions in, and verify. Adam is a working implementation of that missing architecture.

**Section: "What It Does" (bullet points, each one sentence):**
- Runs a complete AI conversation loop locally — no cloud required
- Stores identity in a persistent graph, not in model weights — swap the model, keep the values  
- Applies a post-generation membrane that enforces community-defined constraints
- Accumulates "regard" — durable selection pressure — for ideas that matter to you, through your feedback
- Records every mutation in an attributable measurement ledger — inspectable, reversible, permanent
- Supports tradition-specific modules (demonstrated with Tanakh/Hebrew hermeneutics)
- The Idris2 implementation verifies 55 runtime invariants at compile time — the system literally cannot be built if the guarantees are violated

**Section: "Two Implementations":**
Brief table comparing Python (reference, full-featured, requires Python environment) vs Idris2 (machine-verified, 1.3MB native binary, 55 proofs, some features still in progress). Link to `IDRIS_IMPLEMENTATION_STATUS.md` for details.

**Section: "Quick Start" — three paths:**

Path A: "Try it now" (Idris2 binary, mock backend, no API key needed)
```bash
cd eden-idris && ./build.sh
./build/exec/eden --repl --backend mock
```
Explain what they'll see: a conversation where the graph grows, the membrane acts, and they can give feedback.

Path B: "Use with Claude" (Idris2 binary, Claude CLI backend)
```bash
# Requires: claude CLI installed and authenticated
./build/exec/eden --tui --backend claude
```

Path C: "Python reference implementation"
```bash
# Full-featured version with observatory, MLX support, etc.
pip install -r requirements.txt
python -m eden.main --tui
```

**Section: "Architecture in One Diagram":**
Include a plain-text diagram of the turn loop:
```
Input → Retrieve/Assemble → Generate → Membrane → Feedback → Graph Update
  ↑                                                              |
  └──────────── Regard (durable selection pressure) ─────────────┘
```

**Section: "For Builders From Other Traditions":**
2-3 sentences pointing to the Tanakh module as a worked example, and to `docs/TRADITION_EMBEDDING_GUIDE.md` (which you'll create in Task 5) for how to build your own.

**Section: "Project Structure":**
Brief directory map showing where the key things live in both implementations.

**Section: "Documentation":**
Links to all the docs you'll create, organized as:
- Architecture: whitepaper, turn loop spec, ontology, membrane spec
- Guides: getting started, tradition embedding, contributing
- Context: "Why This Matters" essay, implementation status

**Section: "License":**
Whatever the current license is, or a note that it needs to be chosen.

**Tone:** Direct, honest, no hype. This project's credibility comes from saying exactly what it does and doesn't do. The README should feel like talking to a serious builder who respects your time.

---

## TASK 2: docs/WHY_THIS_MATTERS.md (The Philosophical Bridge)

**Priority: HIGH**

This document connects the engineering to the global context. It's the piece that makes someone understand why this project exists, not just what it does.

### Instructions:

1. Read these project knowledge files to understand the intellectual context (search the project knowledge for these topics):
   - Western liberalism's blind spots and AI design flaws
   - The Operating System AI Governance Is Missing
   - The fairness impossibility theorem
   - Ancient Law for Artificial Minds (Halacha and AI alignment)

2. Write `docs/WHY_THIS_MATTERS.md` covering:

**The Governance Gap (with data):**
- The fairness impossibility theorem: Chouldechova (2017) and Kleinberg et al. (2017) proved that when base rates differ across groups, no imperfect algorithm can simultaneously achieve equal predictive accuracy and equal error rates. This is a theorem, not a limitation.
- No major regulatory framework — not the EU AI Act, not NIST — explicitly addresses this impossibility or provides guidance on choosing between competing fairness definitions.
- OpenAI's board crisis: 95% of employees threatened to resign. Neither side was wrong by liberal democratic standards. The market resolved what ethics could not.
- Google's AI advisory council lasted 9 days before dissolution.
- RLHF annotator-expert agreement sits at ~70%. Nearly a third of alignment decisions are contested.
- A study of 470+ AI ethics documents found Global South voices largely absent.
- GPT models tested against World Values Survey data from 112 countries exhibit values resembling English-speaking and Protestant European countries.

**The Value Vacuum:**
- Western liberal democracy excels at procedural protections but has deliberately evacuated substantive commitments about human purpose.
- This was a feature (Rawlsian neutrality between comprehensive doctrines) that has become a critical bug for AI governance.
- When there's no shared vision of flourishing, algorithms optimize for engagement. When consent is procedural, checkboxes authorize surveillance capitalism. When fairness has no agreed definition, the impossibility theorem privatizes the choice.

**The Global South Reality:**
- 40%+ of ChatGPT's global web traffic comes from middle-income countries.
- India alone has 100 million weekly active users.
- The World Bank's "Small AI" concept: affordable, mobile-first, offline-capable, context-specific.
- 267,000 annual deaths from counterfeit antimalarials vs. Western anxiety about essay-writing chatbots.
- The Delhi Declaration (February 2026): 92 countries endorsed "impact" over "safety" as the frame. Both US and China signed.
- AI's linguistic map serves ~20 of ~7,000 languages well. Hindi (500M speakers) is classified as low-resource.

**What This Project Does About It:**
- Adam separates the inference surface from the identity substrate. The model generates; the graph holds values. This means a community's values accumulate through use, not through RLHF training.
- The membrane is a post-generation governance surface that any community can control. It's where the Oven of Akhnai principle lives in code: human interpretive authority operating within foundational constraints.
- The regard mechanism is how a tradition's priorities emerge over time — through durable selection pressure applied by the people who actually use the system.
- The Idris2 proofs make certain classes of failure structurally impossible. For communities that cannot rely on regulators or courts, mathematical guarantees are more reliable than procedural ones.
- The measurement ledger implements the Talmudic principle of preserving dissenting views: every mutation is recorded, every revert is itself a new event, the history of intervention is permanently inspectable.
- Local-first means compute sovereignty. A 1.3MB binary on local hardware, no cloud dependency, no corporate permission required.

**Traditions as Architecture:**
- The Tanakh module demonstrates that a tradition's interpretive tools can be first-class computational objects.
- The same pattern works for Ubuntu relational ontology, Confucian role-based obligations, Islamic jurisprudential hierarchies, or any tradition that has a substantive account of human purpose.
- The field doesn't need to adopt any specific theology. It needs to examine the *methodology*: case-based reasoning, hierarchical priority structures, graduated liability, preservation of minority opinions, the distinction between compliance and moral responsibility.

**Closing:** The question is not whether AI will be governed by values. It already is — by the values of whoever controls the training data, the RLHF pipeline, and the deployment infrastructure. The question is whether those values will be chosen deliberately by the communities affected, embedded in verifiable architecture, and preserved with attributable provenance. This project is a working demonstration that the answer can be yes.

**Tone:** Serious, evidence-based, no sentimentality. Every claim backed by specific data or specific code. This is not a manifesto — it's a technical argument with philosophical depth.

---

## TASK 3: docs/GETTING_STARTED.md (The First Ten Minutes)

**Priority: HIGH**

A step-by-step guide that gets someone from zero to a meaningful interaction with the system.

### Instructions:

1. Read the build system files:
   - `eden-idris/build.sh` or equivalent
   - `eden-idris/Main.idr` (entry point, CLI args)
   - `eden-idris/src/Eden/Loop.idr` (REPL loop)
   - `eden-idris/src/Eden/TUI.idr` (TUI)
   - The Python `README.md` and `requirements.txt`

2. Write `docs/GETTING_STARTED.md` with:

**Prerequisites:**
- For Idris2 binary: GCC, make (for building from source), or direct binary download if available
- For Python: Python 3.10+, pip, virtualenv
- Optional: Claude CLI (for Claude backend), MLX (for local models in Python version)

**Path 1: Idris2 Quick Start (recommended for first experience)**

Walk through:
```bash
# Clone
git clone <repo-url>
cd eden-idris

# Build (produces a 1.3MB native binary)
./build.sh

# Run with mock backend (no API key needed)
./build/exec/eden --repl --backend mock
```

Then guide the interaction:
```
You: Tell me about yourself.
[Adam responds — explain what they're seeing: the model generating, the membrane acting]

You: /feedback accept "Good foundation"
[Explain: this accept event just created durable selection pressure in the graph.
The text "Good foundation" is stored as the explanation. On future turns,
retrieval will be influenced by this feedback.]

You: What matters most to you?
[Explain: the retrieval step just assembled the active set, influenced by
the regard from their feedback. The graph is shaping the response.]

You: /export
[Explain: this writes the full graph state as JSON. They can inspect every
meme, edge, memode, feedback event, and measurement entry.]
```

**Path 2: Idris2 with Claude**
```bash
# Requires Claude CLI installed and authenticated
./build/exec/eden --tui --backend claude
```
Brief walkthrough of the TUI layout: dialogue panel, aperture panel, hum panel, composer.

**Path 3: Python Reference**
```bash
cd eden
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m eden.main --tui
```
Note what's available here that isn't in Idris2 yet: observatory web server, MLX backend, full TUI modals.

**Understanding What Just Happened:**
After the guided interaction, explain the architecture they just experienced:
- The **turn loop**: their input → retrieval assembled relevant graph context → model generated → membrane cleaned and constrained the output → their feedback updated the graph
- The **graph**: every turn created memes (persistent units). Feedback created edges and regard updates. The graph is now different from when they started.
- The **membrane**: the raw model output was processed. Scaffold headings were stripped. The operator-facing response is the membrane result, not the raw generation.
- The **regard**: their "accept" feedback didn't just note satisfaction. It propagated durable selection pressure across related graph nodes, with 0.85x attenuation per hop. Future retrieval will be shaped by this.
- The **export**: the JSON file they created contains the complete graph state — every meme, edge, feedback event, session record, and measurement entry. This is the identity substrate. It's theirs.

**Next Steps:**
- Read `docs/ARCHITECTURE_OVERVIEW.md` for the full technical story
- Read `docs/WHY_THIS_MATTERS.md` for the philosophical context  
- Read `docs/TRADITION_EMBEDDING_GUIDE.md` to build your own tradition module
- Explore the observatory: `./build/exec/eden --export` and open the JSON

---

## TASK 4: docs/ARCHITECTURE_OVERVIEW.md (The Technical Map)

**Priority: MEDIUM**

A clear, readable architectural overview that serves as the entry point to the technical documentation. Not a replacement for the whitepaper — a map to it.

### Instructions:

1. Read:
   - `article.md` (the whitepaper — read fully, it's the authoritative source)
   - `docs/TURN_LOOP_AND_MEMBRANE.md`
   - `docs/CANONICAL_ONTOLOGY.md`
   - `docs/REGARD_MECHANISM.md`
   - `docs/MEASUREMENT_EVENT_MODEL.md`
   - `docs/OBSERVATORY_SPEC.md`
   - `docs/INFERENCE_PROFILES.md`
   - `docs/GRAPH_SCHEMA.md`

2. Write `docs/ARCHITECTURE_OVERVIEW.md`:

**Design Principles (one paragraph each):**
- **Local-first:** The runtime is tied to a local model and local SQLite persistence. No cloud dependency. The base model is an inference surface; identity lives in the graph.
- **Externalized identity:** Adam's continuity is maintained by the graph, feedback events, regard, membrane traces, and measurement ledger — not by model weights. Swap the model, keep the identity.
- **Direct loop (no hidden governor):** The turn loop is input → retrieve/assemble → generate → membrane → feedback → graph update. There is no hidden planner, no pre-generation governor, no recursive decomposition. This is an active constitutional boundary, not a missing feature.
- **Honest instrumentation:** Every claim about the system is backed by code, tests, or runtime traces. The whitepaper refuses to inherit claims from prior drafts that the current code doesn't sustain. Synthetic figures are labeled synthetic. Missing capabilities are documented as missing.

**Core Concepts (one subsection each):**
For each concept, give: one-sentence definition, what it IS (positive example), what it IS NOT (near miss), and which file defines it.

- **Meme**: First-class persistent graph unit. IS: a feedback-derived behavior meme with graph relations. IS NOT: a social media meme or a loose metaphor. Defined in `docs/CANONICAL_ONTOLOGY.md`.
- **Memode**: Derived second-order structure from 2+ behavior-domain memes plus qualifying support subgraph. IS: an audited behavior assembly. IS NOT: a semantic cluster label. Requires 2+ members — enforced at the type level in Idris2.
- **Regard**: Durable selection pressure over persistent graph objects. IS: a graph item strengthened by feedback and retrieval pressure over time. IS NOT: prompt-time salience or one-off relevance. Defined in `docs/REGARD_MECHANISM.md`.
- **Active Set**: Bounded retrieval and prompt-compilation slice for a turn. IS: the runtime's current working slice under budget constraints. IS NOT: the full identity. IS NOT: Adam itself.
- **Membrane**: Post-generation control surface. IS: sanitization + constraint + persistent trace effects. IS NOT: a planner, governor, or cognition layer.
- **Feedback Events**: Explicit operator verdicts (accept/reject/edit) with required explanations. These are performative utterances (Austin) — they change persistent state only when felicity conditions are met.
- **Measurement Ledger**: Structured persistence surface recording mutations with before-state, proposed-state, committed-state, and reversion linkage. Reversion is itself a new event. History is never silently mutated.
- **Hum**: Bounded continuity artifact. IS: timestamped, path-addressable export. IS NOT: input to generation, hidden inner voice, planner residue.

**The Turn Loop (with diagram):**
```
┌─────────────────────────────────────────────────────────┐
│                    ADAM v1 TURN LOOP                     │
│                                                         │
│  Operator Input                                         │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────┐   Regard + Query    ┌──────────┐          │
│  │Retrieve │◄───────────────────►│  Graph   │          │
│  │& Assemble│                    │  Store   │          │
│  └────┬────┘                     └────▲─────┘          │
│       │ Active Set                    │                  │
│       ▼                               │                  │
│  ┌─────────┐                         │                  │
│  │Generate │  (local model or CLI)   │                  │
│  └────┬────┘                         │                  │
│       │ Raw output                   │                  │
│       ▼                               │                  │
│  ┌─────────┐                         │                  │
│  │Membrane │  Strip, constrain,      │                  │
│  └────┬────┘  persist traces         │                  │
│       │ Cleaned response             │                  │
│       ▼                               │                  │
│  ┌─────────┐                         │                  │
│  │Feedback │  accept/reject/edit     │                  │
│  │         │  with explanation ───────┘                  │
│  └─────────┘  (updates regard, edges, memes)            │
└─────────────────────────────────────────────────────────┘
```

**The Proof Architecture (Idris2 only):**
Explain that the Idris2 build includes 55 machine-checked theorems across 18 sections. These verify at compile time that:
- The turn loop follows the correct ordering
- Memode materialization requires 2+ behavior-domain members
- Feedback propagation respects attenuation bounds
- Phantom-tagged IDs prevent cross-type confusion
- Core pipeline functions terminate

Explain why this matters: for communities deploying AI in healthcare, credit, agriculture — mathematical proof that certain failure classes are impossible is stronger than any audit document.

**The Observatory:**
Explain the browser-based measurement workbench (Python only). Its three roles: read surface, comparison/preview surface, bounded mutation surface. The authority boundary between browser-local view state and persistent mutation. Static vs live mode.

Note: Idris2 has `--export` for static JSON but no live server yet.

**Implementation Comparison Table:**
Reference `IDRIS_IMPLEMENTATION_STATUS.md` for the full breakdown.

**Links to detailed specs:**
Point to every doc in `docs/` with a one-sentence description of each.

---

## TASK 5: docs/TRADITION_EMBEDDING_GUIDE.md (The Replication Pattern)

**Priority: HIGH — this is the document that enables the revolution.**

### Instructions:

1. Read the Tanakh module:
   - `eden-idris/src/Eden/Tanakh.idr` (or wherever the Tanakh module lives)
   - The Python Tanakh implementation for comparison
   - `docs/CANONICAL_ONTOLOGY.md` (to understand how tradition modules connect to the graph)

2. Write `docs/TRADITION_EMBEDDING_GUIDE.md`:

**Opening:** "Adam is designed so that any community can embed their own tradition's interpretive tools, value hierarchies, and reasoning patterns as first-class components of the runtime. This guide shows you how, using the Tanakh/Hebrew module as a worked example."

**What a Tradition Module Does:**
- Provides domain-specific text analysis (like gematria, notarikon, temurah for Hebrew)
- Defines value priority hierarchies that the membrane can enforce
- Shapes how the graph organizes knowledge according to the tradition's categories
- Optionally provides hermeneutic tools that can be invoked during the turn loop

**The Tanakh Module as Pattern:**

Walk through each component:
- **Text analysis functions:** Gematria (numerical values), notarikon (acronym extraction), temurah (cipher). Show how these are pure, total functions. No side effects, guaranteed termination.
- **Integration points:** How the Tanakh module connects to: document ingestion (Hebrew text gets analyzed during ingest), the graph (Hebrew analysis results become memes with domain-specific edges), the active set (tradition-specific retrieval can prioritize tradition-relevant material), the export (Tanakh sidecar in the export family).
- **The purity constraint:** Everything in the tradition module should be pure functions. The runtime calls them; they return results. They don't reach into the graph directly. This keeps them portable, testable, and composable.

**Building Your Own Tradition Module:**

Step-by-step template:

```
Step 1: Define your tradition's text analysis functions
  - What are the interpretive operations your tradition applies to text?
  - Examples: Arabic root extraction for Islamic jurisprudence, 
    relational-entity identification for Ubuntu philosophy,
    role-relationship mapping for Confucian ethics
  - Write them as pure functions: Text -> AnalysisResult

Step 2: Define your tradition's value priorities
  - What is the hierarchy when obligations conflict?
  - Example from Halacha: pikuach nefesh (saving life) overrides nearly everything;
    biblical obligations outweigh rabbinic ones; frequent obligations precede 
    infrequent ones; passive non-compliance < active violation
  - Express these as data types or priority orderings the membrane can reference

Step 3: Define your tradition's graph categories
  - How does your tradition organize knowledge?
  - What kinds of edges are meaningful?
  - What qualifies as a "behavior" vs "information" in your framework?

Step 4: Wire into the runtime
  - Register analysis functions for document ingestion
  - Register priority hierarchies for membrane rules
  - Register graph categories for the ontology
  - Add export sidecar for tradition-specific data

Step 5: Write proofs (Idris2 only)
  - What invariants should your tradition module guarantee?
  - Example: "Priority ordering is total" (every pair of obligations is comparable)
  - Example: "Analysis functions are pure and total" (guaranteed termination)
```

**Worked Example: Skeleton of an Ubuntu Tradition Module:**

Show a hypothetical but concrete skeleton:
```
-- Ubuntu.idr (hypothetical)
-- Core concept: identity is relational, not individual

-- Analysis: identify relational entities in text
identifyRelations : Text -> List (Entity, Entity, RelationType)

-- Priority: communal welfare > individual autonomy when they conflict
-- (the opposite of the Western liberal default)
data UbuntuPriority = CommunalWelfare | HarmonyPreservation | ElderWisdom | IndividualExpression

priorityOrder : UbuntuPriority -> UbuntuPriority -> Ordering

-- Graph integration: edges represent relationships between people/communities,
-- not just logical connections between ideas
data UbuntuEdge = KinshipEdge | ObligationEdge | ReciprocityEdge | CommunalEdge
```

**What This Enables:**
When a community builds their tradition module and loads it into Adam, the runtime doesn't just process their language. It organizes knowledge according to their tradition's categories, resolves conflicts according to their priority hierarchy, and makes decisions through their interpretive framework. The model provides generation capability. The tradition module provides direction.

---

## TASK 6: CONTRIBUTING.md (How to Help)

**Priority: MEDIUM**

### Instructions:

Write `CONTRIBUTING.md` covering:

**Ways to Contribute (ordered by accessibility):**

1. **Use it and report what happens.** The most valuable contribution is honest feedback from real use. File issues describing what worked, what didn't, and what confused you.

2. **Build a tradition module.** Follow `docs/TRADITION_EMBEDDING_GUIDE.md`. Even a partial implementation — just the text analysis functions, or just the priority hierarchy — is valuable. The project needs worked examples beyond the Tanakh module.

3. **Improve documentation.** If something in the docs confused you, fix it. The standard is: a developer in Addis Ababa with good English and no prior exposure to this project should be able to understand it.

4. **Port missing features from Python to Idris2.** The `IDRIS_IMPLEMENTATION_STATUS.md` file tracks every gap. The highest-priority gaps are marked. Each gap has enough specification in the Python code and docs to guide implementation.

5. **Add language support.** The concept extraction currently works for English and Hebrew. Every additional language makes the system accessible to another community.

6. **Write proofs.** The Idris2 build has 55 theorems. More are possible. If you can prove a property that the current code doesn't verify, that's a high-value contribution.

**Development Standards:**
- The project is fanatically honest about what it can and cannot do. Never claim a capability that isn't implemented and tested.
- The whitepaper treats prose as executable specification. If you add a feature, the docs must be updated in the same PR.
- Synthetic data is always labeled synthetic. Observed data is always labeled observed. Never blur this boundary.
- The membrane, measurement ledger, and feedback system are the governance architecture. Changes to them require extra scrutiny because they carry the trust contract.

**Code Standards:**
- Idris2: pure functions where possible, total where possible, dependent types for invariants
- Python: tests required, docstrings required, type hints preferred
- Both: the turn loop invariant (retrieve → assemble → generate → membrane → feedback → graph update) is constitutional. Do not add hidden governors, planners, or pre-generation layers.

---

## TASK 7: docs/IMPLEMENTATION_ROADMAP.md (What's Next)

**Priority: MEDIUM**

### Instructions:

1. Read `IDRIS_IMPLEMENTATION_STATUS.md` carefully.

2. Write `docs/IMPLEMENTATION_ROADMAP.md`:

**Organize into tiers:**

**Tier 1 — Ship Blockers (before public announcement):**
- [x] README rewrite (Task 1)
- [x] Getting Started guide (Task 3)
- [x] Why This Matters document (Task 2)
- [ ] License selection (recommend: choose something that protects community use — consider AGPL-3.0 for copyleft protection or Apache-2.0 for maximum adoption)
- [ ] CI/CD: at minimum, the Idris2 build should succeed and tests should pass on push
- [ ] Verify all paths in Getting Started actually work end-to-end

**Tier 2 — High-Impact Gaps (first month after launch):**
- [ ] Idris2 TUI: session configuration modal, conversation atlas
- [ ] Idris2 storage: chunk management, FTS indexing, document SHA dedup
- [ ] Idris2 schema migrations: versioned additive migrations
- [ ] Second tradition module: even a skeleton Ubuntu or Confucian module proves the pattern isn't Hebrew-specific
- [ ] Graph audit pipeline merge (currently in worktree, pending merge)
- [ ] Tanakh module merge (currently in worktree, pending merge)
- [ ] Document extractors merge (currently in worktree, pending merge)

**Tier 3 — Full Parity (first quarter):**
- [ ] Idris2 observatory web server: at minimum, a read-only HTTP server serving the export JSON
- [ ] MLX local model backend for Idris2: full sovereignty without Claude CLI dependency
- [ ] Embedding-based retrieval: semantic similarity for non-English and cross-lingual queries
- [ ] Full Idris2 TUI: modals, archive browser, paste handling, mouse support
- [ ] Measurement event tracking in Idris2 storage

**Tier 4 — Expansion:**
- [ ] Pre-built binaries for Linux ARM (Raspberry Pi — critical for Global South deployment)
- [ ] Android terminal support (Termux)  
- [ ] Multiple tradition modules contributed by communities
- [ ] Multi-language concept extraction beyond English/Hebrew
- [ ] Federation: how two Adam instances can share graph material with provenance
- [ ] Offline model quantization guide: which open-source models work on which hardware tiers

**For each item, include:**
- What exists now (in Python, in Idris2, or neither)
- What the target state looks like
- Which files/modules are involved
- Estimated complexity (small/medium/large)
- Whether it blocks other items

---

## TASK 8: Merge Pending Worktree Items

**Priority: HIGH**

The implementation status document shows several completed modules that are "in worktree, pending merge":
- Graph Audit Pipelines (`Eden.GraphAudit`)
- Tanakh/Hebrew Service (`Eden.Tanakh`)  
- Document Extraction (`Eden.Ingest.Extractors`)
- Session/Archive Management (`Eden.Session`)

### Instructions:

1. Check the current git status and worktree situation:
```bash
git status
git worktree list
git branch -a
```

2. For each pending module, verify it compiles:
```bash
cd eden-idris && ./build.sh
```

3. If the modules are on a separate branch, merge them:
```bash
git checkout main  # or master, whatever the primary branch is
git merge david    # or whatever the feature branch is called
```

4. If there are conflicts, resolve them preserving the Idris2 code's invariants. Run `./build.sh` after resolution to verify compilation.

5. After merge, update `IDRIS_IMPLEMENTATION_STATUS.md` to reflect the merged status.

---

## TASK 9: Verify the First-Run Experience

**Priority: HIGH**

### Instructions:

1. Follow every step in `docs/GETTING_STARTED.md` exactly as written, starting from a clean state.

2. For each path (mock backend, Claude backend, Python), verify:
   - The build command succeeds
   - The binary/script starts without errors
   - A conversation can be had
   - Feedback can be given
   - Export produces valid JSON
   - The explanatory text in the guide matches what actually happens

3. Fix any discrepancies between the guide and reality. Reality wins; update the guide.

4. Note any error messages, confusing outputs, or unexpected behaviors. File them as GitHub issues or fix them directly.

---

## TASK 10: Create .github/ISSUE_TEMPLATE/ Files

**Priority: LOW**

### Instructions:

Create three issue templates:

**bug_report.md:**
```yaml
name: Bug Report
about: Something doesn't work as documented
labels: bug
```
Fields: What you did, what you expected, what happened, which implementation (Python/Idris2), which backend, OS/hardware.

**feature_request.md:**
```yaml
name: Feature Request  
about: Suggest a capability
labels: enhancement
```
Fields: What problem this solves, how you'd use it, which implementation it affects.

**tradition_module.md:**
```yaml
name: Tradition Module Proposal
about: Propose or contribute a tradition-specific module
labels: tradition-module
```
Fields: Which tradition, what interpretive tools it would include, what priority hierarchy it defines, what graph categories it introduces, current status (idea/skeleton/partial/complete).

---

## TASK 11: Repository Hygiene

**Priority: MEDIUM**

### Instructions:

1. **Create `.gitignore`** if not present, covering:
   - Python: `__pycache__/`, `.venv/`, `*.pyc`, `.eggs/`
   - Idris2: `build/`, `*.ibc`
   - Data: `data/*.db` (but NOT schema files), `logs/runtime.jsonl`
   - OS: `.DS_Store`, `Thumbs.db`
   - Editors: `.vscode/`, `.idea/`

2. **Verify no secrets** are committed:
   - Search for API keys, tokens, passwords
   - Search for hardcoded paths specific to David's machine
   - Replace any machine-specific paths with environment variables or config

3. **Add a `Makefile` or `justfile`** in the repo root with convenience targets:
   ```makefile
   build-idris:
       cd eden-idris && ./build.sh
   
   test-idris:
       cd eden-idris && ./build.sh && # run test suite
   
   build-python:
       cd eden && pip install -r requirements.txt
   
   test-python:
       cd eden && python -m pytest tests/
   
   docs:
       # if there's a doc build step
   ```

---

## ORDER OF OPERATIONS

Execute in this order:

1. **Task 8** (merge pending worktree items) — get the code into a single working state first
2. **Task 11** (repo hygiene) — clean before documenting  
3. **Task 1** (README) — the front door
4. **Task 2** (Why This Matters) — the philosophical bridge
5. **Task 3** (Getting Started) — the first experience
6. **Task 4** (Architecture Overview) — the technical map
7. **Task 5** (Tradition Embedding Guide) — the replication pattern
8. **Task 9** (verify first-run experience) — test everything
9. **Task 6** (Contributing) — how to help
10. **Task 7** (Implementation Roadmap) — what's next
11. **Task 10** (issue templates) — GitHub infrastructure

---

## CRITICAL REMINDERS

- **Read before writing.** Every task starts with reading existing files. The project has extensive internal documentation. Don't contradict it.
- **Honesty is the brand.** This project's whitepaper refuses to claim capabilities the code doesn't support. Maintain that standard everywhere. If something is aspirational, say "planned" or "not yet implemented." Never present a roadmap item as a current feature.
- **The audience is global.** Write for a developer in Nairobi, São Paulo, or Dhaka who has good English, a computer, and no prior exposure to this project. Avoid idioms, cultural assumptions, and references that only make sense in the Anglophone West.
- **The proofs matter.** The 55 machine-checked theorems are not an academic curiosity. They are the trust infrastructure for communities that cannot rely on institutional accountability. Explain them in terms of what they guarantee, not in terms of type theory.
- **The Tanakh module is a pattern, not a product feature.** When documenting it, always frame it as "here is how one tradition was embedded; here is how you embed yours." Never frame it as "this is a Jewish AI system."
- **Local-first is political.** The decision to run on local hardware without cloud dependency is not a performance optimization. It is a sovereignty decision. Document it as such.
