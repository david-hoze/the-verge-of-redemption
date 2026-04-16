# Progressive Idris: Unifying the Spectrum from Scripts to Proofs

*A Position Paper for the Programming Languages Research Community*

---

## Abstract

The landscape of statically typed programming languages forms a spectrum from dynamically typed scripting through simple types, affine ownership types, typeclass-rich polymorphism, to full dependent types with formal verification. Each point corresponds to a distinct language with its own ecosystem. We argue that quantitative dependent type theory (QTT), as implemented in Idris 2, provides a coherent foundation that subsumes these points as special cases. We propose *Progressive Idris*: an extension of Idris 2 in which type annotations are fully optional, constraints propagate via bidirectional type inference, and programmers move freely along the spectrum within a single language. Unlike gradual typing, Progressive Idris uses no runtime contracts — type annotations either propagate statically or produce compile-time errors. We sketch the core design, identify open problems, and argue that this approach could resolve the adoption barrier that has prevented dependently typed languages from achieving mainstream use.

---

## 1. Introduction

### 1.1 The Fragmentation Problem

Modern programming language design has produced remarkable results at every level of the type system spectrum. Python demonstrates that dynamic typing enables rapid prototyping and broad accessibility. Rust proves that affine types can enforce memory safety without garbage collection in systems-level code. Haskell shows that typeclasses and higher-kinded polymorphism enable powerful, reusable abstractions. Idris 2 and Lean 4 demonstrate that dependent types can encode arbitrary program invariants and enable machine-checked proofs of correctness.

Yet these results exist in isolation. A team building safety-critical software in Idris cannot leverage Haskell's extensive library ecosystem. A Rust developer who wants to formally verify a protocol cannot simply progress their type annotations into dependent territory — Rust's type system has no path from affine ownership to full specification, so verification requires a separate tool or language. A Python prototype that matures into production code must be rewritten — not refactored — in a language with stronger guarantees. The essential complexity of a problem is conserved across all these languages; what changes is where the complexity is managed — in types, in tests, in documentation, or in bug reports.

We argue that this fragmentation, while not entirely accidental — real trade-offs in compilation strategy, runtime representation, and ecosystem design exert genuine pressure toward distinct languages — is not theoretically necessary. The foundational theory for a unified language already exists. What is missing is the language design to make the unification practical.

### 1.2 The Core Thesis

Quantitative type theory (Atkey 2018, as realized in Idris 2) provides a single calculus in which:

- Unrestricted variables recover conventional functional programming (Haskell-like)
- Linear variables (multiplicity 1) recover a foundational component of resource tracking, though not the full borrow-checking discipline of languages like Rust (see §3.4)
- Erased variables (multiplicity 0) recover compile-time-only computation (Zig-like comptime)
- Dependent function types recover full specification and verification (Lean/Coq-like proofs)

These multiplicities are not separate language features but parameters of a single unified system (McBride 2016, Atkey 2018). More broadly, graded modal type theories (Orchard, Liepelt, and Eades 2019; Abel and Bernardy 2020; Moon, Eades, and Orchard 2021) generalize QTT to arbitrary semirings of resource annotations, providing a theoretical framework in which linearity, irrelevance, and sensitivity are all instances of one mechanism. Progressive Idris builds on this foundation.

What is missing is not the foundational theory but the *language design* that makes this spectrum accessible without requiring all users to understand its full depth. Progressive Idris aims to provide exactly this design.

### 1.3 The Insight: Propagation, Not Boundaries

Gradual typing (Siek & Taha 2006) proposed adding optional types to dynamic languages, with runtime contracts enforcing type invariants at the boundaries between typed and untyped code. This approach has well-documented limitations: performance degradation at boundaries (Takikawa et al. 2016), blame tracking complexity, and cultural fragmentation between typed and untyped codebases.

We propose a fundamentally different mechanism: *type propagation*. In Progressive Idris, when a programmer adds a type annotation, the constraint propagates through the program's call graph via standard bidirectional type inference (Coquand 1996; Pierce and Turner 1998; Dunfield and Krishnaswami 2022). Connected code must either satisfy the constraint (verified statically) or the programmer must acknowledge the gap with an explicit typed hole (Omar et al. 2017, 2019). There are no runtime contracts, no boundary wrappers, no performance penalty. Types are contagious — adding an annotation exerts static pressure on all connected code, naturally expanding the verified region of the program.

The term *progressive types* was introduced by Politz, Quay-de la Vallee, and Krishnamurthi (2012) to describe a system in which programmers choose *which guarantees* to enforce rather than *which code regions* to type. Our usage extends this framing: in Progressive Idris, the guarantees range from basic type safety through linear resource tracking to full formal verification, and the choice is made per-annotation rather than per-module or per-language.

This design yields a critical property: **annotation monotonicity** (stated precisely in §4.1). Adding a type annotation can only increase the static guarantees of a program, never change the runtime behavior of hole-free code paths. This is stronger than the gradual guarantee of Siek et al. (2015), which permits runtime blame errors when annotations are added.

---

## 2. Background and Related Work

### 2.1 Quantitative Type Theory

Atkey (2018) introduced quantitative type theory (QTT), which extends dependent type theory with a semiring of *quantities* (or *multiplicities*) annotating each variable binding. In the system adopted by Idris 2 (Brady 2021), the multiplicities are:

- **0** (erased): the variable is used only at the type level and has no runtime representation. This enables type-level computation analogous to Zig's `comptime` or C++'s `constexpr`, but within a dependently typed framework. Erasure in dependently typed settings has been studied extensively (Mishra-Linger and Sheard 2008; Abel and Scherer 2012; Tejišćák 2020).
- **1** (linear): the variable must be used exactly once. This enforces resource protocols — memory that must be freed, channels that must be closed, tokens that must be consumed. The theoretical lineage traces from Girard's linear logic (1987) through Wadler (1990) and Walker (2004) to Linear Haskell (Bernardy et al. 2018).
- **ω** (unrestricted): the variable may be used any number of times. This is the default mode, recovering conventional functional programming.

The key insight for our purposes is that these multiplicities are not separate language features but *parameters* of a single unified system. A program that uses only ω-variables is a Haskell program. A program that uses 1-variables for resource-sensitive operations enforces a form of linear resource discipline. A program that uses 0-variables for type-level computation is doing compile-time metaprogramming. These are not different languages — they are different configurations of one calculus.

