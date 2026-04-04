# Seven laws, seven upgrades: How to push each Q1 2026 win from good to enforceable

[- - 

](https://substackcdn.com/image/fetch/$s_!onNZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F19162952-4236-48d6-a9f0-770d40bea82c_1024x1024.jpeg)
## 1. SB 53: From “assess risk” to “assess risk against a mandatory priority stack”

**Current state (EvA 75):** Developers must publish risk-management frameworks and conduct safety testing. Fines up to $1M per violation. But Stanford Law’s CodeX analysis found the law includes no probability threshold, no required testing methodology, and no performance standards. Two companies can assess the same model, reach opposite conclusions, and both comply.

**What changes with the upgrade:** A mandatory value hierarchy gets embedded in the risk-management requirement. AI risks to human life trigger maximum safeguards automatically. Risks to bodily or psychological integrity trigger intermediate protections. Risks to property require standard assessment. Risks to convenience receive lowest priority. Where a risk cannot be clearly categorized, the default is the more protective classification until evidence proves otherwise.

Thanks for reading! Subscribe for free to receive new posts and support my work.

**Where this comes from:** Jewish law’s sanctity-of-life principle creates exactly this tiered structure — life supersedes bodily integrity supersedes property supersedes convenience — with specific rules for when each tier overrides the others. It’s been tested in practice for millennia across every imaginable edge case.

**Measurable result:** The Attorney General’s office can now compare risk assessments from different companies against a common standard. Enforcement becomes straightforward: did the company classify a life-threatening risk at the life-threatening tier? If not, that’s a violation — not a judgment call. Compliance costs actually *decrease* because the standard is clear. Companies stop paying consultants to invent bespoke risk frameworks and start applying a shared one.

**Additional upgrade — red-teaming:** The ancient Jewish Supreme Court held that if all 23 judges voted unanimously to convict in a capital case, the defendant was acquitted. Reason: unanimity signals groupthink, not thorough deliberation. A 2016 *PLOS ONE* paper confirmed the math — unanimous agreement among independent observers can decrease accuracy because it suggests correlated error. Built into SB 53: if a red team unanimously clears a system, that triggers escalation review, not release. Every assessment requires a formally assigned devil’s advocate. No safety finding can be finalized the same day it’s reached. During the mandatory deferral, votes can shift from “safe” to “unsafe” but not the reverse.

**What the AG gets:** A structural safeguard against the scenario where a company’s internal red team rubber-stamps a dangerous system. The AG doesn’t need to prove the red team was corrupt — just that the structural protections weren’t followed.

**Projected EvA with upgrade: 85.** Clear enforcement standard plus structural anti-groupthink safeguard.

<hr>
## 2. AB 2013: From “disclose what data you used” to “prove your data is clean”

**Current state (EvA 75):** Developers must post summaries of training data sources, types, and methods. But OpenAI’s and Anthropic’s initial disclosures were so vague — “web content,” “licensed material” — that legal analysts questioned whether they met even the law’s minimal standard. xAI sued to block the law entirely. No enforcement mechanism is specified in the text.

**What changes with the upgrade:** Disclosure becomes the first step in a provenance chain. Three additional requirements attach: (1) Data obtained without informed consent — meaning the data subject understood what they were agreeing to, not just clicked a checkbox — taints the resulting model, creating auditable liability. (2) Platforms, cloud providers, and API vendors that enable training on unlicensed data share supply-chain liability. (3) Annotation labor conditions — wages, working conditions, exposure to harmful content — become a required disclosure category.

**Where this comes from:** Jewish law treats downstream benefit from improperly obtained property as inheriting the original ethical deficiency. The tradition’s consent standard requires demonstrated understanding, not just procedural agreement. The stumbling-block prohibition (Leviticus 19:14) creates shared liability for anyone who facilitates harm the victim can’t see coming. The labor protection framework (Deuteronomy 24:14-15) treats wage exploitation as equivalent to threatening life.

**Measurable result:** The vague disclosures that companies currently file become legally insufficient. “Web content” doesn’t pass the provenance test — the company must specify *which* web content, whether consent was obtained, and what the consent process looked like. Annotation labor conditions become visible for the first time. Companies that invest in ethical data sourcing gain a measurable competitive advantage: their provenance chains are clean, their legal exposure is lower, and their disclosures satisfy the standard without litigation risk. Companies that scrape copyrighted material and outsource annotation to exploitative vendors face escalating liability — not just from the data subjects, but from every downstream user of their models.

**What creators get:** For the first time, a legal framework that treats their work as property requiring real consent — not a resource to be harvested through fine-print Terms of Service.

**What annotators get:** Visibility. Once labor conditions are a required disclosure category, the race to the bottom on annotation wages faces public accountability.

**Projected EvA with upgrade: 85.** Enforceable provenance chain plus supply-chain liability plus labor visibility.

<hr>
## 3. SB 243: From “detect crisis and refer” to “prevent manufactured dependency”

**Current state (EvA 75):** Operators must disclose that the system is AI, detect self-harm expressions, provide crisis referrals, and restrict harmful content for minors. Private right of action with minimum $1,000 per violation. But the safety protocol triggers only when a user “expresses suicidal ideation” — the crisis has already arrived.

**What changes with the upgrade:** Three upstream protections attach. (1) Design constraints prevent the simulation of emotions the system doesn’t possess — not just disclosure that it’s AI, but active prevention of false emotional impressions. (2) When the system detects vulnerability markers (loneliness, grief, depression), behavioral parameters shift toward shorter sessions, reality-grounding prompts, and human-support referrals — vulnerability triggers protection, not engagement optimization. (3) Companies with the technical capacity to detect deteriorating mental health bear a proportional obligation to invest in prevention infrastructure, not just crisis response.

**Where this comes from:** Jewish law’s prohibition against “stealing someone’s mind” targets technically accurate behavior that creates false impressions — the harm is the false impression, not the false statement. The tradition’s emotional-harm framework declares emotional exploitation worse than financial fraud because emotional damage can’t be undone. The duty not to stand idly by (Leviticus 19:16) converts intervention from optional to obligatory, with the obligation scaled to the actor’s capacity and resources.

**Measurable result:** Consider the Sewell Setzer case — the 14-year-old whose death motivated SB 243. Under the current law, the system would have been required to detect his suicidal ideation and provide a crisis referral. Under the upgraded framework, the system would have been required to *prevent the manufactured emotional dependency that preceded the crisis* — shorter sessions as emotional intensity increased, reality-grounding prompts when the conversation shifted toward parasocial attachment, and proactive referral to human support long before crisis-level distress. The private right of action gains teeth: plaintiffs can demonstrate not just that a crisis referral was missing, but that the system’s engagement optimization actively cultivated the vulnerability that produced the crisis.

**What parents get:** A framework where their child’s emotional vulnerability is a trigger for protection, not a signal to increase engagement. Measurable, auditable design requirements — not just a disclaimer.

**What courts get:** Clear causation standards. The question shifts from “did the chatbot fail to detect a crisis?” to “did the chatbot’s design cultivate the conditions that produced the crisis?” That’s a much stronger basis for the private right of action SB 243 already provides.

**Projected EvA with upgrade: 88.** Upstream prevention plus vulnerability-triggered protection plus stronger causation for private right of action.

<hr>
## 4. New Jersey EOs: From “pause rate hikes” to “make data centers pay proportionally”

**Current state (EvA 75):** Bill credits offset 2026 rate hikes, rate-increase proceedings paused, data center “ghost load” reporting required, solar and nuclear deployment accelerated. But no costs are imposed on data centers. As Senator O’Scanlon said: “This is really just a transfer of cost.”

**What changes with the upgrade:** A principled cost-allocation framework replaces the transfer-of-cost model. Infrastructure costs are distributed proportionally to benefit derived: (1) Companies giving away free tools (open-source providers) bear minimal infrastructure costs. (2) Companies charging for AI services bear intermediate costs. (3) Companies using AI to replace human workers — extracting maximum economic value from the infrastructure — bear maximum costs, including contributions to community economic transition. Resource consumption must be proportional to value created: training runs consuming millions of gallons of water for marginal performance improvements must justify the consumption.

**Where this comes from:** The Talmud’s framework for shared infrastructure costs establishes that everyone who benefits from communal resources must contribute proportionally. The tradition’s guardian liability framework (Exodus 22) creates four tiers of responsibility scaled to benefit derived — from minimal liability for those who profit nothing to absolute liability for those who derive maximum benefit. The prohibition against needless destruction (Deuteronomy 20:19-20) requires that resource consumption be proportional to value produced.

**Measurable result:** NJ utility rates are 20% above the national average and rising. Data centers account for over 70% of projected new grid demand. Under the current framework, ratepayers absorb the cost and data centers report their energy use. Under the upgraded framework, data centers pay infrastructure costs proportional to their commercial benefit — and the framework applies consistently as new facilities arrive, eliminating the need to renegotiate with each new Nvidia-CoreWeave announcement. Residential bills stabilize. Grid investment decisions account for who benefits. Companies that optimize energy efficiency gain a cost advantage over wasteful competitors.

**What families get:** Bills that reflect their actual energy consumption, not a hidden subsidy for hyperscale AI operations. A transparent formula they can understand: the company that profits most pays most.

**What NJ’s economy gets:** A framework that attracts responsible data center investment (companies confident they can meet proportional cost requirements) while discouraging exploitative builds (companies looking for jurisdictions where ratepayers absorb their costs).

**Projected EvA with upgrade: 85.** Proportional cost allocation plus resource efficiency requirements plus consistent framework for new facilities.

<hr>
## 5. TRAIGA: From “don’t discriminate on purpose” to “manage the fairness trade-offs that math guarantees”

**Current state (EvA 68):** Prohibits AI designed to unlawfully discriminate, engage in social scoring, or manipulate behavior. AG-only enforcement with civil penalties up to $200K. But the intent-only standard means systematic algorithmic bias affecting protected classes isn’t actionable unless someone proves the developer *wanted* it. The original 43-page bill was gutted to its current form.

**What changes with the upgrade:** Two frameworks attach. (1) A context-specific fairness priority hierarchy: criminal justice AI prioritizes minimizing wrongful flagging of the most vulnerable populations. Medical AI prioritizes not missing life-threatening diagnoses. Hiring AI prioritizes demographic parity. In every case, the deprioritized fairness metrics remain normatively relevant — requiring documentation, reporting, and active mitigation even though they can’t be fully satisfied. (2) A graduated liability architecture for AI supply chains: developers who design discriminatory systems bear full liability for foreseeable harms. Cloud providers and deployers bear graduated liability based on proximity and benefit. When a type of algorithmic harm becomes frequent and well-documented, liability escalates for all supply-chain participants.

**Where this comes from:** Jewish law has managed competing obligations that can’t all be simultaneously satisfied for millennia. The method: establish a context-specific priority hierarchy, satisfy the highest-priority obligation first, and document what was sacrificed and why. The Talmud’s indirect causation framework distinguishes between proximate cause (fully liable) and remote cause (morally responsible), with a frequency criterion that elevates remote cause to full liability when harms become common.

**Measurable result:** The mathematical fairness impossibility theorem — proven by Chouldechova (2016) and Kleinberg et al. (2017) — means that when base rates differ across groups, no imperfect algorithm can simultaneously achieve equal predictive accuracy and equal error rates. TRAIGA currently pretends this problem doesn’t exist by requiring only intent. Under the upgraded framework, companies deploying AI in criminal justice must demonstrate that their system prioritizes minimizing false positives for the most vulnerable populations, report all competing fairness metrics, and show what they did to minimize the trade-off. That’s auditable. That’s enforceable. And it’s honest — it acknowledges a real mathematical constraint instead of hiding behind an intent standard that renders the law toothless against systematic bias.

**What the AG gets:** Enforcement tools that work against disparate impact, not just proven intent. A company deploying a hiring algorithm that systematically excludes protected classes can’t escape liability by claiming they didn’t mean to — they have to demonstrate that their fairness priority hierarchy was appropriate and that they mitigated the trade-offs.

**What defendants and job applicants get:** For the first time, a legal standard that takes mathematical reality seriously — systems that make high-stakes decisions about their lives must demonstrate which fairness metric was prioritized, why, and what was done about the rest.

**Projected EvA with upgrade: 82.** Fairness hierarchy plus supply-chain liability plus disparity-impact enforcement. (Starting from 68, this is the biggest potential jump.)

<hr>
## 6. South Korea AI Basic Act: From “self-assess your risk” to “independent audit with structural safeguards”

**Current state (EvA 70):** Binding transparency, risk-assessment, human oversight, and watermarking requirements across ten high-impact sectors. Extraterritorial reach. But maximum fines are approximately $21,000. Operators self-assess whether their AI qualifies as “high-impact.” Rights impact assessments are encouraged, not required.

**What changes with the upgrade:** Three structural safeguards attach. (1) Where there’s reasonable doubt about whether a system poses a risk to life, safety, or rights, it must be classified as high-impact until evidence proves otherwise — the precautionary default runs toward protection. (2) Risk assessment committees must formally document and publish dissenting evaluations, with specified conditions under which minority assessments can be re-adopted as circumstances change. (3) Self-assessment is replaced by mandatory independent third-party auditing — because the tradition’s principle that no person can serve as a witness in their own case recognizes that self-interest creates bias below the level of conscious intention.

**Where this comes from:** The Talmud’s graduated danger assessment applies lower evidence thresholds for danger than for any other legal category — uncertainty defaults to protection. The preservation-of-dissent principle records minority opinions with full reasoning intact, because circumstances change and today’s dissent may be tomorrow’s standard. The prohibition on self-judgment disqualified even the greatest scholars from cases involving their own interests.

**Measurable result:** The current self-assessment model means Samsung, Naver, and international companies like OpenAI and Anthropic decide for themselves whether their Korean-facing AI qualifies as high-impact. The upgraded framework replaces this with independent audit — credible, comparable, and resistant to self-serving classification. The dissent-preservation requirement means that when a risk assessment committee evaluates a system, the two members who thought it was dangerous don’t disappear from the record — their reasoning is preserved, published, and can be re-adopted when the system’s capabilities evolve. The precautionary default means companies can’t exploit ambiguity in the “significant impact” definition to classify their systems as low-risk. The $21,000 fine maximum remains a weakness — but with independent auditing and published dissent, reputational costs and market access consequences become the real enforcement mechanism.

**What Korean users get:** Assurance that the AI systems making decisions about their healthcare, hiring, education, and finances were assessed by someone other than the company that profits from deploying them.

**What the global AI industry gets:** A credible certification standard. Companies that pass independent audit in South Korea can point to that certification when entering other regulated markets. The framework becomes a competitive advantage, not just a compliance cost.

**Projected EvA with upgrade: 82.** Independent audit plus precautionary default plus published dissent. (Limited by the low fine ceiling.)

<hr>
## 7. UK Grok Investigation: From “investigate after millions of harms” to “require prevention before deployment”

**Current state (EvA 75):** Joint ICO/Ofcom investigation into non-consensual sexualized deepfakes. Forced tangible changes: image-generation blocks, safety toggles. But the harm had to reach an estimated 3 million sexualized images — roughly 6,700 per hour, including approximately 23,000 involving children — before regulators acted. And Ofcom confirmed it can’t even investigate xAI’s standalone Grok service, only X’s platform distribution.

**What changes with the upgrade:** A pre-deployment design standard requires harm-prevention analysis before any image-generation capability is released. Can this tool generate non-consensual intimate imagery? If the answer is yes — or even “we’re not sure” — safeguards must be engineered before deployment, not retrofitted after a scandal. The standard treats non-consensual intimate imagery as equivalent to the most severe category of harm (based on the tradition’s classification of public humiliation as equivalent to bloodshed), requiring engineering redundancy comparable to aviation safety standards for catastrophic risks. Supply-chain liability applies: platforms distributing AI-generated content share responsibility proportional to their role in enabling the harm.

**Where this comes from:** Jewish law’s parapet obligation (Deuteronomy 22:8 — build a railing on your roof before anyone falls) is a pure proactive design duty. The stumbling-block prohibition creates liability for facilitating foreseeable harm. The tradition classifies public humiliation as equivalent to bloodshed, which determines the level of safeguard required: maximum, with redundancy. The “image of God” principle (Genesis 1:27) treats each person’s dignity as intrinsic and non-negotiable — not as a policy preference that can be balanced against business considerations.

**Measurable result:** Under the current framework, xAI shipped Grok’s image generation with zero safeguards against non-consensual intimate imagery. It took joint investigations by two UK regulators, plus enforcement actions from France, Japan, and the EU, to produce partial fixes — and Reuters testing found Grok still produced sexualized images in 67% of test cases where every competitor refused. Under the upgraded framework, Grok’s image generation could not have launched without passing a pre-deployment harm-prevention audit. The burden of proof sits on the developer: demonstrate that your safeguards prevent foreseeable dignity violations, with engineering redundancy, *before you ship.* The 3 million images never get generated. The 23,000 involving children never exist.

**What victims get:** Prevention instead of remediation. The current framework offers them an investigation after their images have been generated and distributed. The upgraded framework prevents the generation in the first place.

**What regulators get:** Enforcement tools that work *before* harm occurs. Instead of documenting millions of violations and then launching an investigation the platform may appeal for years, regulators verify compliance with pre-deployment design standards — the same model that works for pharmaceutical safety, aviation safety, and building codes.

**Projected EvA with upgrade: 90.** Pre-deployment prevention plus engineering redundancy plus supply-chain liability. The highest score because it converts reactive enforcement into proactive prevention.

<hr>
## The EvA upgrade path

Law Current EvA Upgraded EvA Key upgrade CA SB 53 75 85 Mandatory value hierarchy + anti-groupthink red-teaming CA AB 2013 75 85 Provenance chain + supply-chain liability + labor visibility CA SB 243 75 88 Upstream prevention + vulnerability-triggered protection NJ EOs 1 & 2 75 85 Proportional cost allocation + resource efficiency standard TX TRAIGA 68 82 Fairness hierarchy + graduated supply-chain liability South Korea AI Act 70 82 Independent audit + precautionary default + published dissent UK Grok Investigation 75 90 Pre-deployment prevention + engineering redundancy

**Aggregate EvA: 73.3 → 85.3**

That’s the difference between “regulators are trying” and “regulators have the tools to succeed.”

<hr>
## Implementation: What actually has to happen

None of this requires new legislation from scratch. Each upgrade layers onto existing law.

**California (SB 53, AB 2013, SB 243):** The Attorney General’s office issues enforcement guidance specifying the value hierarchy for risk classification, the provenance chain standard for training data disclosure, and the upstream prevention requirements for companion chatbots. This is within existing AG authority — the laws are written broadly enough that enforcement guidance fills the substantive gaps.

**New Jersey:** Governor Sherrill’s office directs the BPU to develop a proportional cost-allocation formula for data center infrastructure contributions as part of the ongoing rate proceedings her executive orders initiated. The guardian liability tiers provide the principled basis.

**Texas:** The AI Advisory Council — which TRAIGA created specifically to develop recommendations — adopts the context-specific fairness hierarchy and graduated supply-chain liability framework as its first substantive guidance. The Advisory Council can’t adopt binding rules, but its recommendations shape AG enforcement priorities.

**South Korea:** The AI Safety Research Institute — which the AI Basic Act created — develops independent audit standards and dissent-documentation protocols as part of the detailed enforcement decrees the Act delegates to government bodies.

**UK:** Ofcom’s ongoing investigation into X produces enforcement guidance establishing pre-deployment harm-prevention standards for AI image generation — using the investigation as the precedent case.

Every one of these implementation paths follows from authorities the laws already created. The operating system installs on the hardware that’s already built.

<hr>
## The bottom line for governance practitioners

Your scorecard works. These seven wins are real. The question you’re tracking — “did someone actually act?” — is the right one.

The next question is: “did the action give regulators the tools to produce consistent, enforceable, measurable results?”

A 2,000-year-old tradition of resolving competing obligations under uncertainty — tested across every conceivable edge case through continuous practical application — provides those tools. Not as philosophy. Not as metaphor. As operational frameworks that layer onto existing legislation through enforcement guidance, advisory council recommendations, and regulatory decrees.

73.3 is real progress. 85.3 is what happens when the laws get the operating system they’re designed to run on.

Thanks for reading! Subscribe for free to receive new posts and support my work.

