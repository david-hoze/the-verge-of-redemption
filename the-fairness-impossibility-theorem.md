# The Fairness Impossibility Theorem: Proven, Unresolved, and Increasingly Seen as the Wrong Question

[- - 

](https://substackcdn.com/image/fetch/$s_!6Mni!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a31792e-ee63-47ea-9fc6-9542f23df274_1920x1080.jpeg)
### The math that broke AI ethics — and what happened when nobody could fix it

Everyone building AI says the same thing: *we’re committed to fairness.* It’s in every mission statement, every press release, every congressional testimony. What almost no one mentions is that mathematicians proved — not argued, not suggested, *proved* — that fairness in algorithmic systems is impossible to achieve. Not difficult. Not expensive. Impossible.

And the field’s response, nearly a decade later, is the most revealing thing about the state of AI ethics today.

Thanks for reading! Subscribe for free to receive new posts and support my work.

---
## The proof

The impossibility result is precise. For an imperfect binary classifier — any algorithm that sorts people into categories and sometimes gets it wrong — with unequal base rates across groups, you cannot simultaneously achieve three things that every reasonable person would call “fair”: calibration (if the algorithm says you’re 70% likely to reoffend, it should be right 70% of the time regardless of your race), equalized odds (the algorithm should make mistakes at the same rate for everyone), and demographic parity (outcomes should be proportional across groups).

This is not a conjecture. It’s a theorem — proven independently by Alexandra Chouldechova at Carnegie Mellon in 2017 and by Jon Kleinberg, Sendhil Mullainathan, and Manish Raghavan at Cornell in 2016. No one has disproven it. No one will. It holds whenever the thing being predicted occurs at different rates in different groups — which, in a society shaped by centuries of differential policing, lending, hiring, and housing, is virtually always.

The COMPAS sentencing algorithm demonstrated this with brutal precision. Northpointe, the company that built it, showed their tool predicted recidivism at similar accuracy rates for Black and white defendants — calibration, check. ProPublica investigated and found that Black defendants were almost twice as likely to be *falsely* labeled high-risk (44.9% versus 23.5%) — equalized odds, failed. Both sides were correct. They were measuring different, mathematically irreconcilable definitions of fairness.

As Alice Xiang put it: “It’s not really something anyone can answer. It’s asking what a fair criminal justice system would look like. Even if you are a lawyer, even if you are an ethicist, you cannot provide one firm answer.”

She’s right. And the implications extend far beyond sentencing.

---[- - 

](https://substackcdn.com/image/fetch/$s_!Xsi9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6733c5ef-24c5-409e-acc8-5011bcf5fcf0_1920x1080.jpeg)
## The practical bite is weaker than feared — but “weaker” is doing heavy lifting

The theorem is absolute at the knife-edge of exact satisfaction. But what if you allow small deviations?

Bell, Solano-Kamaiko, Nov, and Stoyanovich published “The Possibility of Fairness” at FAccT 2023, showing that if practitioners accept even 2–10% tolerance — not perfect equality, but approximate equality — an “abundant” set of models can satisfy multiple supposedly incompatible fairness criteria simultaneously. They tested this across five real-world datasets. The impossibility holds in theory. In practice, with a little slack, it loosens considerably.

Causal fairness offers another escape route. Anthis and Veitch showed at NeurIPS 2023 that the three fairness metrics correspond to different causal scenarios — demographic parity maps to measurement error, equalized odds to selection-on-label, and calibration to selection-on-predictors. The insight: you wouldn’t typically need all three simultaneously, because the “right” metric depends on the causal structure generating the data.

And in dynamic settings — where algorithmic decisions reshape the very population they act on, which they inevitably do — a FAccT 2024 paper demonstrated that static fairness constraints that seem irreconcilable at a single point in time can be jointly satisfied through sustained policy adjustment. The impossibility theorem is fundamentally a snapshot. The real world is a movie.

These are genuine advances. But notice what each of them requires: *someone* must decide how much deviation is acceptable. *Someone* must determine the causal structure. *Someone* must design the adjustment policy. The theorem doesn’t disappear. It gets absorbed into human judgment calls that nobody has a principled framework for making.

---
## Seven years of fairness papers didn’t beat the simplest method

Perhaps the most sobering finding comes from inside the field itself. Cruz and Hardt published “Unprocessing Seven Years of Algorithmic Fairness” at ICLR 2024 — as an oral presentation, the highest distinction — and showed that the fairness-accuracy frontier achieved by simple threshold-adjustment post-processing, the method Hardt, Price, and Srebro proposed in 2016, contains all other methods they could feasibly evaluate.

Read that again. Hundreds of papers over seven years, each claiming to advance fair classification, collectively failed to improve on the most basic possible approach.

The explanation was methodological: researchers had been comparing methods with different base models and different levels of constraint relaxation, creating illusory improvements. The field had been, to use Hardt’s own framing, spinning its wheels.

The implication cuts deeper than methodology. If the technical problem of fair classification was essentially solved in 2016 by the simplest possible technique, then the hundreds of papers published since weren’t solving a technical problem at all. They were performing the appearance of progress on a problem that is fundamentally not technical.

---
## No regulator has confronted this head-on

Here is where the impossibility theorem meets the real world — and where the real world flinches.

The EU AI Act, the most comprehensive AI regulation on earth, requires high-risk AI systems to examine training data for possible biases and take “appropriate measures.” It never defines “bias” or “fairness” computationally. Scholars analyzing the Act identified three critical gaps: it addresses only “reasonably foreseeable” risks, focuses primarily on input data bias rather than output fairness, and relies on self-assessment. The European Commission tasked CEN/CENELEC with developing technical standards, but commentators note the “immense challenge” of operationalizing fundamental rights into universal technical procedures when fairness is “highly contextual, politically sensitive, and resistant to reduction.”

NIST’s AI Risk Management Framework explicitly acknowledges tradeoffs — stating that they “do not answer questions about how to navigate the tradeoff” and that resolution depends “on the values at play in the relevant context” — but provides no mechanism for making these choices.

ISO/IEC TR 24027:2021 comes closest to honesty: it flatly states that “it is not possible to guarantee universal fairness” and deliberately refuses to define the term.

The one regulation that effectively mandates a specific fairness metric is NYC Local Law 144, requiring annual bias audits of automated hiring tools. It took effect in July 2023. A FAccT 2024 study found that among 391 employers examined, only 18 posted the required audit reports.

The dominant regulatory strategy worldwide is process-based: require documentation and transparency, then leave the substantive choice of fairness definition to the companies deploying the algorithms. This is not an oversight. It is an acknowledgment that regulators cannot prescribe which fairness matters most in every context. But it effectively privatizes the impossibility theorem — pushing its resolution from democratic governance to corporate discretion.

The question of what “fair” means — when the math proves you can’t have all the reasonable definitions at once — is being decided by the people who profit from the decision. That should concern everyone, and it should especially concern anyone who has been on the wrong end of a system that “worked as designed.”

---
## The philosophers say it’s the wrong question

The philosophical response has been vigorous and increasingly unified around a core claim: the impossibility theorem is an artifact of a too-narrow methodology, not a deep truth about fairness itself.

Ben Green’s “Escaping the Impossibility of Fairness” (2022, *Philosophy & Technology*) draws the sharpest line, distinguishing “formal” algorithmic fairness — applying statistical criteria to isolated decision points — from “substantive” algorithmic fairness that evaluates algorithms within broader social structures. The impossibility, Green argues, arises specifically because formal fairness restricts analysis to isolated procedures. Expand the frame to include social hierarchies and structural conditions, and strategies for reform emerge that are not subject to the impossibility at all.

Lily Hu at Yale has developed this critique rigorously: fairness in algorithmic systems cannot be reduced to statistical criteria. Her 2025 paper in *Philosophical Studies* demonstrates that calibration-based fairness commits a reference class fallacy, undermining one of the impossibility’s key terms.

Non-Western frameworks offer genuinely different angles. Abeba Birhane’s landmark 2021 paper in *Patterns* proposed a shift from rational to relational thinking about personhood and justice, drawing on Ubuntu philosophy — “I am because we are.” Ubuntu’s emphasis on communal relations rather than individual rights suggests fairness definitions rooted in collective wellbeing rather than statistical parity between groups.

This resonates deeply with something I’ve been exploring in my own work. Jewish legal tradition — *Halacha* — never attempted to reduce justice to a single metric or even a set of competing metrics. It built a hierarchical value system with explicit priority structures, case-based reasoning refined over millennia, and institutional skepticism built into the architecture itself. The Sanhedrin’s unanimity rule — that a unanimous guilty verdict results in *acquittal* because unanimity signals systemic failure rather than certainty — embodies something the algorithmic fairness field is only now discovering: when a system produces a result with total confidence, that should trigger greater scrutiny, not less.

The impossibility theorem proves that you can’t formalize fairness into simultaneously satisfiable statistical constraints. But the philosophers — and the older traditions — are saying something more important: the attempt to formalize fairness into statistical constraints was the wrong move in the first place.

---
## A growing movement says the whole paradigm is the problem

The most provocative response to the impossibility theorem is that it proves the entire fairness framework is misguided — that trying to make algorithms “fair” is a distraction from structural change.

Arvind Narayanan, the Princeton professor who co-authored the field’s definitive textbook (*Fairness and Machine Learning*, MIT Press, 2023), wrote in 2026 that he had become “disillusioned with algorithmic fairness research and stopped working in the area.” He called co-authoring the textbook “a half-decade-long exercise in disillusionment” and argued the fairness movement “has been only minimally effective at preventing harms.” The impossibility theorem, he said, “makes for seemingly profound debates” but is “effectively a category error” — because the statistical properties of algorithms “tend to have at best a nebulous relationship with real-world outcomes for people.”

Algorithmic fairness is, in his framing, “a bandage for a bandage” — the algorithm itself distracts from the real harms, so fairness *of* the algorithm is two levels removed from what actually needs fixing.

Ruha Benjamin’s *Race After Technology* established the concept of the “New Jim Code” and an explicitly abolitionist approach — arguing some algorithmic systems should not be reformed but dissolved. The shift from “algorithmic fairness” to “algorithmic justice” as a framing is gaining traction. A 2026 systematic review in *AI and Ethics* identifies a “third wave” in the field, moving from distributive fairness ideals to relational justice theories that foreground power dynamics, structural oppression, and participatory governance rather than statistical metrics.

---
## The original researchers have largely moved on

The trajectory of the impossibility theorem’s own authors tells its own story.

Sendhil Mullainathan returned to MIT in 2024 and pivoted to using algorithms as tools for scientific discovery — he has left fairness behind as a primary research focus. Jon Kleinberg won the 2024 World Laureates Association Prize and continues working on how algorithms interact with human systems but has not revisited the impossibility theorem. Alexandra Chouldechova moved to Microsoft Research’s FATE group and shifted toward applied measurement and LLM representational harms. Moritz Hardt, at the Max Planck Institute, delivered the field’s most devastating internal critique with the ICLR 2024 paper showing years of work didn’t beat simple post-processing.

None of them are still working on the impossibility theorem itself. It is settled mathematics. The question is what to build on top of it — and on that, the field is deeply divided.

---
## Where this actually stands

The COMPAS case remains unresolved in exactly the way the impossibility predicts. A 2024 Williams College study found the tool “exacerbated differences in confinement between racial groups, thereby deepening racial disparity.” No criminal justice system has adopted an explicit framework for choosing between fairness definitions. COMPAS remains in use across multiple U.S. states.

The Obermeyer et al. healthcare algorithm case — where a widely used tool predicted healthcare costs instead of healthcare needs, reducing Black patients identified for care management from 46.5% to 17.7% — did produce change. The manufacturer cooperated with researchers to develop a revised algorithm that reduced racial bias by 84–86%. But that was a fixable proxy error, not a fundamental tradeoff between fairness definitions.

In credit scoring, a 2025 systematic review found “there is no consensus on a universal fairness model that is compatible across all jurisdictional settings.” The dominant real-world pattern remains ad hoc: organizations pick a metric based on legal exposure, internal politics, or technical convenience, rarely documenting the tradeoffs explicitly.

---
## What this means

Three genuine advances deserve recognition. Approximate fairness demonstrates the impossibility is far less binding in practice than in theory. Causal context shows the “right” fairness metric depends on why the data is biased, partially dissolving the need for simultaneous satisfaction. Dynamic approaches prove that in realistic settings where decisions reshape populations, the impossibility evaporates over time.

But the deeper current is a loss of faith in the formal fairness paradigm altogether. When the field’s most prominent textbook author calls it a “category error,” when the most rigorous meta-study shows seven years of papers didn’t beat the simplest baseline, when the original researchers have moved on to different questions — the message is hard to miss. The impossibility theorem was a warning signal. The field heard it, struggled with it for a decade, and is now split between those who found workable accommodations and those who concluded the entire framework was looking in the wrong place.

The honest assessment: the impossibility theorem is neither the barrier it was once feared to be nor the right frame for the challenges that remain. What it *is* — and what makes it permanently important — is a proof that the question “is this algorithm fair?” has no single answer. It forces the real question into the open: *fair according to whom, measured how, and who decides?*

And right now, the people deciding are the people deploying the algorithms. Not the people affected by them. Not the regulators. Not the philosophers. Not the communities. The companies.

The impossibility theorem didn’t break AI fairness. It revealed that AI fairness was never a technical problem. It was always a political one — wrapped in math so it would look like someone else’s department.

---*This piece draws on the impossibility proofs of Chouldechova (2017) and Kleinberg, Mullainathan & Raghavan (2016); the approximate fairness results of Bell et al. (FAccT 2023); causal fairness work by Anthis & Veitch (NeurIPS 2023) and Beigang (2023); the meta-analysis by Cruz & Hardt (ICLR 2024); regulatory analysis of the EU AI Act, NIST AI RMF, ISO/IEC TR 24027:2021, and NYC Local Law 144; philosophical critiques by Green (2022), Hu (2025), Hellman, Beigang (2023), and Birhane (2021); Narayanan’s 2026 essay on algorithmic fairness as category error; the COMPAS analysis by ProPublica and Northpointe; the Obermeyer et al. (2019) healthcare algorithm study; and the 2026 systematic review in AI and Ethics on the field’s “third wave.”*

Thanks for reading! Subscribe for free to receive new posts and support my work.