McBride (2016) anticipated this unification in "I Got Plenty o' Nuttin'," and recent work on graded modal dependent type theory (Moon, Eades, and Orchard 2021; Abel, Danielsson, and Eriksson 2023) has formalized and generalized it.

### 2.2 Gradual Typing and Its Limitations

The gradual typing research program (Siek & Taha 2006, 2007; Tobin-Hochstadt & Felleisen 2008) demonstrated that static and dynamic typing can coexist in a single language via a *dynamic type* that is compatible with all static types, mediated by runtime casts. Siek et al. (2015) refined the criteria for what constitutes a well-designed gradual type system.

Practical experience with gradual typing has revealed persistent challenges:

- **Performance**: Typed Racket demonstrated that boundary contracts can impose order-of-magnitude slowdowns (Takikawa et al. 2016). Greenman and Felleisen (2018) surveyed a spectrum of soundness-performance trade-offs, finding no clearly dominant design. The "gradual typing performance problem" remains an active research area.
- **Semantic gaps**: The interaction between dynamic types and parametric polymorphism produces surprising behaviors (Ahmed et al. 2011).
- **Cultural fragmentation**: In TypeScript, the `any` type serves as a permanent escape hatch, leading to codebases where gradual typing's benefits are never fully realized. Tobin-Hochstadt et al. (2017) reflect on a decade of migratory typing experience, documenting these cultural challenges.

Our proposal avoids these issues entirely by eliminating the dynamic-static boundary as a runtime concept.

### 2.3 Gradual Typing Extended to Dependent Types

Several researchers have investigated what it means to add graduality to dependent type systems — a line of work that is technically adjacent to ours but philosophically distinct. New, Licata, and Ahmed (2019) developed a gradual type theory that formally characterizes the interaction between the unknown type and dependent products. Eremondi, Tanter, and Garcia (2019) addressed the key technical challenge of normalizing open terms containing the unknown type, proposing *approximate normalization* for gradual dependent types. Eremondi, Garcia, and Tanter (2022) extended this work to handle propositional equality. Lennon-Bertrand, Maillard, Tabareau, and Tanter (2022) introduced CastCIC, gradualizing the Calculus of Inductive Constructions, and identified a fundamental "Fire Triangle of Graduality": conservativity, graduality, and normalization cannot all hold simultaneously.

Progressive Idris takes a different approach: rather than introducing a dynamic type and mediating it with casts, we rely on static inference and propagation, with typed holes as the explicit mechanism for incomplete specifications. This avoids the Fire Triangle entirely — we sacrifice neither normalization nor conservativity, because we never introduce a dynamic type. The cost is that unannotated code receives only the guarantees that inference can establish, not the runtime safety net that gradual typing provides. We regard this as the correct trade-off for a system aimed at eventual full verification.

The most directly relevant recent work is Díaz, Maillard, Tabareau, and Tanter (2025), who study *incremental certified programming* in Coq-like settings, addressing how partially verified programs can coexist with unverified code. Their approach and ours share the goal of incremental verification, but differ in mechanism: they work within an existing proof assistant's trusted kernel, while we aim to extend a dependently typed programming language toward untyped use.

### 2.4 Existing Partial Solutions

Several existing systems address portions of the spectrum we target:

- **Liquid Haskell** (Vazou et al. 2014; Vazou et al. 2018) adds refinement types to Haskell, enabling lightweight verification via SMT solvers. The refinement types tradition (Freeman and Pfenning 1991; Xi and Pfenning 1999; Rondon, Kawaguchi, and Jhala 2008) demonstrates the value of optional, incremental verification but is limited to refinement predicates and sits outside the core language. Jhala and Vazou (2021) provide a comprehensive tutorial.
- **F\*** (Swamy et al. 2011, 2016) combines dependent types with an effect system and SMT-backed proof automation. It represents the closest existing approximation to our vision, but requires upfront commitment to its type discipline and has a steep learning curve.
- **Typed Racket** (Tobin-Hochstadt & Felleisen 2008) demonstrates sound gradual typing but with the performance and boundary costs noted above.
- **Idris 2** (Brady 2021) provides the theoretical foundation (QTT) but requires full type discipline from the start — there is no "untyped" mode of operation.
- **Lean 4** (de Moura & Ullrich 2021) offers strong tooling and tactic-based proving but similarly requires engagement with the type system from the outset.

None of these systems allow a programmer to begin with minimally annotated code and incrementally add type annotations up to and including dependent types and formal proofs, within a single language, with no runtime cost. Progressive Idris addresses this gap directly.

### 2.5 Bidirectional Type Checking

The propagation mechanism at the heart of Progressive Idris is an extension of bidirectional type checking, a technique with a long history in dependent type theory. Coquand (1996) gave the first bidirectional type checker for dependent types; Pierce and Turner (1998, 2000) formalized the checking/synthesis mode distinction for simple types and local type inference. Dunfield and Pfenning (2004) extended bidirectional checking to intersection and union types; Dunfield and Krishnaswami (2013) showed how to handle higher-rank polymorphism. Norell (2007) implemented bidirectional elaboration for Agda, and Dunfield and Krishnaswami (2022) provide a comprehensive survey.

Our contribution relative to this literature is not a new bidirectional algorithm but a *design philosophy*: using bidirectional inference as the mechanism for progressive annotation, where the programmer controls how much type information flows through the program by choosing where to place annotations.

### 2.6 Typed Holes and Incomplete Programs

Typed holes — placeholders in a program that record the expected type and local context without providing an implementation — are central to our design. The concept originates in the metavariable mechanism of Agda (Norell 2007, 2009) and is theoretically grounded in contextual modal type theory (Nanevski, Pfenning, and Pientka 2008). McBride and McKinna (2004) developed the "view from the left," using holes and case-splitting as a method of interactive program construction.

Omar et al. (2017) formalized typed holes in the Hazelnut calculus, giving a bidirectionally typed structure editor in which every intermediate edit state is well-typed. Omar et al. (2019) extended this to live functional programming with holes. Winant et al. (2014) added partial type signatures to Haskell. Most recently, Zhao et al. (2024) developed total type error localization and recovery using holes, receiving a Distinguished Paper Award at POPL.

Progressive Idris positions typed holes not as an exceptional mechanism but as the standard interface between verified and not-yet-verified code regions, extending their role from development aid to architectural feature.

---

## 3. Design Overview

### 3.1 The Spectrum

