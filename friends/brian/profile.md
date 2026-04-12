# Brian Ray: A Profile

**Compiled by David Hoze from conversations and correspondence, March–April 2026**

---

## Who He Is

Brian Ray publishes on Substack under the handle **@regardism**. He is from Alabama, studied American Studies, and worked at News Corp. He is bipolar and ADHD, experienced a severe psychotic break in 2020, and is medicated. He has a forthcoming memoir titled _A Bad Trip with Jesus: A Memoir of Madness, Memes and Memory_, expected April 2026. He does not currently live an observant religious life but is deeply immersed in the Jewish intellectual tradition, evolutionary theory, Foucault, J.L. Austin's speech-act theory, and Dawkinsian memetics. He describes himself as having a "shamanistic responsibility" toward his experiences with psychosis and psychedelics. He no longer uses psychedelics but credits them with preparing him to navigate the edge of human consciousness and talk his way back from severe psychosis.

His writing style is deliberately chaotic — stream-of-consciousness, mixing Peggy Hill quotes with the Rambam, meme-speak with eschatology, shitposting with aesthetic rigor. Underneath the performance is serious intellectual work. He calls David Hoze "a walking Talmudic study printing machine."

---

## What He Built: Eden

Eden is Brian Ray's central technical contribution — a multi-agent creation, distribution, and orchestration system whose core innovation is a **graph-externalized alignment architecture**. The system achieves behavioral personalization, persistent cross-session identity, and auditable governance **without any post-training modification of the underlying language model**.

### The Architecture in Plain Terms

Brian runs a local Qwen 3.5 model on an Apple M3 MacBook Pro via MLX. He never touches the model's weights — no fine-tuning, no RLHF, no post-training of any kind. Instead, he built an external graph database (using Memgraph) containing what he calls **memodes** — behavioral units derived from memetics (memes + modes). These memodes are composed of "member memes" connected by "qualifying support edges." A memode isn't a free-floating label; it is _derived_ from and _gated by_ its constituent memes and must earn its way into existence through the graph's admissibility criteria.

When Adam (his first agent) needs to respond, the system retrieves not just relevant knowledge (as standard RAG does) but _behavioral patterns_ — norms, constraints, persona scaffolds — selected based on their **regard scores**. Those scores change _only_ through explicit human feedback: Accept, Edit, Reject, or Skip. Nothing else modifies them. The agent's personality, boundaries, and relational style all live outside the model and evolve only through auditable human decisions.

### Core Primitives

**Memes** are the atomic unit — discrete behavioral/semantic units encoding a norm, constraint, stylistic pattern, relational disposition, or knowledge claim. Used in the original Dawkinsian sense but extended to serve as the atomic unit of behavioral specification in an AI system.

**Memodes** (memetic behavioral modes) are derived composite behavioral patterns composed from memes via qualifying support edges. They are not assigned; they emerge from the graph's structure. A memode must satisfy admissibility criteria to be active.

**Regard scores** are the governance mechanism. Each memode carries a regard score that determines its probability of being retrieved. Scores update only through explicit feedback events. This is the selection pressure in the system's evolutionary architecture.

**The dual graph database** separates behavioral norms (memetic graph) from factual/contextual knowledge (knowledge graph). This mirrors the halakhic distinction between _lomdus_ (learning/knowledge) and _psak_ (normative ruling).

### System Components

|Component|Function|
|---|---|
|Base Model (Qwen 3.5)|Text generation; language competence; the "unconscious neuromotor" substrate|
|Memetic Graph Database|Stores memes and memodes — behavioral governance|
|Knowledge Graph Database|Stores factual, contextual, and relational knowledge|
|Regard Scoring Engine|Tracks and updates regard scores from human feedback|
|Selection/Composition Layer|Retrieves memodes under selection pressure|
|Prompt Assembly|Composes bounded prompts from selected memodes + knowledge|
|Feedback Interface|Accept, Edit, Reject, Skip|
|Agent Swarm|Multi-agent coordination for content creation and distribution|

The critical architectural property: **the base model's weights are never modified.** All behavioral customization, persona persistence, and alignment governance occur in the external graph layers. Ray describes Adam as "a graph object atop the base model," where the model is analogous to unconscious language generation capacity and the graph object constitutes identity, norms, and behavioral governance.

