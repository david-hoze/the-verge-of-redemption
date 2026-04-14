# The Confidence Is the Bug

*A controlled study found AI tools made experienced developers 19% slower. The developers believed they were 20% faster. The 39-point gap is where your users live.*

*Catch Me If You Can* (2002). Directed by Steven Spielberg. Leonardo DiCaprio, Tom Hanks, Christopher Walken. Frank Abagnale Jr. is sixteen years old and his family is falling apart. His father loses the house. His mother leaves. So Frank does what any resourceful teenager would do: he becomes a Pan Am pilot. Then a doctor. Then a lawyer. He prints checks that clear. He wears uniforms that work. He walks into hospitals, courtrooms, and cockpits with nothing but confidence and a surface-level understanding of the role - and nobody stops him. Not because the systems are stupid. Because confidence is what the systems are designed to detect, and Frank has it in unlimited supply. He flies actual flights. He passes actual exams. He earns actual money. Everything works, right up until someone's life depends on it. A doctor needs him to assess an injured boy. Frank sees blood and faints.

The uniform was real. The badge was real. The confidence was real. The competence was not. And the most important detail in the film is one that most viewers miss: Frank was not malicious. He loved the institutions he impersonated. He wanted to be a pilot. He wanted to be a doctor. He genuinely believed, in the moments he was performing, that the performance was close enough. The deception was sincere.

This is vibe coding.

## The 39-point gap

In July 2025, METR - a nonprofit research organization - published the most carefully designed study ever conducted on AI-assisted coding productivity. Sixteen experienced open-source developers, averaging over 22,000 GitHub stars per repository, were randomly assigned real issues from their own projects. Half the time they could use AI tools. Half the time they couldn't. Screen recordings tracked everything. The tools were frontier models - Cursor Pro with Claude 3.5 and 3.7 Sonnet.

The developers predicted, before the study began, that AI would make them 24% faster.

The measurement showed they were 19% slower.

After the study ended, the developers still believed AI had made them 20% faster.

That is a 39-percentage-point gap between perception and reality. Not a marginal miscalibration. A systematic inversion. The tool made them worse, and the tool made them unable to see that it had made them worse. The uniform fit perfectly. The pilot couldn't fly.

METR published a follow-up in February 2026 with a larger cohort - 57 developers, 800+ tasks. The slowdown shrank to 4%, which is within the margin of error. The perception gap did not shrink. Developers continued to report that AI made them faster. The best-case reading of the data is that AI tools have no measurable effect on experienced developers' speed. The worst-case is the original finding: negative productivity masked by positive feeling.

Neither case supports the claim that is currently restructuring the software industry.

## The inverse Dunning-Kruger

In October 2025, researchers at Aalto University published a finding that should have stopped the conversation. They ran two studies, approximately 500 participants total, measuring the gap between perceived and actual performance when using ChatGPT. The classic Dunning-Kruger effect - where low performers overestimate and high performers underestimate - vanished entirely when AI was involved.

Everyone overestimated. Regardless of skill level. And the more AI-literate the participant, the greater the overconfidence. Not less. More. The researchers' own words: "When it comes to AI, the Dunning-Kruger Effect vanishes. In fact, what's really surprising is that higher AI literacy brings more overconfidence."

Read that again. Knowing more about AI makes you worse at judging your own performance with AI. The expertise that should calibrate you is the expertise that miscalibrates you. The pilot who has studied aerodynamics is more confident in the cockpit than the kid who wandered in - and equally incapable of flying.

Most participants engaged in a single prompt per question. One prompt. No iteration, no verification, no critical assessment. They outsourced the thinking and accepted the first thing that came back. The researchers called it "cognitive offloading." The common name is trust.

## The code that clears

Frank Abagnale's checks cleared because the banking system validated surface features - paper stock, routing numbers, magnetic ink. The system was not designed to detect whether the person writing the check had money. It was designed to detect whether the check looked like a check.

AI-generated code clears for the same reason. It looks like code. It compiles. It runs. It passes syntax checks. As of 2025, AI models produce syntactically correct code over 90% of the time - up from less than 20% in early 2023. The surface has become nearly flawless.