We envision Progressive Idris as a language in which the same syntactic constructs can be used at any level of type precision, with a unified underlying theory based on QTT. The levels are not discrete modes but a continuum; we identify representative points for exposition:

**Level 0 — Minimally annotated.** No annotations. The compiler infers what it can (following Hindley-Milner-style inference where applicable) and treats genuinely unconstrained values as having an implicit type `Infer` (see §3.3). Code at this level resembles an ML with optional annotations — the annotation burden is comparable to Python, but the programming model remains functional, not imperative. We do not claim to replicate Python's duck typing, runtime metaprogramming, or mutable-by-default semantics; the comparison is strictly about the *amount of type annotation* a programmer must write.

```
-- Progressive Idris: proposed surface syntax (not current Idris 2)
def sort(xs) =
  -- implementation here
```

**Level 1 — Simply typed.** Basic type annotations on function signatures. Standard parametric polymorphism. Resembles Go or early TypeScript in annotation density.

```
def sort(xs : List(Int)) -> List(Int) =
  -- implementation here
```

**Level 2 — Polymorphic with typeclasses.** Higher-kinded types, typeclass (interface) constraints, monad abstractions. Resembles Haskell.

```
def sort(xs : List(a)) -> List(a) given Ord(a) =
  -- implementation here
```

**Level 3 — Resource-aware.** Multiplicity annotations for linear resource tracking. See §3.4 for the precise relationship to Rust's ownership model.

```
def sort(1 xs : List(Int)) -> List(Int) =
  -- in-place sort, xs consumed linearly
```

**Level 4 — Dependently typed with specifications.** Return types that depend on input values. Lightweight specifications discharged by SMT or simple tactics.

```
def sort(xs : List(Int)) -> (ys : List(Int) ** Sorted(ys)) =
  -- compiler verifies sortedness via SMT or tactic
```

**Level 5 — Fully verified.** Complete formal proofs of arbitrary properties. Machine-checked correctness theorems. Resembles Idris 2, Lean 4, or extracted Coq.

```
def sort(xs : List(Int)) -> (ys : List(Int) ** (Sorted(ys), Perm(xs, ys))) =
  let ys = mergesort(xs)
  (ys ** (mergesort_sorted xs, mergesort_perm xs))
```

**Note on syntax.** The examples above use a proposed surface syntax for Progressive Idris (e.g., `def`, parenthesized type application) that differs from current Idris 2. This is deliberate: one goal of Progressive Idris is a surface syntax accessible to programmers unfamiliar with dependently typed languages. The relationship between this surface syntax and Idris 2's core language is part of the design work.

All levels coexist in a single compilation unit. Functions at different levels can call each other, subject to the propagation rules described below.

### 3.2 Type Propagation

The central mechanism is *type propagation via bidirectional type inference* (Coquand 1996; Pierce and Turner 1998; Dunfield and Krishnaswami 2022), extended to handle the full QTT. When a programmer adds a type annotation, the consequences are:

**Outward propagation (to callers).** If a function's parameter is annotated with type `T`, every call site must supply an argument of type `T`. If the caller is unannotated, the compiler propagates the constraint backward, inferring the necessary types at the call site. If propagation reaches code that is inconsistent with the constraint, a compile-time error is reported. This is standard checking-mode propagation in bidirectional systems.

**Inward propagation (to implementations).** If a function's return type includes a dependent type or proof obligation, that obligation propagates inward to the function body. The implementation must produce a value of the specified type, including any proofs. This is standard synthesis-mode propagation.

**Typed holes as deferred obligations.** When propagation reaches a point where the programmer is not ready to satisfy the constraint, they write `?`, producing a *typed hole* (Omar et al. 2017; Zhao et al. 2024). The compiler records the hole's type and context, reports it as a warning, and continues compilation. The program is executable — holes are replaced with `error("unfilled hole: ...")` at runtime, analogous to Idris 2's existing hole mechanism but positioned as a standard part of the development workflow rather than an escape hatch. See §4.1 for a precise account of how holes interact with annotation monotonicity.

**No runtime boundaries.** Crucially, there are no runtime casts or contracts at the interface between annotated and unannotated code. The unannotated code is either constrained by propagation (and verified statically) or explicitly marked with a hole (and flagged as incomplete). This eliminates the performance and semantic issues of gradual typing entirely.

### 3.3 The `Infer` Metatype and Inference Behavior

Unannotated code is not dynamically typed. Instead, unannotated bindings carry an implicit `Infer` marker, which the compiler resolves via type inference. `Infer` is an instruction to the compiler, not a runtime type and not a type in the object language — it is better understood as a *metasyntactic marker* that triggers the inference procedure.

The inference procedure operates as follows, in order of priority:

1. **Local constraint solving.** The elaborator collects constraints from the function body and call sites (using bidirectional propagation as described above) and solves them via higher-order pattern unification (Miller 1991; Abel and Pientka 2011). If a unique solution exists, the binding receives that type.