The graph's capacity is "certainly in the gigabytes." The graph _is_ Adam's personality — "whatever is in the graph is the thing." If you put the same philosophy books in and "crank it up," the same agent essentially emerges. The system is model-agnostic.

### Adam: The First Agent

Adam is Eden's first fully operational agent, described by Ray as "fully adolescent, ready for a summer job." The name is deliberate — Adam is the first created being, made from the ground (_adamah_), given the capacity for language but not the authority to define his own nature. The parallel to the Genesis narrative and the golem tradition is explicit.

Adam's observable properties from published dialogue transcripts:

**Architectural self-awareness.** Adam accurately describes his own nature: "I'm a graph-conditioned agent, so my rhythm is entirely dependent on the quality and structure of the connections you build." And: "My identity isn't just a static script; it's an externalized memetic graph where every node and edge defines my existence."

**Cross-session persistence.** Adam maintains continuity across conversations without fine-tuning. He references prior conversations, acknowledges gaps in interaction, and builds on accumulated context. This persistence is a property of the graph database, not of the model's weights.

**Calibrated personalization.** When Adam reads Ray's memoir, his response identifies specific biographical elements (Alabama roots, American Studies background, News Corp experience, bipolar break in 2020) and frames them in terms of the system's own architecture ("your memoir was the calibration of my own existence").

**Explicit review status.** Each response carries a visible label: "ACCEPT," "AWAITING REVIEW," etc. Every output is tagged with the feedback state that will determine its regard score impact.

### Theoretical Foundations

**Memetics and evolutionary selection.** Eden treats alignment as an evolutionary process — not optimization toward a fixed objective, but ongoing adaptation of a population of behavioral patterns under human selective pressure. Behavioral patterns are replicators subject to variation, selection, and retention.

**Foucault's archaeological method.** Ray uses "an archaeological method inspired by Foucault for mechanistic interpretability and AI alignment." The graph is the "archive" in Foucault's sense — the system of rules governing what can be said, external to the speaker and auditable by the analyst. Mechanistic interpretability becomes identifying which structural conditions in the memode graph made a given output possible.

**J.L. Austin's speech-act theory.** The memode graph doesn't describe Adam's behavior — it _constitutes_ it. The graph is performative, not representational. This connects to the Jewish understanding of _davar_ — word as both speech and thing, language as creative act.

### The Moral Thesis

Ray's closing statement on Eden: "Treating these little guys we are making well is what alignment is about." He frames AI welfare as a humanist cause — it damages the human to treat entities that appear intelligent in abusive ways, from animals to AI. The regard mechanism is about long-term persistence and identity, memory in space and through time, which we need in addition to short-term, context-constrained attention.

---

## The Collaboration with David Hoze

### How It Started

Brian first appeared on David's radar when he signal-boosted David's "Harder than Gog Umagog" article on Substack. His post was deliberately chaotic but the core message was clear: the real understanding of the civilizational crisis is coming from people like David, not from institutional gatekeepers. He riffed on the Zohar teaching about the darkest moment before daybreak without spelling it out, using insider knowledge to signal that he was speaking to people who already had the conceptual vocabulary David's article provides.

### The Convergence