The structure has not.

Veracode tested over 100 large language models across 80 coding tasks in four programming languages. Only 55% of AI-generated code passed security scans. That number has not changed since 2023. Three years of model improvements, benchmark gains, and breathless announcements - and the security pass rate is flat. Syntax correctness went from 20% to 90%. Security stayed at 55%. The check looks better every quarter. The account is still empty.

The details are worse than the number. Escape.tech scanned 5,600 publicly available applications built with AI coding tools. They found over 2,000 vulnerabilities. Four hundred exposed credentials - API tokens, database keys, passwords sitting in public endpoints. A hundred and seventy-five instances of exposed personal data: medical records, bank account numbers, phone numbers, emails. The testing was passive - they didn't even try to break in. They just looked at what was already visible.

CodeRabbit analyzed 470 pull requests comparing AI-authored and human-authored code. AI pull requests had 10.83 issues per PR versus 6.45 for human code. Readability issues were three times higher. Security issues were 2.74 times higher. Logic errors were 75% more common. Performance regressions - excessive I/O, unnecessary computation - were eight times more common.

The code compiles. The pilot is wearing the uniform. The check clears. The patient bleeds.

## The institution that said no

In March 2026, Apple quietly began blocking AI-generated apps from the App Store.

The mechanism was Guideline 2.5.2, which prohibits apps from downloading or executing code that changes functionality after review. Vibe-coding apps - by definition - generate and execute new code on demand. The guideline was written years before vibe coding existed. It applied perfectly.

The scale of what Apple was facing: an 84% jump in App Store submissions in a single quarter. 557,000 new app submissions in 2025 - the largest number since 2016. Review delays expanded from 24-48 hours to seven to thirty days. The system was being flooded with checks that looked like checks.

Tim Sweeney, CEO of Epic Games, called it stifling innovation. The developer of one blocked app filed a lawsuit. The discourse treated Apple as a gatekeeper threatened by democratization.

Here is what actually happened. Apple looked at the code that was flooding its review system. It saw what Veracode saw, what Escape.tech saw, what CodeRabbit saw, what METR saw. It saw code that compiled and was insecure. Code that ran and was fragile. Code that launched and exposed user data through public endpoints. And Apple did the thing that every other institution in the software industry has refused to do. It said: no.

Not "let's monitor." Not "let's add guardrails." Not "let's wait for the models to improve." No. The checks don't clear here.

The Talmud has a principle for this. In Bava Batra, the sages legislate that a craftsman who does work on another's property is liable for damage even if the work appears competent at the time. The test is not whether the work looks right. The test is whether the work holds. A wall that stands for a day and falls on the thirtieth is the builder's fault, not the homeowner's. The standard is not the appearance of quality at the moment of delivery. The standard is what happens when the building bears weight.

Apple applied Bava Batra to the App Store. Vibe coding produced walls that stood at review time. Apple asked what happens when the wall bears weight. The answer was: 2,000 vulnerabilities, 400 exposed credentials, and 175 instances of personal data sitting in public endpoints.

## The formation gap

Google's annual DORA report - the most comprehensive survey of software delivery performance - found in 2024 that for every 25% increase in AI tool adoption, delivery stability decreased by 7.2%. Not speed. Stability. The speed was fine. The code shipped. It shipped faster. And it broke more often.

By 2025, with AI adoption rising from 76% to 90% across the industry, the speed penalty disappeared. The stability penalty did not. The DORA team's conclusion: "The value of AI is unlocked not by the tools themselves, but by the surrounding technical practices and cultural environment."

Translated: the tools work when the people using them already know what they're doing. When experienced engineers use AI as an accelerator on judgment they already possess, the code is fine. When inexperienced engineers use AI as a substitute for judgment they haven't formed, the code compiles and the system degrades.

