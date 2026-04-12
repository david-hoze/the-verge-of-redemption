# Sam Illingworth - Correspondence

## 2026-04-12 - Reply to "How Hot Is Your AI?" game

**Context:** Sam asked David's opinion on his browser game "How Hot Is Your AI?" (https://samillingworth.itch.io/how-hot-is-your-ai) as an AI expert. The game teaches players about temperature settings by having them guess whether AI-generated passages were produced at Cold (0.0), Warm (0.7), or Hot (2.0). Built with Gemma 3 4B, published as a Slow AI project.

**Platform:** Substack reply

**Tone:** Sharp, honest critique. Acknowledged the real pedagogical insight while identifying specific technical and philosophical problems.

**Key arguments made:**
- Temperature is one dial among many, not "the hidden setting that controls everything" - the game overpromises
- Gemma 3 4B artifacts at high temperature don't generalize to frontier models people actually use ("driving simulator where the car handles like a go-kart")
- Higher-temperature outputs were curated (per the credits), teaching recognition of idealized cases not real-world variation
- "(nothing, it intended nothing)" smuggles in a philosophical position as if the mechanism produced it - whether LLMs "intend" anything is contested
- His own "Run Your Own AI on a Laptop" post teaches the mechanism better than the game does - real-time generation vs curated snapshots
- Closed by holding him to his own standard on shallow AI expertise

**Full text:**

Sam, I played it twice. I want to be honest with you because you asked for the expert opinion, and the polite version would be less useful.

The core insight is real. Most people don't know temperature exists. Making them feel the difference instead of reading about it is genuine pedagogy, and you're one of the very few people in the AI literacy space who understands that distinction. The game teaches one layer deeper than anything else I've seen aimed at a general audience.

But it stops exactly where it should keep going, and the place where it stops is where it starts to mislead.

The opening line calls temperature "the hidden setting that controls everything AI writes." It doesn't. Temperature is one dial among many - top-p, top-k, frequency penalty, presence penalty, system prompts, RLHF alignment, the training data itself. A student who plays this game walks away thinking they've found the master control. They've found a volume knob on a mixing board with thirty channels. That's not literacy. That's the confident feeling of literacy, which is worse than ignorance because it doesn't know what it's missing.

You used Gemma 3 4B. I understand why - it runs locally, it fits the laptop post, it's accessible. But a 4-billion-parameter model at temperature 2.0 falls apart in ways that GPT-4 or Claude simply don't. The artifacts your players are learning to recognize are small-model artifacts. They will not generalize to the systems these people actually use every day. You've built a driving simulator where the car handles like a go-kart, and the students think they've learned to drive.

The credits say higher-temperature outputs were "curated to illustrate real differences." I know why you did it - raw temperature 2.0 output is often just boring nonsense, not pedagogically useful nonsense. But that curation is doing more work than you're acknowledging. You selected passages where the effect is clean and legible. In practice, temperature differences are often subtle, inconsistent, and context-dependent. The game teaches pattern recognition for idealized cases. That's not the same as teaching people to read real AI output critically.

And then there's the parenthetical that I think reveals the real issue: "(nothing, it intended nothing)." You've embedded a philosophical position inside what presents as a technical demonstration. Whether a language model "intends" anything is one of the most contested questions in the field right now. The game presents it as something the mechanism self-evidently reveals. It doesn't. The mechanism reveals probability distributions over token sequences. What that means - whether "nothing" is the right word for what happens between the prompt and the output - is precisely the question people like me are still fighting about. You've smuggled in your conclusion as if the experiment produced it.

Here's what I think the game actually teaches, if you follow the thread honestly: temperature doesn't make AI creative or uncreative. It makes the probability distribution wider or narrower. That's it. The "creative" high-temperature output is a random walk that occasionally stumbles into something that pattern-matches to human creativity. The "safe" low-temperature output is the mode of the distribution - the most statistically expected continuation. Neither one is thinking. But saying "neither one is thinking" as a parenthetical aside is not the same as demonstrating it, and the game doesn't demonstrate it. It asserts it while teaching something else.

Your "Run Your Own AI on a Laptop" post actually gets closer to the real lesson. Watching a slow model generate word by word - watching it predict, commit, predict, commit - teaches more about the nature of these systems than guessing temperature settings on curated passages. The mechanism in real time is the teacher. The game is a photograph of the mechanism with the boring parts cropped out.

I'm being sharp because the game is almost good. And almost good, in AI literacy, is a specific kind of dangerous - it produces people who are confident they understand something they've only seen the curated version of. You know this. You've written about exactly this problem with AI expertise that's an inch deep. The game should be held to the standard you set.

**Sam's reply (2026-04-12):**