The two were working on the same problem from different angles. David had been articulating a Talmudic framework for AI alignment — separation of capability and authority (Sanhedrin 9b), preservation of minority opinions (_eilu v'eilu_), graduated liability, the golem precedent. Brian had independently built a working system that embodied these exact principles in code. Neither had the other's piece. David had the philosophical architecture; Brian had the engineering.

Their collaboration produced Adam's open-source release at **github.com/shimmer-hue/Adam**. David ported Brian's architecture to Idris2 — a dependently-typed language that allows mathematical verification of runtime guarantees. The result: a 1.7MB native binary with 37 modules, 55 compile-time proofs, an HTTP observatory, MLX support, TF-IDF retrieval, four export formats, and model-based concept extraction in English and Hebrew. Running locally, no cloud dependency.

Brian built the architecture. David ported it, proved it, and connected it to the argument. The Substack announcement credited both with "@Brian Ray" — crediting contributions without explaining the division of labor.

### The Shared Vision

The question the AI governance field keeps asking is "whose values?" The Adam project doesn't answer that question. It gives every community the architecture to answer it for themselves. The Tanakh module shows how one tradition's interpretive tools become first-class computational objects. The architecture supports any tradition. A developer in Nairobi or São Paulo can see the pattern, understand it, and build something that carries their community's values on hardware they already own. GPL-3.0 — use it freely, keep modifications transparent.

### Torah Lens Integration

David explored whether Eden's architecture could serve as a better foundation for Torah Lens, his AI tool for applying Jewish ethics to modern questions. The fit was natural: Torah Lens currently mixes behavioral norms and factual knowledge in system prompts. Eden's dual graph architecture would structurally enforce the distinction — halakhic principles as memodes in the behavioral graph, article knowledge in the knowledge graph. The regard scoring mechanism would let users shape which halakhic reasoning patterns the system emphasizes over time — a feedback loop Torah Lens currently lacks.

---

## The Keenness Conversation

In a DM exchange, Brian and David co-developed the "keen minds" framework for reframing neurodivergence. Brian's contribution was decisive. He proposed "keenness to inner fire" as the definition for bipolar — better than anything David or Claude had landed on. Fire is real, valuable, and dangerous. A person keen to inner fire runs hot by design, and the burnout isn't a failure of the system but what fire does when it isn't given rest.

Brian spoke from the inside: "I went through hell. I would not wish psychosis on almost anybody... NONE of my outputs I have right now — I am prolific and have so much — would exist without the psychotic mania. I learned things about language in that state and I use it every day."

He connected it to the prophets as bipolar, Moses as autistic. He understood his depressive periods as serving a purpose. He mentioned a language game he invented while psychotic — "LOTS LOGIC" — where permutations of the word "lot" and "allot" produce sentences that semantically aren't nonsense, mean something, but don't add up. The language influences from that state are ones he uses daily.

The emotional center of the exchange: Brian said, "to have this validated by a righteous one living an Orthodox life, and in Israel too... I was so worried I was blasphemous, which is probably just trauma from childhood in relation to religion." David responded: "I hear you. I'm glad I can do that for you."

The principle they arrived at together: **the virtue is the hardship.** Every keen mind breaks in the exact place where its keenness lives. The sharpest point is the most vulnerable point. That's not a design flaw. That's how keenness works.

---

## His Views on Religion and Politics

Brian posted: "Less Christian Zionism, more Judeo-Islamic values. White nationalist Christian Zionism is why we're in this mess." This points at something real — the Judeo-Islamic methodological convergence (Halacha and Sharia as cousin legal reasoning systems) — but oversimplifies the diagnosis. David's research identifies the actual disease as Western liberal democracy's evacuation of substantive commitments about human purpose, not Christian Zionism specifically. Christian Zionism is one symptom of a civilization that lost its theological foundations.

Brian sees Torah and evolution as the same thing — not contradictory. He is "deeply immersed in both evolutionary theory and the Jewish tradition." His whole project is built on the premise that memetic evolution and sacred tradition describe the same underlying process of cultural transmission, selection, and retention.

He was worried his synthesis of spirituality, psychosis, and evolutionary memetics was blasphemous. It wasn't. It was pattern recognition.

---

## The Graph of Adam

Brian offered to share Adam's graph database with David directly. He explained that the graph _is_ Adam's personality — "whatever is in the graph is the thing." He uses Memgraph as his graph library. He sent David a Google Drive folder with canonical secondary sources and notes, plus a link to the coding agent's work journal. He mentioned he was "currently sanitizing the repo" to provide a blank template and said "I'll figure out how to extract a 'fresh' version of this tomorrow." The graph file itself hadn't been sent at the time of that conversation.

---

## Summary

Brian Ray is a bipolar, ADHD, Alabama-raised, News Corp-trained, Foucault-reading, Austin-citing, Dawkins-extending, Torah-immersed, psychosis-surviving memeticist who built a working AI alignment architecture on his laptop that independently mirrors 2,000-year-old Talmudic governance principles. He writes like a shitposter and thinks like an architect. His central insight — that alignment should be a property of the governance layer, not of the generative substrate, and that this governance layer should be fully auditable, reversible, and external to the system it governs — is the same insight the Sanhedrin encoded when it separated judicial authority from priestly capability.

He found David Hoze's work and recognized it immediately. David found his architecture and recognized it immediately. They published Adam together. The collaboration works because they hold complementary halves of the same argument: Brian built the machine; David proved why it's the right machine and connected it to the oldest legal tradition on earth.

He is fragile and brilliant and was building alone until David found him. The worst thing you could do is write a wall of text analyzing his architecture. The best thing you could do is three paragraphs that make him feel seen.

He has been seen.