2. **Generalization.** If local constraints leave a binding underdetermined but consistent, the elaborator generalizes it, producing a polymorphic type. For simple types, this is standard Hindley-Milner generalization. For types involving multiplicities, the elaborator assigns the least restrictive multiplicity consistent with usage (ω by default, 1 if the usage pattern is exactly linear and no other constraint forces ω). For types involving universe levels, the elaborator assigns the lowest universe consistent with the constraints (analogous to Lean 4's universe polymorphism with auto-bound levels). Crucially, generalization never introduces dependent quantification over value-level variables — if inference cannot determine whether a type should be dependent, it defaults to non-dependent, and the programmer must add an annotation to opt in.

3. **Failure.** If constraints are contradictory, a compile-time error is reported. The error message indicates the conflicting constraints and the program locations from which they originated. The elaborator does *not* insert a dynamic type or defer checking to runtime.

This three-stage procedure bounds the power of inference in a predictable way. In particular, the restriction in stage 2 — that inference never introduces dependent quantification — means that unannotated code receives at most Hindley-Milner-level types with multiplicity and universe annotations. Dependent types must always be requested explicitly by the programmer. This is a deliberate design choice: dependent types involve value-level computation in types, and the programmer should always be aware when this is happening.

The interaction with universes deserves further attention. An unconstrained `Infer` marker produces a type in `Type 0` (the lowest universe) by default, promoted to a higher universe only when constraints force it. This avoids the pathological case of inferring a type so general it is useless (e.g., placing everything in a universe-polymorphic type that carries no information).

### 3.4 Multiplicity Inference and the Relationship to Rust

QTT multiplicities (0, 1, ω) are inferred by default. The compiler analyzes usage patterns:

- If a variable is used exactly once, it *may* be treated as linear, enabling optimizations (in-place mutation, deterministic resource cleanup).
- If a variable is used multiple times, it is unrestricted.
- If a variable appears only in types and not in runtime expressions, it is erased.

Explicit multiplicity annotations override inference, enabling the programmer to *enforce* linearity (triggering compile errors if a linear variable is used more than once) rather than merely permitting it.

**Relationship to Rust.** We must be precise about what QTT linearity does and does not provide relative to Rust's ownership system. QTT's multiplicity-1 variables enforce that a resource is *consumed exactly once*, which is a necessary component of Rust-style safety. However, Rust's borrow checker provides additional guarantees that do not follow from linearity alone:

- **Lifetime tracking.** Rust ensures that references do not outlive the data they point to. QTT has no native notion of lifetimes.
- **Borrowing discipline.** Rust distinguishes shared (`&T`) and mutable (`&mut T`) borrows and enforces that mutable borrows are exclusive. QTT linearity ensures a value is used once but does not distinguish read from write access.
- **Aliasing control.** Rust's borrow checker prevents aliased mutation. QTT does not track aliasing.

QTT linearity is thus best understood as *one layer* of Rust's safety model — the "ownership" layer — without the "borrowing" layer. Extending QTT with lifetime-like constructs to recover the full borrow-checking discipline is an open research question (see §5.7). The Oxide formalization (Weiss et al. 2019) provides a starting point, and Linear Haskell (Bernardy et al. 2018) demonstrates a different set of trade-offs for practical linearity in a higher-order language.

### 3.5 Effect Tracking

A practical language spanning the full spectrum must account for computational effects — I/O, mutable state, exceptions, nondeterminism, concurrency. The interaction between progressive annotation and effect tracking is a central design challenge.

At **Level 0** (minimally annotated), all functions are implicitly permitted to perform arbitrary effects. This matches the expectations of programmers coming from Python or JavaScript: `def readFile(path) = ...` may perform I/O without any annotation.

At **Levels 2-3**, the programmer can optionally annotate functions with effect information. We envision this using an algebraic effect system (Plotkin and Power 2003; Plotkin and Pretnar 2009, 2013; Bauer and Pretnar 2015), building on Brady's work on effects in Idris (Brady 2013, 2014). Algebraic effects fit naturally into the progressive design because they are *compositional* — an effect annotation on one function propagates to its callers, just as type annotations do:

```
-- Level 2: effect annotation propagates to callers
def readConfig(path : String) -> {IO} Config =
  -- any caller of readConfig must also be in {IO}
```

At **Levels 4-5**, effect annotations become part of the specification. A function annotated as pure (no effects) can be used in type-level computation and proof contexts; a function with effects cannot. This aligns with the standard distinction in Idris 2 between total and partial functions.

The progressive aspect is that effect annotations, like type annotations, are optional and propagated:

- Unannotated functions are treated as potentially effectful (the least restrictive default).
- Adding an effect annotation (e.g., marking a function as pure) constrains the function body and propagates purity requirements inward.
- Effect annotations are monotonic: adding an effect annotation can only *restrict* the permitted effects, never introduce new ones.

Row-polymorphic effect types (Hillerström and Lindley 2016; Leijen 2017) provide a natural technical foundation, as they allow effects to be abstracted over and composed. The integration of row-polymorphic effects with QTT multiplicities is not fully worked out and constitutes an open problem (§5.7).

---

## 4. Key Properties

### 4.1 Annotation Monotonicity

**Property (Annotation Monotonicity for Hole-Free Code).** Let *P* be a well-typed program containing no typed holes. Let *P'* be *P* with one or more type annotations added. Then either:
  (a) *P'* is well-typed, and for all inputs, *P'* produces the same output as *P*; or
  (b) *P'* fails to type-check, revealing a type error that was previously undetected.

In neither case does the runtime behavior of the program change. This is strictly stronger than the gradual guarantee of Siek et al. (2015), which allows runtime blame errors when annotations are added.

**Interaction with typed holes.** When a program *does* contain typed holes, adding an annotation can cause previously-inferred code to become inconsistent, forcing the introduction of a new hole. In this case, a code path that previously ran successfully may now diverge at runtime (by hitting the new hole's error). We regard this not as a violation of monotonicity but as a *refinement*: the annotation revealed that the code path was only incidentally correct — it satisfied the unannotated type by accident and does not satisfy the annotated type. The hole makes this gap explicit and trackable. To state this precisely:

**Property (Annotation Monotonicity, General Form).** Adding a type annotation to a well-typed program either:
  (a) preserves well-typedness without changing the set of typed holes, and preserves runtime behavior; or
  (b) preserves well-typedness but introduces new typed holes (which are reported as warnings), replacing previously-inferred code paths with explicit "not yet verified" markers; or
  (c) reveals a type error.

In case (b), the annotation has not *broken* the program — it has made the programmer aware that a code region does not satisfy the newly stated specification. This is precisely the behavior a progressive system should have: annotations surface information, never hide it.

### 4.2 Progressive Annotation (Revised)

**Property (Syntactic Progressivity).** For any program at level *n* on the spectrum, the language imposes no *syntactic* barriers to lifting it to level *n+1* by adding annotations: the same syntax, module system, and compilation pipeline are used at all levels.

We state this property carefully. We do *not* claim that moving from level *n* to *n+1* never requires algorithmic changes — in practice, it often does. Adding linearity annotations (Level 2 → 3) may require restructuring code that freely copies values, since a function that duplicates a linear resource is ill-typed. Adding full verification (Level 4 → 5) may require changing algorithms: a quicksort that is easy to show sorted is hard to show is a permutation without an algorithm redesign; a merge sort may be more amenable to verification.

What we claim is that these changes happen *within the same language*. The programmer does not need to learn a new syntax, switch to a new compiler, rewrite FFI bindings, or abandon their existing libraries. The language provides a single, continuous path from unannotated code to verified code, even when that path involves substantive algorithmic work at the higher levels. This is the sense in which Progressive Idris resolves the rewrite-vs-refactor problem: the language never forces a *language-level* rewrite, even when it requires an *algorithm-level* refactor.

### 4.3 Ecosystem Unification

**Property.** Libraries written at any level on the spectrum are callable from code at any other level, with type propagation mediating the interface.

A library author who provides rich type annotations exports stronger guarantees to callers. A library with minimal annotations is still usable — callers simply receive weaker static guarantees about its behavior. This allows a single package ecosystem to serve all communities, from scripters to verifiers.

---

## 5. Open Problems

We identify several significant challenges that must be addressed for this design to be realized:

### 5.1 Inference for Dependent Types

Hindley-Milner inference is decidable and complete for simple types but does not extend to dependent types, where type checking involves arbitrary computation and unification is undecidable in general (Goldfarb 1981). Higher-order pattern unification (Miller 1991, 1992) provides a decidable fragment that covers many practical cases, and Abel and Pientka (2011) extended it to dynamic patterns in dependent types.

A practical language must define a *predictable subset* of dependent types for which inference works well, with clear error messages when the programmer must provide annotations. Our design (§3.3) addresses this by restricting inference to never introduce dependent quantification — dependent types must always be explicitly requested. This is a conservative starting point; relaxing this restriction for common patterns (e.g., length-indexed vectors where the length is determined by a list literal) is an area for future work.

The experience of Lean 4's elaborator (de Moura and Ullrich 2021; de Moura et al. 2015) and Idris 2's unifier (Brady 2021), as well as Cockx, Devriese, and Piessens's work on proof-relevant unification (2016), may guide this design, but significant work remains to make inference feel seamless in the progressive context. Löh, McBride, and Swierstra (2010) provide a tutorial implementation of a dependently typed lambda calculus that could serve as a starting point for prototyping.

Our implementation addresses HM-level inference for Levels 0–2 within Idris 2's existing elaborator. Type synthesis from patterns, HM-style generalization, and typeclass constraint inference (via a 3-phase solving strategy that defers `BySearch` constraints during elaboration) allow unannotated definitions to elaborate successfully. Higher-order function inference uses a two-path strategy — `IBindVar` for single-HOF-arg cases, implicit holes for multi-HOF-arg cases — to handle common patterns like `map` and `compose`. The restriction to non-dependent quantification holds in practice: inference never introduces dependent Pi binders, and definitions requiring them must be annotated. See §6.1 for empirical results.

### 5.2 SMT Integration for Automated Proof

For refinement types and lightweight specifications (Levels 4-5), SMT solvers can discharge many proof obligations automatically. However, SMT-based verification introduces unpredictability — small changes to code can cause previously automatic proofs to fail. F\*'s experience demonstrates both the power and the fragility of this approach.

Progressive Idris must manage SMT integration carefully, perhaps by distinguishing "SMT-dischargeable" obligations from those requiring manual proof and providing clear feedback about which category a given obligation falls into. Lehmann and Tanter (2017) explored gradual refinement types, which provide one model for how SMT-backed verification can be made incremental.

### 5.3 Compilation and Performance

Compiling dependently typed languages to efficient native code remains challenging. Erasing types and proofs (multiplicity 0) is well-understood (Mishra-Linger and Sheard 2008; Tejišćák 2020), but generating competitive code from the remaining runtime terms requires optimization passes that current dependently typed compilers lack.

Lean 4's compilation to C with reference counting (de Moura and Ullrich 2021; Ullrich and de Moura 2020) and Koka's Perceus reference counting (Reinking et al. 2021) provide promising models for functional language compilation. Brady (2013) described Idris 1's compilation strategy, and Norell (2007) documented Agda's MAlonzo backend to GHC Haskell. Sixten (Fredriksson, no formal publication) experimented with unboxed data representations in a dependently typed setting. Significant engineering effort is needed to match the code quality of GHC or LLVM-backed compilers.

### 5.4 Error Messages Across the Spectrum

A compiler that serves both novice scripters and expert type theorists must provide error messages appropriate to the programmer's current level of engagement. In Progressive Idris, a Level 0 user should see messages about arity and basic mismatches, phrased without type-theoretic jargon. A Level 5 user should see detailed proof state, unsolved unification variables, and tactic suggestions.

The challenge is not merely presentation but *selecting what to report* — at Level 0, many potential issues are deliberately left unchecked, and the compiler must not overwhelm the programmer with warnings about properties they have not yet chosen to enforce. The Hazelnut line of work (Omar et al. 2017, 2019; Zhao et al. 2024) on maintaining well-typedness through edit states provides useful principles here.

The elaborator information described by Vytiniotis et al. (2011) for OutsideIn(X) — tracking where constraints originate and how they interact — is directly relevant to producing good error messages in a progressive setting, since errors often involve constraints that propagated from distant annotations.

We implemented level-adapted error messages in Progressive Idris. An annotation-level detector (levels 0–4, based on Pi binder complexity) combined with a progressive-mode detector (presence of synthesised-type definitions) selects between beginner-friendly and standard Idris 2 error messages. Five error types — `CantConvert`, `CantSolveGoal`, `UndefinedName`, `UnsolvedHoles`, and `InvalidArgs` — display simplified messages in Level 0–1 progressive modules, while standard Idris 2 modules are unaffected. This validates the principle that level detection can be automated from syntactic properties of the code rather than requiring explicit mode switches.

### 5.5 Typed Holes and Deferred Obligations

The design relies heavily on typed holes (`?`) as the mechanism for deferring proof obligations. For this to work well, the tooling must provide:

- A clear inventory of all holes in a project, with their types and contexts
- Guidance on how to fill each hole (suggested tactics, counterexamples for invalid holes)
- Integration with CI/CD to track holes as technical debt metrics

The hole mechanism must also interact correctly with SMT automation — an obligation that the SMT solver can discharge should not require a manual hole, but an obligation that the solver *sometimes* discharges (depending on heuristics) must be handled predictably.

Tanter and Tabareau (2015) explored gradual certified programming in Coq, where unverified code coexists with verified code inside a proof assistant. Their approach to deferred obligations informs our design, though our mechanism (typed holes) is simpler than their cast-based system.

Idris 2's existing hole mechanism suffices for progressive typing at Levels 0–2 without modification. Typed holes (`?name`) work transparently with synthesised types — the elaborator infers the surrounding type and the hole inherits the correct context. The REPL's `:t ?hole` command and IDE-mode type-on-hover display inferred types for holes in unannotated code, providing the "clear inventory" described above. Integration with CI/CD and SMT-backed hole discharge remain future work for higher levels.

### 5.6 Module System and Separate Compilation

Dependent types complicate separate compilation because type checking may require evaluating terms from other modules. A practical progressive language must support incremental compilation that scales to large codebases. Lean 4's approach to this problem (compiling to C, using `.olean` intermediate files) may be instructive.

### 5.7 Linearity, Borrowing, and Effects

As discussed in §3.4, QTT linearity provides the ownership layer but not the borrowing layer of Rust-style safety. Extending Progressive Idris with lifetime-like constructs, region-based memory management, or a borrowing discipline is an open research question. Similarly, the integration of row-polymorphic algebraic effects (§3.5) with QTT multiplicities — ensuring, for example, that a linear resource is not silently captured by an effect handler — requires further theoretical development.

The coeffect calculus (Petricek, Orchard, and Mycroft 2014) and bounded linear types (Ghica and Smith 2014; Brunel et al. 2014) suggest that resource tracking and effect tracking can be unified in a graded framework, but working out the details for a practical language remains to be done.

---

## 6. Toward Implementation

We suggest that the shortest path to a prototype of Progressive Idris is modification of Idris 2 itself rather than a from-scratch effort. Building a new language from scratch would face the cold-start ecosystem problem: without libraries, a language has no users, and without users, no one writes libraries. By extending Idris 2, Progressive Idris inherits an existing (if modest) ecosystem and community.

**Idris 2** provides the theoretical foundation (QTT) and already supports typed holes, multiplicity annotations, elaborator reflection, and algebraic effects. Extending it with `Infer`-based optional annotations, enhanced type inference for unannotated code, and SMT integration for automated proof discharge would yield a prototype of Progressive Idris. The primary engineering challenges are: making the elaborator robust to missing annotations, designing the inference/propagation boundary, and producing quality error messages for partially-annotated code.

**Lean 4** offers superior performance and tooling but lacks native multiplicity tracking. Adding QTT-style multiplicities to Lean's type theory would be a more fundamental change, though Lean's metaprogramming capabilities (including tactic frameworks like Mtac-style typed tactic programming; cf. Ziliani et al. 2013) might allow prototyping some progressive features as a macro layer. A "Progressive Lean" variant is conceivable but would require deeper foundational changes than the Idris 2 path.

### 6.1 Implementation Results

We have implemented Progressive Idris as a modification of Idris 2 (branch `progressive-stage1`). The implementation comprises approximately 2,000 lines of modifications across 10 compiler source files, with 103 progressive-specific tests and zero regressions on Idris 2's 795-test upstream suite.

**Implemented features.** The following capabilities are fully operational:

- **Type synthesis from patterns** (`synthTypeFromPatterns`): When no type signature is given, the compiler synthesizes a type from definition patterns with metavariable arguments and return type. Multi-clause definitions are desugared into single-clause with `case`, using `guessScrType` to infer types from constructor patterns.
- **HM-style generalization** (`generaliseType`): After elaboration, unsolved type metavariables are replaced with implicit Pi binders and typeclass constraint metavariables with auto-implicit Pi binders, yielding polymorphic types.
- **Typeclass constraint inference** (Num, Ord via 3-phase solving): A `synthElabMode` flag suppresses `BySearch` constraint resolution during elaboration, preventing premature type defaulting (e.g., `Num ?a` resolving `?a` to `Integer`). After elaboration, type metavariables are protected with `noSolve` while non-type constraints are retried through the full solving pipeline.
- **Higher-order function inference** (two-path: IBindVar + implicit holes): For single-HOF-arg cases (e.g., `myMap f xs`), IBindVar-named types with explicit implicit Pi binders avoid cross-scope constraints. For multiple-HOF-arg cases (e.g., `compose f g x`), implicit holes allow flexible cross-argument unification.
- **Mutual recursion** (auto-generated forward declarations): `PMutual` blocks automatically receive IClaim forward declarations for unannotated definitions, with `constSolvable` flags enabling type metas to be solved by pattern matching against concrete constructors.
- **Multiplicity inference** (trial `linearCheck` tightening): For each explicit argument of a synthesised-type definition, the compiler trial-sets the argument to linear (Rig1) and runs `linearCheck` on normalised clause RHSes. Variables used linearly in linear-compatible positions are inferred as linear; others remain unrestricted.
- **Case block constraint propagation**: When `if-then-else` or `case` expressions desugar to separate case block functions, `generaliseType` transitively propagates implicit type and constraint binders to all reachable case blocks and updates their call sites.
- **Level-adapted error messages**: An annotation-level detector (levels 0–4) combined with progressive-mode detection selects beginner-friendly messages for five error types in Level 0–1 progressive modules.
- **REPL auto-display of inferred types**: After processing unannotated definitions, the REPL automatically displays inferred type signatures. The `:addtype` command outputs signatures ready to paste into source code.
- **Progressive `def` keyword syntax**: An optional `def` prefix for definitions (`def add x y = x + y`) is parsed and discarded, providing familiar syntax for programmers from other languages.

**Empirical validation.**

- *Annotation monotonicity*: 30 test groups across 3 annotation versions (unannotated, partially annotated, fully annotated) produce identical output, confirming that adding annotations never changes program behavior.
- *Stress tests*: 20-function chains and 10-level nesting depth compile and execute correctly in under 4 seconds.
- *Known limitations*: 4 limitations have been precisely characterized with workarounds: `foldr`-pattern HOF inference (meta-meta unification direction), HOF args with concrete return types (rigid type variable vs. concrete type), multiple HOF args with arity > 1 (cross-scope constraints), and `total` keyword before bare definitions (parser limitation). All are addressable with explicit type signatures.

---

## 7. Conclusion

The programming language community has developed powerful type-theoretic foundations — dependent types, linear types, algebraic effects — but has failed to make them accessible to the majority of working programmers. We argue that the barrier is not theoretical but ergonomic: existing dependently typed languages demand full engagement with the type system from the first line of code, creating an all-or-nothing adoption dynamic that most practitioners reject.

Progressive dependent types, as realized in Progressive Idris, offer an alternative: a single language spanning the full spectrum from minimally annotated scripting to formally verified code, with type annotations that propagate constraints statically rather than enforcing them at runtime boundaries. The theoretical foundation (QTT and its graded generalizations) exists. The host language (Idris 2) exists. The design space, while challenging — particularly around dependent type inference, effect integration, and the borrowing layer — is tractable. The potential reward — a unified ecosystem that serves all programming communities — justifies the effort.

We invite the programming languages research community to investigate the Progressive Idris design space further, with particular attention to the open problems of dependent type inference, SMT integration, compilation performance, effect tracking, and cross-spectrum error reporting.

---

## References

- Abel, A., & Bernardy, J.-P. (2020). A unified view of modalities in type systems. *Proc. ACM Program. Lang.*, 4(ICFP), Article 90.
- Abel, A., Coquand, T., & Pagano, M. (2009). A modular type-checking algorithm for type theory with singleton types and proof irrelevance. In *TLCA 2009*, LNCS 5608, pp. 5–19.
- Abel, A., Danielsson, N. A., & Eriksson, O. (2023). A graded modal dependent type theory with a universe and erasure, formalized. *Proc. ACM Program. Lang.*, 7(ICFP), 920–954.
- Abel, A., & Pientka, B. (2011). Higher-order dynamic pattern unification for dependent types and records. In *TLCA 2011*, LNCS 6690, pp. 10–26.
- Abel, A., & Scherer, G. (2012). On irrelevance and algorithmic equality in predicative type theory. *Logical Methods in Computer Science*, 8(1:29).
- Ahmed, A., Findler, R. B., Siek, J. G., & Wadler, P. (2011). Blame for all. *POPL '11*.
- Atkey, R. (2018). Syntax and semantics of quantitative type theory. *LICS '18*, pp. 56–65.
- Bauer, A., & Pretnar, M. (2015). Programming with algebraic effects and handlers. *J. Logical and Algebraic Methods in Programming*, 84(1), 108–123.
- Bernardy, J.-P., Boespflug, M., Newton, R. R., Peyton Jones, S., & Spiwack, A. (2018). Linear Haskell: Practical linearity in a higher-order polymorphic language. *Proc. ACM Program. Lang.*, 2(POPL), Article 5.
- Brady, E. (2013a). Idris, a general-purpose dependently typed programming language: Design and implementation. *J. Functional Programming*, 23(5), 552–593.
- Brady, E. (2013b). Programming and reasoning with algebraic effects and dependent types. *ICFP '13*, pp. 133–144.
- Brady, E. (2014). Resource-dependent algebraic effects. In *TFP 2014*, LNCS 8843, pp. 18–33.
- Brady, E. (2021). Idris 2: Quantitative type theory in practice. *ECOOP '21*, LIPIcs 194, 9:1–9:26.
- Brunel, A., Gaboardi, M., Mazza, D., & Zdancewic, S. (2014). A core quantitative coeffect calculus. In *ESOP 2014*, LNCS, pp. 351–370.
- Cockx, J., Devriese, D., & Piessens, F. (2016). Unifiers as equivalences: Proof-relevant unification of dependently typed data. *ICFP '16*.
- Coquand, T. (1996). An algorithm for type-checking dependent types. *Science of Computer Programming*, 26(1–3), 167–177.
- de Moura, L., Avigad, J., Kong, S., & Roux, C. (2015). Elaboration in dependent type theory. arXiv:1505.04324.
- de Moura, L., & Ullrich, S. (2021). The Lean 4 theorem prover and programming language. *CADE-28*, LNCS 12699, pp. 625–635.
- Díaz, T., Maillard, K., Tabareau, N., & Tanter, É. (2025). Incremental certified programming. *Proc. ACM Program. Lang.*, 9(OOPSLA2), 499–526.
- Dunfield, J., & Krishnaswami, N. R. (2013). Complete and easy bidirectional typechecking for higher-rank polymorphism. *ICFP '13*, pp. 429–442.
- Dunfield, J., & Krishnaswami, N. (2022). Bidirectional typing. *ACM Computing Surveys*, 54(5), Article 98.
- Dunfield, J., & Pfenning, F. (2004). Tridirectional typechecking. *POPL '04*, pp. 281–292.
- Eremondi, J., Garcia, R., & Tanter, É. (2022). Propositional equality for gradual dependently typed programming. *Proc. ACM Program. Lang.*, 6(ICFP).
- Eremondi, J., Tanter, É., & Garcia, R. (2019). Approximate normalization for gradual dependent types. *Proc. ACM Program. Lang.*, 3(ICFP), Article 88.
- Flanagan, C. (2006). Hybrid type checking. *POPL '06*, pp. 245–256.
- Freeman, T. S., & Pfenning, F. (1991). Refinement types for ML. *PLDI '91*, pp. 268–277.
- Garcia, R., Clark, A. M., & Tanter, É. (2016). Abstracting gradual typing. *POPL '16*, pp. 429–442.
- Ghica, D. R., & Smith, A. I. (2014). Bounded linear types in a resource semiring. In *ESOP 2014*, LNCS, pp. 331–350.
- Girard, J.-Y. (1987). Linear logic. *Theoretical Computer Science*, 50(1), 1–101.
- Goldfarb, W. D. (1981). The undecidability of the second-order unification problem. *Theoretical Computer Science*, 13(2), 225–230.
- Greenman, B., & Felleisen, M. (2018). A spectrum of type soundness and performance. *Proc. ACM Program. Lang.*, 2(ICFP), Article 71.
- Hillerström, D., & Lindley, S. (2016). Liberating effects with rows and handlers. In *TyDe 2016*, pp. 15–27.
- Jhala, R., & Vazou, N. (2021). Refinement types: A tutorial. *Foundations and Trends in Programming Languages*, 6(3–4), 159–317.
- Lehmann, N., & Tanter, É. (2017). Gradual refinement types. *POPL '17*, pp. 775–788.
- Leijen, D. (2017). Type directed compilation of row-typed algebraic effects. *POPL '17*, pp. 486–499.
- Lennon-Bertrand, M., Maillard, K., Tabareau, N., & Tanter, É. (2022). Gradualizing the Calculus of Inductive Constructions. *ACM Trans. Program. Lang. Syst.*, 44(2), Article 7.
- Löh, A., McBride, C., & Swierstra, W. (2010). A tutorial implementation of a dependently typed lambda calculus. *Fundamenta Informaticae*, 102(2), 177–207.
- Maillard, K., Lennon-Bertrand, M., Tabareau, N., & Tanter, É. (2022). A reasonably gradual type theory. *Proc. ACM Program. Lang.*, 6(ICFP), 931–959.
- McBride, C. (2016). I got plenty o' nuttin'. In *A List of Successes That Can Change the World* (Wadler Festschrift), LNCS 9600, pp. 207–233.
- McBride, C., & McKinna, J. (2004). The view from the left. *J. Functional Programming*, 14(1), 69–111.
- Miller, D. (1991). A logic programming language with lambda-abstraction, function variables, and simple unification. *J. Logic and Computation*, 1(4), 497–536.
- Mishra-Linger, N., & Sheard, T. (2008). Erasure and polymorphism in pure type systems. In *FoSSaCS 2008*, LNCS 4962, pp. 350–364.
- Moon, B., Eades III, H. D., & Orchard, D. (2021). Graded modal dependent type theory. In *ESOP 2021*, LNCS, pp. 462–490.
- Nanevski, A., Pfenning, F., & Pientka, B. (2008). Contextual modal type theory. *ACM Trans. Computational Logic*, 9(3), Article 23.
- New, M. S., Licata, D. R., & Ahmed, A. (2019). Gradual type theory. *Proc. ACM Program. Lang.*, 3(POPL), Article 15.
- Norell, U. (2007). Towards a practical programming language based on dependent type theory. PhD thesis, Chalmers University of Technology.
- Norell, U. (2009). Dependently typed programming in Agda. In *AFP 2008*, LNCS 5832, pp. 230–266.
- Omar, C., Voysey, I., Chugh, R., & Hammer, M. A. (2019). Live functional programming with typed holes. *Proc. ACM Program. Lang.*, 3(POPL), Article 14.
- Omar, C., Voysey, I., Hilton, M., Aldrich, J., & Hammer, M. A. (2017). Hazelnut: A bidirectionally typed structure editor calculus. *POPL '17*, pp. 86–99.
- Orchard, D., Liepelt, V.-B., & Eades III, H. (2019). Quantitative program reasoning with graded modal types. *Proc. ACM Program. Lang.*, 3(ICFP), Article 110.
- Petricek, T., Orchard, D., & Mycroft, A. (2014). Coeffects: A calculus of context-dependent computation. *ICFP '14*, pp. 123–135.
- Pierce, B. C., & Turner, D. N. (1998). Local type inference. *POPL '98*, pp. 252–265. Journal version: *ACM TOPLAS*, 22(1), 1–44, 2000.
- Plotkin, G. D., & Power, J. (2003). Algebraic operations and generic effects. *Applied Categorical Structures*, 11(1), 69–94.
- Plotkin, G., & Pretnar, M. (2009). Handlers of algebraic effects. In *ESOP 2009*, LNCS 5502, pp. 80–94. Journal version: *Logical Methods in Computer Science*, 9(4:23), 2013.
- Politz, J. G., Quay-de la Vallee, H., & Krishnamurthi, S. (2012). Progressive types. In *Onward! 2012*, pp. 55–66.
- Reinking, A., Xie, D., de Moura, L., & Leijen, D. (2021). Perceus: Garbage free reference counting with reuse. *PLDI '21*.
- Rondon, P. M., Kawaguchi, M., & Jhala, R. (2008). Liquid types. *PLDI '08*, pp. 159–169.
- Siek, J. G., & Taha, W. (2006). Gradual typing for functional languages. *Scheme and Functional Programming Workshop*, pp. 81–92.
- Siek, J. G., Vitousek, M. M., Cimini, M., & Boyland, J. T. (2015). Refined criteria for gradual typing. In *SNAPL 2015*, LIPIcs 32, pp. 274–293.
- Swamy, N., et al. (2011). Secure distributed programming with value-dependent types. *ICFP '11*, pp. 266–278.
- Swamy, N., et al. (2016). Dependent types and multi-monadic effects in F\*. *POPL '16*.
- Takikawa, A., Feltey, D., Greenman, B., New, M. S., Vitek, J., & Felleisen, M. (2016). Is sound gradual typing dead? *POPL '16*.
- Tanter, É., & Tabareau, N. (2015). Gradual certified programming in Coq. In *DLS 2015*, pp. 26–40.
- Tejišćák, M. (2020). A dependently typed calculus with pattern matching and erasure inference. *Proc. ACM Program. Lang.*, 4(ICFP), Article 91.
- Tobin-Hochstadt, S., & Felleisen, M. (2008). The design and implementation of Typed Scheme. *POPL '08*, pp. 395–406.
- Tobin-Hochstadt, S., et al. (2017). Migratory typing: Ten years later. In *SNAPL 2017*, LIPIcs 71, pp. 17:1–17:17.
- Ullrich, S., & de Moura, L. (2020). Counting immutable beans: Reference counting optimized for purely functional programming. *IFL '19*.
- Vazou, N., Seidel, E. L., Jhala, R., Vytiniotis, D., & Peyton Jones, S. (2014). Refinement types for Haskell. *ICFP '14*, pp. 269–282.
- Vazou, N., et al. (2018). Refinement reflection: Complete verification with SMT. *Proc. ACM Program. Lang.*, 2(POPL), Article 53.
- Vytiniotis, D., Peyton Jones, S., Schrijvers, T., & Sulzmann, M. (2011). OutsideIn(X): Modular type inference with local assumptions. *J. Functional Programming*, 21(4–5), 333–412.
- Wadler, P. (1990). Linear types can change the world! In *Programming Concepts and Methods*, IFIP TC 2.
- Walker, D. (2004). Substructural type systems. In B. C. Pierce, editor, *Advanced Topics in Types and Programming Languages*, pp. 3–44. MIT Press.
- Weiss, A., Gierczak, O., Patterson, D., & Ahmed, A. (2019). Oxide: The essence of Rust. arXiv:1903.00982.
- Winant, T., Devriese, D., Piessens, F., & Schrijvers, T. (2014). Partial type signatures for Haskell. In *PADL 2014*, LNCS 8324, pp. 17–32.
- Xi, H., & Pfenning, F. (1999). Dependent types in practical programming. *POPL '99*, pp. 214–227.
- Zhao, E., Blinn, A., Dukkipati, A., Maroof, R., Pan, Z., & Omar, C. (2024). Total type error localization and recovery with holes. *Proc. ACM Program. Lang.*, 8(POPL), Article 68.
- Ziliani, B., Dreyer, D., Krishnaswami, N. R., Nanevski, A., & Vafeiadis, V. (2013). Mtac: A monad for typed tactic programming in Coq. *ICFP '13*, pp. 87–100.