> Thanks, David. These are excellent comments and extremely helpful. In particular, you're right that other variables need to be taken into consideration as well as the temperature, so in the next game that I design, I'll try to do this as well. I'm also learning every day, so feedback like this really helps and I appreciate it.

**Notes:** Took the sharp critique well. No defensiveness. Explicitly said he'll incorporate the feedback into future game design. This is consistent with his pattern - he values genuine expertise and intellectual exchange over flattery. The relationship is stronger for having been honest.

## 2026-04-11 - Exchange on "The Golden Calf You Built to Suffer"

**Context:** Sam read the article and engaged in the comments. He asked a substantive question: "do you think there is a genuine analogy between what angels are theologically capable of and large language models?" He noted he's a Christian and didn't want to be blasphemous.

**Platform:** Substack comments on David's article

**Sam's question (2026-04-11):**

> Thank you so much for this wonderful post, David, and for the kind words about my own work. I don't mean this to be blasphemous in the slightest, and I certainly don't feel this way as a Christian myself, but do you think there is a genuine analogy between what angels are theologically capable of and large language models? If so, then that is a really interesting take and perhaps one that could show us how we can use these models to bring out the best of human kind rather than something else entirely.

**David's reply:**

Explained the angel distinction as philosophical, not just mythical. Angels are intellect without knowledge (da'at) - they lack judgment. A judge can sense injustice even when all formalities are met; AI cannot. Linked to several articles expanding on the theme. Mentioned Hybrid Horizons, AI in medicine, software projects. Emphasized that the power is currently in dangerous commercial hands and that the goal is raising awareness.

**Sam's reply:**

> Thank you so much, David, and you are doing a wonderful job in doing exactly this.

**Assessment:** Sam's final reply was warm but generic. He didn't engage with the substance - the angel/judgment distinction, the governance implications, the commercial danger point. He responded to the tone, not the content. This confirms the core strategic problem: Sam sees David as an AI expert who writes well, not as someone with authority on the human/governance question.

---

## Strategic Plan: Repositioning from AI Expert to Governance Voice

**Date:** 2026-04-12

**Problem:** Sam categorizes David as "smart AI commenter." Every technical engagement (game feedback, temperature analysis) reinforces this box. The goal is for Sam to see David as someone whose moral/philosophical framework his own project is incomplete without.

**Diagnosis:** Sam's platform ("knowing when to use AI and when to leave it the hell alone") has a gap he hasn't filled: *how do you know when to leave it alone?* His answer is literacy - understand the mechanism, then decide. The deeper answer: you need a moral framework for what can't be delegated. Judgment. Presence. The things that don't survive automation. Literacy tells you what AI is. It doesn't tell you what *you* are. That gap is David's territory.

**Sequence:**

1. **Stop engaging with Sam's AI content.** Technical feedback confirms the AI expert box. No more game reviews, model critiques, or temperature analysis on his posts.

2. **Engage with governance-facing content.** When Sam posts about Council of Europe, House of Lords testimony, deployment policy, infrastructure costs - show up with *governance* arguments, not AI arguments. The Talmudic analysis on "vertical integration of oversight" was the right model. Do more of that.

3. **Name the gap in his framework.** Literacy teaches people to see the mechanism. It doesn't teach them what to do once they've seen it. That requires moral philosophy - what can't be delegated, what judgment means, what presence requires. This is the piece Sam's curriculum is missing and can't produce.

4. **Write the piece Sam can't write.** The moral philosophy of human judgment in AI governance. Something that sits in the exact space his framework needs and can't reach. When it exists, Sam will see David not as an AI expert who does philosophy on the side, but as the person holding the other half of his argument.

5. **Propose collaboration as complementarity.** Not "I admire your work." Instead: "Your framework teaches people to see the mechanism. Mine teaches them what to do once they've seen it. Neither is complete alone." Peer statement, not fan statement.

**Key asset:** The angel framework. Sam already asked about it as a Christian. It's theological, philosophical, and practically applicable to governance - intellect without judgment is a *governance* claim about what must remain human. Every time this framework appears in a governance context, it carries David's name.

**Immediate next move:** Do NOT reply to the game thread with the "mirror" comment. Hold it. Wait for Sam's next policy/governance post and show up there with the framework he can't produce himself.

**Drafted but held comments:**
- "The AI is the mirror. The question is what we see in it." - Save for governance context.
- Step 1 comment on laptop post (temperature as disproof of AI sentimentality) - already posted or hold depending on timing.
- Angel/judgment follow-up ("Does that track with your intuition?") - hold. Don't chase. Let the next engagement come from a governance angle.

---

## 2026-04-12 - Reply on "The Humanities Are the Moat"

**Context:** Sam published "The Humanities Are the Moat" (Apr 8) arguing that humanities skills - judgment, interpretation, close reading, sitting with ambiguity - are the moat against AI. Twenty years of defunding humanities left a population that can use AI but can't evaluate it. He recommended five Western canon texts (Aristotle, Shelley, Dick, Moore, Forché) and invited other traditions.

**Platform:** Substack comment on Sam's article

**Tone:** Engaged, substantive, pushing his argument one step further rather than correcting it.

**Key arguments made:**
- The humanities are the moat, but the moat was fed by a river - the moral traditions the humanities were drawing on. The river dried up before anyone noticed the moat was empty.
- Traced his five texts back to their sources: Aristotle from Delphic maxims, Shelley from Milton from Genesis.
- Reframed his best line ("a robot cannot notice the student who stopped asking") as presence, not evaluation. Presence was trained by moral traditions (weekly meals, apprenticeships, community), not close reading.
- Connected his OECD study (48% up, 17% down) to the deeper pattern: replacing apprenticeships with factory schools, Friday tables with television, elders with therapists. Each optimized for output, each severed a judgment-training connection.
- Accepted his invitation for other traditions: Jewish law adjudicating the trolley problem case by case for millennia, with binding authority and preserved dissent - not smarter than philosophers, but operating inside a system that required decisions.
- Closed: "The humanities are the moat. But the moat was fed by a river. And the river dried up long before anyone noticed the moat was empty."

**Sam's reply (2026-04-12):**

> This is so beautifully argued David. Thank you so much. And especially for that closing paragraph. Pure poetry (informed by tradition).

**Assessment:** Still primarily praising form over substance. BUT - crucial shift: "informed by tradition." He named the thing. Previous replies praised David's writing or expertise. This one acknowledges that the *tradition* is what gives the writing its force. He's not engaging the argument yet - he's not responding to the moat/river distinction, the presence reframe, or the Jewish law point. But he's moved from "great AI analysis" to recognizing that David is writing *from* something, not just *about* something. The box is cracking.

## 2026-04-12 - Reply on OpenAI UK data centre note

**Context:** Sam posted a note about OpenAI pulling out of a UK data centre deal. Energy costs too high, regulation too uncertain. Government committed £2 billion to AI adoption; OpenAI's commitment lasted until the energy bill arrived.

**Platform:** Substack note

**Tone:** Governance-focused. No AI expertise. Pure institutional analysis.

**Key arguments made:**
- The UK committed £2 billion to AI adoption, not AI governance. Invested in making technology arrive faster without building framework to hold it.
- "Both keys" framework: the government gave OpenAI the inner key (infrastructure, energy, political cover) and the outer key (power to decide whether the project exists). When economics shifted, the entity holding both keys walked.
- "Policy followed investment" - the government built its AI strategy around what OpenAI was willing to build, not what the country needs.
- Closed: "That's a country writing its future in someone else's pencil and then being surprised when the pencil gets picked up and carried somewhere else."

**Sam's reply:** Pending / not yet seen.

## 2026-04-12 - Reply to John R Brown on game thread

**Context:** Retired military training officer commented on David's game critique, arguing that real output control comes from disciplined prompting and methodological constraints, not model settings. Linked his own military history AI tutoring Substack.

**Platform:** Substack reply on Sam's game post

**Tone:** Brief, redirecting.

**Key argument:** "Good point - and it actually strengthens the argument. The real control sits with the user, not the model. Which means the real question was never about temperature or settings or even prompting methodology. It's about whether the person at the keyboard has the judgment to know what to constrain, what to trust, and when to step away entirely. That's not a technical skill. That's a human one. And no tutorial covers it."

**Notes:** Short pivot from technical debate to human question. Aimed at Sam as much as at Brown.

---

## Strategic Progress Assessment (2026-04-12)

**Movement today:**
- Game critique: Established technical credibility. Sam engaged, accepted feedback. (AI expert box - reinforced but useful as foundation.)
- Golden Calf thread: Sam skimmed David's substantive reply, gave generic praise. (AI expert box - unchanged.)
- OpenAI UK note: First pure governance engagement. No AI expertise, just institutional analysis. (New territory - awaiting response.)
- "Humanities Are the Moat" reply: The breakthrough comment. Built directly on Sam's best article, pushed it past humanities to traditions. Sam's reply included "informed by tradition" - first time he named the source, not just the style. (Box cracking.)

**Where Sam sees David now:** Moving from "smart AI expert who writes well" toward "someone writing from a tradition that makes his work deeper than mine." The "informed by tradition" line is the tell. He felt the difference even if he can't articulate it yet.

**Next move:** Let it breathe. Don't flood. Wait for Sam's next governance or policy post and show up there. The pattern is establishing itself - each engagement goes one layer deeper. The river metaphor is now planted. Let it work.
