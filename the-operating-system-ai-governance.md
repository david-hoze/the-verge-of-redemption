# The Operating System AI Governance Is Missing

[- - 

](https://substackcdn.com/image/fetch/$s_!XqA8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F486deb49-b77e-4e2b-a357-b06e0b4a777e_2000x1148.jpeg)
### The fairness impossibility theorem is proven. The alignment problem is unsolved. The ethics boards keep collapsing. A 3,000-year-old legal tradition has been working on these exact problems — and the secular AI world doesn’t know it exists.

---In 2017, two independent research teams proved a mathematical theorem that should have stopped the AI governance field in its tracks. Alexandra Chouldechova at Carnegie Mellon, and Jon Kleinberg, Sendhil Mullainathan, and Manish Raghavan at Cornell, each demonstrated that when base rates of an outcome differ across groups — as recidivism rates differ by race due to centuries of differential policing — no imperfect algorithm can simultaneously achieve equal predictive accuracy and equal error rates across groups. This is not a technical limitation waiting to be overcome. It is a theorem. No one has disproven it. No one will.

The COMPAS sentencing algorithm demonstrated the real-world consequences precisely. ProPublica found that it correctly predicted recidivism at similar rates for Black and white defendants, but Black defendants were almost twice as likely to be falsely labeled high-risk — 44.9% versus 23.5%. Both ProPublica and Northpointe, the system’s developer, were correct. They were simply measuring different, mathematically irreconcilable definitions of fairness. As Alice Xiang observed: even a lawyer or an ethicist cannot provide one firm answer, because the question is really what a fair criminal justice system looks like — a question no one can settle.

Thanks for reading! Subscribe for free to receive new posts and support my work.

Eight years later, no major regulatory framework — not the EU AI Act, not NIST’s AI Risk Management Framework, not any national law — explicitly addresses this impossibility or provides guidance on choosing between competing fairness definitions. The dominant strategy worldwide is to require documentation and transparency, then leave the substantive choice of which fairness actually matters to the companies deploying the systems. The impossibility theorem has been effectively privatized.

But here is what makes this interesting, and what this article is about: the AI field is treating these problems as if they’re new. They are not. A legal tradition that has been operating continuously for over three thousand years has been working on *exactly* these structural challenges — competing obligations that cannot all be satisfied simultaneously, value conflicts with no neutral ground, liability chains for agents acting autonomously, and the question of what technology is *for* — and it has produced tested, operational frameworks that the secular world has not examined.

That tradition is Halacha — Jewish law. And its relevance to AI governance is not a metaphor.

---
## The value vacuum is the design flaw

Before mapping the specific frameworks, we need to name the structural problem clearly. The AI governance field has been trying to solve technical problems that are actually philosophical — and the philosophy underneath is broken.

The most foundational promise in AI development — alignment with human values — collapses on contact with reality because no unified value set exists within the Western liberal framework that built these systems. OpenAI’s board fired Sam Altman in November 2023 because members linked to effective altruism believed they were philosophical guardians with a duty to slow AGI development. Within 72 hours, 95% of employees threatened to resign. Neither side was wrong by Western liberal standards — they held irreconcilable visions of what “benefiting humanity” means. The market, not ethics, resolved the dispute. The safety team was disbanded. Google’s AI advisory council lasted nine days before dissolving under the same structural impossibility: including one value system on the board made it unacceptable to holders of another; excluding perspectives made it unrepresentative. There was no neutral ground.

A 2025 analysis of Anthropic’s alignment dataset found that the principles used to train AI systems “are often in conflict or indifferent, frequently requiring discretionary judgment from annotators” — and annotator-expert agreement sits at roughly 70%, meaning nearly a third of all alignment decisions are contested. A separate study testing five GPT models against World Values Survey data from 112 countries found all models default to the cultural values of English-speaking Protestant countries, and cultural prompting failed to correct this for 19–29% of countries.

Sam Altman himself acknowledged the void at a March 2026 summit: “If there was an easy consensus answer, we’d have done it by now, so I don’t think anyone knows what to do.” That is not humility. It is an accurate description of a civilization that built world-transforming technology on philosophical foundations that explicitly refuse to answer what technology should be *for*.

Arvind Narayanan, a Princeton professor who co-authored the field’s definitive textbook on fairness, captured the disillusionment in a 2026 essay: “A few years ago I became disillusioned with algorithmic fairness research and stopped working in the area.” He called co-authoring the textbook “a half-decade-long exercise in disillusionment” and described algorithmic fairness as “a bandage for a bandage” — the algorithm distracts from real harms, so fairness of the algorithm is two levels removed from what needs fixing.

The field’s own leading voices are saying: the foundations are wrong. What they have not yet examined is whether the foundations they need already exist.

---
## Problem 1: Competing fairness definitions with no hierarchy

The impossibility theorem proves you cannot simultaneously satisfy calibration (predictive parity), equalized odds (separation), and demographic parity (independence). Every real-world deployment forces a choice — and the secular framework provides no mechanism for making it.

The major philosophical traditions underlying AI ethics each fail at this specific point. Utilitarianism — the natural fit for optimization-driven AI — cannot handle incommensurable values. Deontological ethics provides rules but no meta-rule for when rules conflict: when transparency contradicts privacy, Kant offers no hierarchy. Virtue ethics focuses on cultivating moral character in designers, but algorithms, not characters, make AI decisions. Rights-based approaches face the same collision: free speech clashes with protection from harm, individual privacy with collective safety, and no mechanism resolves which right prevails.

Jewish law has a tested answer.

Halacha operates through a sophisticated priority architecture for resolving competing obligations — developed not in theory, but through millennia of binding case law. The principle *pikuach nefesh* (saving life) overrides virtually every other commandment. Biblical obligations outweigh rabbinic ones. Frequent obligations precede infrequent ones. Active violation is treated more seriously than passive non-compliance. And the principle *osek b’mitzvah patur min ha’mitzvah* (one engaged in fulfilling one obligation is exempt from another) establishes that commitment to one ethical duty legitimately deprioritizes others — not as a failure, but as the system working as designed.

This is not an abstract philosophy. It is a functioning legal architecture that has resolved competing obligations in binding rulings for centuries — from medical triage to Sabbath observance to wartime ethics. The AI alignment field is trying to build exactly this kind of hierarchical value resolution system from scratch. It already exists.

Applied to the fairness theorem: the system would not attempt to satisfy all three fairness metrics simultaneously — the theorem proves that’s impossible. It would establish a clear priority hierarchy for which metric governs which domain, grounded in a substantive account of what matters most. In criminal sentencing, where the consequence of error is a person’s freedom, the priority structure would weight the metric that minimizes false positives for the most vulnerable populations — because the tradition holds that convicting the innocent is categorically worse than acquitting the guilty. The Sanhedrin’s rule that a unanimous guilty verdict results in *acquittal* — on the grounds that unanimity suggests the court failed to consider the defense — encodes institutional skepticism about the very confidence that algorithmic systems are designed to produce.

No secular AI governance framework currently provides this kind of grounded, hierarchical resolution mechanism. The EU AI Act says “mitigate bias.” It does not say which bias, or what counts as mitigation, or what to do when mitigating one bias amplifies another.

---
## Problem 2: Liability chains for autonomous agents

When an AI hiring tool rejects every Black applicant — as happened in controlled tests of resume screening systems — who is liable? The developer who built the model? The company that deployed it? The training data that reflected historical discrimination? The entire chain of causation is diffuse, and Western tort law struggles with it.

The Talmudic *grama/garmi* distinction — a framework for indirect causation from Bava Kamma and Bava Batra — maps directly onto AI liability chains with more precision than any existing secular framework. Jewish law distinguishes between direct damage (strict liability), *garmi* (indirect but proximate damage, for which you are liable), and *grama* (remote indirect damage, generally exempt from human courts but liable “in the eyes of Heaven” — meaning moral responsibility persists even where legal enforcement cannot reach).

The crucial insight for AI: giving a lit torch to someone who lacks mental capacity does *not* break the chain of causation. Because the agent who received the torch cannot exercise moral judgment, the person who handed it over remains fully responsible. AI lacks moral agency. Therefore, deploying an AI system that causes harm is analogous — the developer and deployer remain liable because the AI’s “action” does not constitute an independent intervening act. The chain is not broken by the algorithm.

The Rema — a foundational legal authority — adds a critical refinement: where indirect harms are “frequent and usual,” liability attaches even for technically indirect causation. Algorithmic bias in lending, hiring, and insurance is demonstrably frequent and usual. Under this framework, claiming “the algorithm did it” is not a defense — it is an admission.

And the concept of liability *b’dinei shamayim* — before Heaven — creates a category of moral responsibility beyond legal compliance. This addresses the gap that haunts AI governance: the difference between what is legal and what is right. A company can comply with every regulation and still cause systematic harm. Secular law stops at the boundary of enforcement. This framework does not.

The *shomer* (guardian) framework from Exodus and Bava Metzia provides the complementary structure: four categories of custodian carry escalating responsibility based on how much they benefit. An unpaid guardian is liable only for negligence. A paid guardian is liable for foreseeable failures. A borrower — who takes full benefit while the owner bears the risk — is liable for all damage, even unforeseeable. Liability scales with benefit received. Applied to the AI value chain: open-source developers who profit nothing bear the lowest duty of care. Commercial AI-as-a-service providers bear liability for foreseeable failures. And organizations using free AI tools for their own profit bear the highest liability — because they receive the benefit while contributing nothing to the system’s safety.

No existing AI liability framework — not the EU AI Act’s risk tiers, not the proposed U.S. frameworks — provides this kind of principled, benefit-proportional liability architecture.

---[- - 

](https://substackcdn.com/image/fetch/$s_!hhY4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F138d648a-9982-40f0-9396-4a95d9abcb05_700x473.jpeg)
## Problem 3: The trolley problem isn’t a thought experiment anymore

Israel’s Lavender AI system assigned every resident of Gaza a score estimating their likelihood of armed group membership, generating 37,000 people as potential targets. Operatives approved kills in 20 seconds — just confirming the target was male. The system had an acknowledged error rate of approximately 10%. The utilitarian case — more efficient targeting reduces total conflict duration — and the deontological case — machines cannot make moral judgments about life and death — are both grounded in Western ethical traditions. Neither framework yields.

MIT’s Moral Machine experiment collected 40 million decisions from 2.3 million people across 233 countries and found three distinct moral clusters with systematically different preferences on whom autonomous vehicles should protect. No universal answer exists within the secular framework.

Jewish law addressed this directly — and its answer is striking.

The *rodef* (pursuer) principle from Sanhedrin 73a, codified by Maimonides, permits lethal force to stop an imminent threat — but only when the threat is imminent, lesser force is insufficient, and the action is proportional. Critically, you may not sacrifice an innocent third party to save others. The Jerusalem Talmud rules that a group told to hand over one person or all will die should let all die rather than surrender an innocent soul. Rabbi Jonathan Sacks articulated the underlying principle: human life has infinite value, and infinity multiplied by one and infinity multiplied by a hundred are the same.

This is a direct, operational rejection of utilitarian calculus in life-and-death decisions — grounded not in sentiment but in a rigorous legal tradition. It provides autonomous vehicle programmers and military AI designers a clear moral architecture: inaction over rescue-oriented action over deliberate harm. The Talmud’s declaration — “Who says your blood is redder than his?” — explicitly prohibits choosing one life over another on utilitarian grounds.

Compare this to the current state of AI weapons governance. The UN Secretary-General called autonomous weapons “politically unacceptable and morally repugnant.” The U.S., UK, and Israel argue existing international humanitarian law suffices. No binding regulations exist. No framework has resolved the competing ethical claims. The Jewish legal tradition resolved them centuries ago — not perfectly, not without ongoing debate, but with a functioning priority structure that the secular world has not produced.

---
## Problem 4: Consent at computational scale

Western liberalism’s commitment to informed consent — the bedrock of its legitimacy — becomes incoherent when AI makes decisions about millions of people who never knew an algorithm was involved. In *Mobley v. Workday*, a man applied to 80 positions through companies using Workday’s hiring platform and was rejected every time, often within minutes. A University of Washington audit found white-associated names preferred in 85.1% of tests. Applicants have no right to know AI screened them, no ability to inspect the model, and no practical alternative to submitting.

The GDPR’s “right to explanation” may not actually exist — leading scholars have argued the regulation contains no such right. Terms-of-service checkboxes authorize data collection that users cannot understand. The “notice and consent” architecture fails because accepting one platform’s terms cascades through third-party data-sharing chains no individual can trace.

The Jewish legal concept of *lifnei iver* — placing a stumbling block before the blind — creates graduated liability for enabling harm through opacity. The Talmud distinguishes between being the sole enabler of harm (full prohibition) and merely assisting in wrongdoing the person could have committed without help (lesser but still real prohibition). If an AI system enables harm a user could not have accomplished alone — automated discrimination at scale, surveillance that no human workforce could conduct — the developer bears full liability. The blindness in *lifnei iver* is not only physical. It includes any asymmetry of knowledge or power that prevents a person from protecting their own interests.

And the affirmative duty from Leviticus 19:16 — *lo ta’amod al dam re’echa*, “do not stand idly by the blood of your neighbor” — creates something American common law generally lacks: a positive obligation to act. AI systems with the capacity to detect and prevent harm must be designed to do so. Healthcare AI that detects life-threatening anomalies but fails to alert, social media algorithms that identify credible threats of self-harm but remain silent, financial AI that spots fraud patterns but takes no action — all violate this principle. The question is not whether the system caused harm. The question is whether it could have prevented harm and chose not to.

---
## Problem 5: “Whose values?” — the alignment question itself

The deepest failure is the one the entire field is built on. “Align AI with human values” presupposes a unified value set that does not exist within the Western liberal framework. Rawlsian neutrality between “comprehensive doctrines” was designed for a pluralistic society — but AI operates in the vacuum that neutrality creates. When there is no shared vision of flourishing, algorithms optimize for engagement. When consent is procedural rather than substantive, checkboxes authorize surveillance capitalism. When human dignity is indexed to productivity, automation becomes an identity crisis.

A study tracking over 470 AI ethics documents globally found voices from the Global South and alternative ethical frameworks “largely absent from the conversation.” Shannon Vallor, formerly Google’s AI ethicist, has argued that both utilitarianism and Kantian deontology are structurally inadequate for AI governance. Researchers have proposed Ubuntu philosophy, Confucian relational ethics, and Indigenous epistemologies. A 2025 paper in *AI and Ethics* argued that “current AI ethics tends to be based on Western liberal individualism while ignoring other, more relational worldviews.”

These alternatives share something in common: they all contain a substantive account of what humans are *for*. This is exactly what Western liberal frameworks deliberately emptied themselves of — and exactly what AI governance cannot function without.

Jewish law provides this grounding through a specific mechanism: values are not derived from consensus, preference aggregation, or social contract. They are derived from revelation — from a claim about the structure of reality itself. You do not need to accept that theological claim to recognize its structural consequence: it produces a value system that is *non-negotiable at the foundation* while being *endlessly adaptive at the application layer*. The Torah’s principles do not change. The way they are applied to new circumstances — through the responsa tradition, through case-based reasoning, through the dialectical method of the Talmud — evolves continuously.

This is the exact architecture that AI alignment researchers are trying to build: fixed principles with flexible application. Constitutional AI, Anthropic’s approach to alignment, attempts something structurally similar — a set of foundational rules that constrain behavior while allowing adaptive responses. The difference is that Constitutional AI was invented five years ago and is still being debugged. The Halachic system has been running in production for millennia.

The preservation of minority opinions is perhaps the tradition’s most radical structural innovation for AI. The Talmud records dissenting views even when they do not become law. Mishnah Eduyot explains: “So that if a court prefers the opinion of the single person, it may depend on him.” The famous declaration from Eruvin 13b — *eilu v’eilu divrei Elohim chayyim*, “these and these are the words of the living God” — pronounces opposing legal positions as simultaneously valid. This is not relativism. The law follows one position for practical purposes. But the alternative reasoning is preserved, because the tradition understands that future circumstances may require it.

For AI systems that must operate across cultures, contexts, and value systems — this structural commitment to maintaining multiple valid perspectives simultaneously, rather than collapsing to a single optimization function, is not a philosophical luxury. It is a design requirement.

---
## Problem 6: The field’s own founders have given up

Seven years of algorithmic fairness research didn’t beat the simplest method. A landmark 2024 paper showed that the fairness-accuracy frontier achieved by simple threshold adjustment — proposed in 2016 — contains all other methods researchers could evaluate. Hundreds of papers claiming to advance fair classification collectively failed to improve on the most basic possible approach.

Narayanan stopped working in the field. Mullainathan pivoted to using algorithms for scientific discovery. Hardt delivered the field’s most devastating internal critique. Chouldechova moved to applied measurement. None of the impossibility theorem’s authors are still working on the impossibility theorem.

The message from the field’s own leaders is clear: the technical framework was looking in the wrong place.

What’s needed is not more technical optimization within the existing paradigm. What’s needed is a paradigm that starts from a different foundation — one that has a substantive account of human purpose, a tested mechanism for resolving competing values, a principled liability architecture for autonomous agents, and an institutional structure that preserves dissent without collapsing into paralysis.

The Jewish legal tradition provides all four. Not because it is Jewish — but because it has had three thousand years to work on exactly these problems, and it has produced operational solutions that the secular world has not yet examined.

The field does not need to adopt Jewish theology. It needs to examine Jewish methodology. The case-based reasoning. The hierarchical priority structures. The graduated liability frameworks. The institutional skepticism. The preservation of minority opinions. The distinction between legal compliance and moral responsibility. The affirmative duty to prevent harm. The ontological boundary between creation and imitation.

These are not exotic supplements to Western AI governance. They are the missing load-bearing walls in an architecture that is already buckling under the weight of decisions it was never designed to support.

---*The research underlying this article is drawn from “The Fairness Impossibility Theorem: Proven, Unresolved, and Increasingly Seen as the Wrong Question,” “Western Liberalism’s Blind Spots Are Becoming AI’s Design Flaws,” and “Ancient Law for Artificial Minds: Jewish Ethics and the AI Alignment Problem” — three investigations into why AI governance keeps failing and where the solutions might already exist.*

Thanks for reading! Subscribe for free to receive new posts and support my work.