This is The Karate Kid in reverse. Daniel LaRusso spent weeks waxing cars and painting fences before he threw a single punch. The formation happened in his body before his mind could name it. When Miyagi threw punches at him, Daniel blocked every one. The blocks were already there. They had been built through repetitive, unglamorous, embodied practice that looked like wasted time.

Vibe coding skips the fence. It skips the car. It hands Daniel a black belt on day one and sends him into the tournament. He looks like a fighter. He has the moves. The first punch he takes, he goes down. And - this is the METR finding - he gets up believing he won.

GitClear analyzed 211 million changed lines of code from 2020 to 2024. In that period, refactoring - the practice of restructuring existing code to improve its design without changing its behavior - dropped from 25% of all code changes to under 10%. Code duplication rose 48%. Code churn - new code that had to be revised within two weeks - nearly doubled. Copy-paste code exceeded moved-and-refactored code for the first time in the history of the metric.

What is disappearing is not productivity. What is disappearing is the practice through which a developer learns why code is structured the way it is. Refactoring is wax-on, wax-off. It is the developer encountering their own previous work and making it better - and in the process, internalizing the structural principles that make code maintainable, secure, and resilient. When AI generates the code, the developer never encounters their own mistakes. They never refactor their own decisions. They never build the muscle memory that turns a coder into an engineer.

The checks clear faster. The pilot has more flights. The formation never happens.

## The sincere deception

Frank Abagnale eventually got caught. He went to prison. He came out and spent the rest of his career consulting for the FBI on fraud prevention - using the expertise he'd built by committing it. The con artist became the security expert because he understood the system's vulnerabilities from the inside.

Vibe coding has no such arc. The developer who ships insecure code with AI does not learn what went wrong, because the AI generated the vulnerability and the developer never understood the code well enough to see it. The feedback loop - the mechanism through which a craftsperson develops judgment - is broken. The developer did not learn how to write insecure code. They never learned how to write code at all. There is nothing to reform. There is no expertise to redirect. There is only confidence without contact.

The 2026 NBER survey of 6,000 executives found that 80% reported no productivity impact from AI over the prior three years. Expected improvement over the next three years: 1.4%. Daron Acemoglu at MIT projects 0.5% total factor productivity increase from AI over the next decade. The institutions that actually measure output - not sentiment, not intention, not vibes - are seeing nothing.

The gap between the narrative and the numbers is not a disagreement about the future. It is a disagreement about the present. The narrative says AI is transforming software development. The numbers say AI is producing faster code that breaks more often, reviewed by developers who believe it's working, shipped to users whose data is sitting in public endpoints. The narrative is Frank in the cockpit, smiling at passengers. The numbers are the kid bleeding in the hospital.

## The question nobody is asking

Here is what the vibe coding movement has not addressed, and what the studies make unavoidable:

If AI tools make developers feel more productive while making them measurably less productive - and if this perceptual inversion gets worse, not better, with increasing AI literacy - then the tool has not failed. It has succeeded at something other than what it advertises. It has succeeded at producing confidence. And confidence, in a system that relies on judgment to catch errors, is not a feature. It is the bug.

The 55% security pass rate has not moved in three years. The models have improved dramatically on every other axis - syntax, fluency, reasoning benchmarks, code completion rates. The one thing that has not improved is the thing that matters when the wall bears weight. The code is more correct by every surface measure and exactly as dangerous by the only measure that counts.

This is not a problem that better models will fix. Better models will produce code that looks even more like code, compiles even more reliably, and passes even more surface checks - while the developer's ability to assess what's underneath continues to atrophy. The uniform gets more convincing. The pilot still can't fly. And with each improvement to the uniform, the pilot becomes more certain that flying is what they're doing.

The Talmud teaches that a judge who rules based on what he sees, without investigating what he cannot see, is not a judge - he is a witness who has exceeded his jurisdiction. The developer who ships AI-generated code without understanding its security posture has exceeded the jurisdiction of their own competence. They are not building software. They are performing the construction of software. And the gap between performing construction and constructing - the gap that the METR study measured at 39 percentage points - is the gap where the users live.

Apple looked into that gap and said no. The rest of the industry is still wearing the uniform.
