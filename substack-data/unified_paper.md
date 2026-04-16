# Restriction Images and Structural Entropy in Boolean Formulas

---

## Abstract

We introduce the *restriction universe* of Boolean formulas — the set of DAG-isomorphism classes of (d−1)-input formulas that arise by hardwiring a single input of d-input formulas over a fixed basis and propagating constants — and study its size relative to the *restriction image* of individual Boolean functions. Through exhaustive enumeration of formulas over {AND, OR, NOT} at dimensions d = 2, 3, 4, we establish three results.

First, we construct the complete structural taxonomy of all 256 Boolean functions on 3 inputs, classified by formula complexity and *structural fluidity* — the number of distinct restriction DAG classes their formulas produce. We identify a three-tier hierarchy (stiff, moderate, fluid) that recurs at each complexity frontier, with rigid functions appearing from different algebraic families at successive size levels.

Second, we discover a *universe-to-image scaling law*. The structural entropy ratio σ(s, d) — the restriction universe size divided by the maximum restriction image — satisfies σ(4,2) = 2.0, σ(4,3) = 6.3, σ(4,4) = 13.3, and converges to an intrinsic dimensional constant σ∞(d) as s → ∞. The growth is driven by *dilution*: the most prolific function's share of the universe decreases from 49.3% (d = 2) to 7.5% (d = 4). We conjecture σ∞(d) → ∞.

Third, through a case study of x₀x₁ ⊕ x₂x₃, we show that DAG-isomorphism compatibility is strictly more constraining than functional compatibility, with 50% of structural edges incompatible at minimum formula size.

We formalize these results as properties of a *compatibility CSP* on the sub-cube intersection graph and discuss implications for the hardness magnification program.

---

## 1. Introduction

The Minimum Circuit Size Problem (MCSP) — given a truth table of length N = 2^n and a size bound s, decide whether a circuit of size at most s computes this function — is central to the hardness magnification program in complexity theory. Oliveira and Santhanam [OS18] and subsequent work showed that barely-superlinear circuit lower bounds for MCSP variants would imply major separations including NP ⊄ P/poly. The locality barrier [CHOPRS22] identified why known techniques fail: all existing lower-bound methods extend to circuits with bounded-fan-in oracle gates, while MCSP variants admit efficient circuits with exactly such gates.

A sheaf-theoretic approach defines a complexity presheaf F^{cir}_{T,s} on the sub-cube site of the Boolean hypercube. Sections over a d-dimensional sub-cube are formulas of size at most s computing the correct sub-function, identified up to labeled DAG isomorphism. The compatibility condition requires that hardwired restrictions to overlapping sub-cubes yield isomorphic DAGs after constant propagation — a strictly stronger condition than functional equality. The first Čech cohomology Ȟ¹(F^{cir}_{T,s}) captures obstructions to gluing locally compatible formulas into a global formula, and the obstruction detection function OD(T) = [Ȟ¹ ≠ {∗}] is a target for hardness magnification.

The structural properties of this presheaf — how many formulas exist per sub-function, how their DAG topologies behave under restriction, and how constrained the compatibility condition is — have not been studied quantitatively. This paper provides the first such study through systematic formula enumeration and restriction-image analysis across dimensions d = 2, 3, 4.

### 1.1. Summary of Results

**Result 1 (The Structural Taxonomy).** We enumerate all formulas on 3 inputs over {AND, OR, NOT} up to size 6 and classify all 256 three-input Boolean functions by their structural fluidity Φ. We identify a three-tier hierarchy (stiff: Φ ≤ 3; moderate: 3 < Φ ≤ 20; fluid: Φ > 20) and show that functions at the coverage frontier exhibit systematically low fluidity. This "frontier stiffness" recurs at each complexity level — appearing in the XOR family at size 4 and the unanimity/diversity family at size 6 — but dissolves at the next size level. The hardest 3-input function (PAR3, 3-bit parity) requires 11 gates in our all-gates model (9 = 3² binary gates in the standard De Morgan measure [Khr71, Tar08]).

**Result 2 (The Universe-to-Image Scaling Law).** We define the restriction universe U(s, d) as the set of (d−1)-input DAG-isomorphism classes arising as restrictions of d-input formulas of size at most s, and the max image M(s, d) = max_f max_{i,v} |I_f(s, d, i, v)| as the largest restriction image. We measure:

| d | |U(s ≤ 4)| | M(s ≤ 4) | σ = |U|/M |
|---|---|---|---|
| 2 | 225 | 111 | 2.0 |
| 3 | 2,324 | 367 | 6.3 |
| 4 | 11,075 | 835 | 13.3 |

At fixed d = 3, σ converges to σ∞(3) ≈ 6.4 as s → ∞. We connect this to Savický's anti-concentration theorem [Sav90] and conjecture σ∞(d) → ∞ as d → ∞.

**Result 3 (The BENT Case Study).** For x₀x₁ ⊕ x₂x₃ at n = 4, d = 2: 50% of structural edges have empty restriction-image intersection at minimum size; the global circuit produces a valid compatible family at non-minimal size (structural gap γ = 5/4).

### 1.2. Organization

Section 2 defines the presheaf, restriction images, and the compatibility CSP. Section 3 describes the computational framework. Section 4 presents the structural taxonomy. Section 5 establishes the scaling law, the dilution mechanism, and the connection to Savický's theorem. Section 6 provides the BENT case study. Section 7 discusses consequences for meta-complexity.

---

## 2. Preliminaries

### 2.1. Formulas and DAG Isomorphism

**Definition 2.1 (Formula).** A formula over B = {AND, OR, NOT} with d inputs x_0, ..., x_{d-1} is a rooted tree where each internal node is labeled by a gate from B and each leaf is labeled by an input variable or a constant (0 or 1). The size |F| is the number of internal nodes (all gates, including NOT). This is the formula complexity model (fan-out 1).

**Note on complexity measure.** Our size counts all gates including NOT. The standard De Morgan formula complexity counts binary gates only (NOT is free, pushed to leaves). In the standard measure, n-variable parity has formula complexity exactly n² [Khr71]. All structural results (restriction images, fluidity, the scaling law) are independent of the gate-counting convention.

**Definition 2.2 (DAG isomorphism).** Two formulas are DAG-isomorphic if they have the same canonical string, defined recursively: inputs and constants are self-canonical; NOT(C) has form N(can(C)); AND(C₁,C₂) has form A(min(can(C₁),can(C₂)), max(can(C₁),can(C₂))), with commutative sorting. Similarly for OR.

**Relationship to the circuit (DAG) model.** Our formula enumeration is more fine-grained than general circuits with fan-out sharing. All quantitative claims — fluidity, universe sizes, intersection rates — are upper bounds on the corresponding DAG-model quantities, making the analysis conservative.

### 2.2. Restriction Images

**Definition 2.3 (Restriction).** For a formula F with d inputs, the restriction F|_{x_i=v} is obtained by replacing all x_i leaves with constant v, propagating constants through gates, eliminating dead sub-trees, and re-indexing remaining inputs.

**Definition 2.4 (Restriction image).** For a Boolean function f : {0,1}^d → {0,1} and size bound s:

I_f(s, d, i, v) = { [F|_{x_i=v}] : F is a formula of size ≤ s computing f }

**Definition 2.5 (Restriction universe).** U(s, d) = ⋃_f ⋃_{i,v} I_f(s, d, i, v), the set of all (d−1)-input DAG classes arising as restrictions.

**Definition 2.6 (Structural fluidity).** Φ(f, s) = |⋃_{i,v} I_f(s, d, i, v)|, the total distinct restriction classes across all 2d directions.

### 2.3. The Sub-Cube Intersection Graph and the Compatibility CSP

**Definition 2.7.** The sub-cube intersection graph G_{n,d} has vertices = d-dimensional sub-cubes of {0,1}^n; structural edges connect sub-cubes with overlap dimension ≥ 1. Each vertex has degree Σ_{k=0}^{d} C(d,k)·C(n−d,d−k)·2^{d−k} − 1, with edge expansion Ω(d/n).

**Definition 2.8 (STRUCT-MATCH).** For overlapping sub-cubes U, U' with overlap V, formulas F_U and F_{U'} satisfy STRUCT-MATCH iff [F_U|_V] = [F_{U'}|_V].

**Definition 2.9 (Compatibility CSP).** For truth table T, dimension d, size bound s, the CSP Γ(T, d, s) has: variables at each d-dimensional sub-cube U with domain F_{T,s}(U); constraints on structural edges requiring STRUCT-MATCH. A solution is a compatible family of formulas.

---

## 3. Computational Framework

We enumerate formulas by size, generating size-s formulas from NOT of size-(s−1) and AND/OR of pairs with sizes summing to s−1. Deduplication is by canonical form. At each size level, we compute restriction images for all formulas and accumulate the universe.

**Cross-checks.** XOR = 4 gates, AND₃ = 2 gates, OR₃ = 2 gates — all match known values.

| d | Max size | Formulas | Functions covered | Time |
|---|---|---|---|---|
| 2 | 4 | 36,052 | 16/16 | <1s |
| 3 | 4 | 93,315 | 121/256 | ~1s |
| 3 | 5 | 1,587,920 | 191/256 | ~60s |
| 3 | 6 | ~2.5M (targeted) | 226/256 | ~30s |
| 4 | 4 | 207,078 | 886/65,536 | ~7s |

The minimum formula size for all 256 three-input functions was determined via integer truth-table enumeration (bitwise AND/OR/NOT on 8-bit integers) through size 12. All Python source code is available as supplementary material.

---

## 4. The Structural Taxonomy of 3-Input Functions

### 4.1. The Complexity Spectrum

| Min size | Functions | Cumulative | Notable |
|---|---|---|---|
| 0 | 5 | 5 | Inputs, constants |
| 1 | 9 | 14 | AND, OR, NOT |
| 2 | 26 | 40 | NAND, NOR, implications |
| 3 | 44 | 84 | AND₃, OR₃ |
| 4 | 37 | 121 | XOR, XNOR, MAJ₃ |
| 5 | 70 | 191 | Mixed-complexity |
| 6 | 35 | 226 | Unanimity, diversity |
| 7 | 6 | 232 | — |
| 8 | 16 | 248 | — |
| 9 | 6 | 254 | — |
| 10 | 0 | 254 | (gap) |
| 11 | 1 | 255 | PAR3 |
| 12 | 1 | 256 | NPAR3 |

**Observation 4.1.** PAR3 (x₀ ⊕ x₁ ⊕ x₂) requires 11 gates in our all-gates model (= 9 = 3² binary gates in the standard De Morgan measure [Khr71]; uniqueness for n = 2^k proved by [Tar08]). It is isolated by a gap of two levels from the next-hardest functions at size 9.

### 4.2. Structural Tiers

At s ≤ 4 (121 functions): STIFF (Φ ≤ 3): 4 functions (XOR₀₁, XOR₁₂, XNOR₀₁, XNOR₁₂), each with exactly 1 formula and singleton restriction images. MODERATE (3 < Φ ≤ 20): 43 functions, including MAJ₃ (Φ = 4, 6 formulas). FLUID (Φ > 20): 74 functions, including x₀ (Φ = 413, 7,441 formulas).

At s ≤ 5 (191 functions): All 70 newly covered functions are MODERATE. XOR-family functions soften; zero functions remain stiff.

At s ≤ 6 (226 functions): Two non-XOR STIFF functions emerge — unanimity (f10000001, Φ = 2) and diversity (f01111110, Φ = 2), each with 9 formulas. All 33 other newly covered functions are MODERATE.

**Observation 4.2 (Recurrence of Frontier Stiffness).** Stiffness appears at each coverage frontier from a different algebraic family — XOR at size 4, unanimity at size 6 — then dissolves at the next level.

### 4.3. Restriction Image Compression

| Function | Domain size | Max |I| per direction | Compression |
|---|---|---|---|
| ZERO | 9,624 | 39 | 247× |
| AND₀₁ | 2,757 | 338 | 8.2× |
| NAND₃ | 78 | 8 | 9.8× |
| XOR₀₁ | 1 | 1 | 1× |

The restriction map is highly compressive. This is why STRUCT-MATCH is selective: many formulas for a function collapse to few restriction classes, making it unlikely that two neighboring sub-cubes' restriction images overlap.

---

## 5. The Universe-to-Image Scaling Law

### 5.1. Cross-Dimensional Scaling

At fixed size budget s ≤ 4:

| d | |U(s ≤ 4, d)| | M(s ≤ 4, d) | σ(4, d) |
|---|---|---|---|
| 2 | 225 | 111 | 2.03 |
| 3 | 2,324 | 367 | 6.33 |
| 4 | 11,075 | 835 | 13.26 |

**Observation 5.1.** The universe grows 4.8× per dimension step; the max image grows 2.3×. The ratio approximately doubles per step, consistent with σ ≈ 2^{d−1}.

**Observation 5.2.** Per-direction universe sizes are identical across all restriction directions, reflecting basis symmetry under input permutation.

### 5.2. Size-Budget Convergence

At d = 3, tracking σ as the cumulative size budget increases:

| s ≤ | |U| | M | σ | Growth factor |
|---|---|---|---|---|
| 0 | 4 | 1 | 4.00 | — |
| 1 | 12 | 3 | 4.00 | 1.00× |
| 2 | 52 | 10 | 5.20 | 1.30× |
| 3 | 324 | 54 | 6.00 | 1.15× |
| 4 | 2,324 | 367 | 6.33 | 1.06× |
| 5 | 18,316 | 2,845 | 6.44 | 1.02× |

**Observation 5.3 (Convergence).** σ(s, 3) converges monotonically to σ∞(3) ≈ 6.4. Growth factors decelerate: 1.00, 1.30, 1.15, 1.06, 1.02. At each size step, the universe and max image grow by nearly the same factor (7.9× vs 7.8× at s = 5), indicating a common exponential growth rate. The ratio encodes a dimensional constant independent of this common rate.

### 5.3. The Top-Share Identity

At convergence, σ∞(d) admits an exact decomposition. Since every formula computes exactly one function and formulas for different functions have disjoint DAG classes, the total DAG-class count decomposes as T(d−1) = Σ_g T_g(d−1) over all 2^{2^{d−1}} functions g on d−1 inputs. The asymptotic ratio is:

**σ∞(d) = 1 / α(d)**

where α(d) = max_g T_g(d−1) / T(d−1) is the *top share* — the fraction of all (d−1)-input DAG classes belonging to the most prolific function.

| d | max_g |I_g| | |U| | α(d) | σ∞(d) |
|---|---|---|---|---|
| 2 | 111 | 225 | 49.3% | 2.03 |
| 3 | 367 | 2,324 | 15.8% | 6.33 |
| 4 | 835 | 11,075 | 7.5% | 13.26 |

In all cases, the maximizing function is a projection (e.g., x₀), which has the most formulas because degenerate constructions using unnecessary gates are plentiful.

### 5.4. The Dilution Mechanism

The top share α(d) decreases because the denominator (total DAG classes across all functions) grows faster with d than the numerator (DAG classes for the most prolific function).

**Denominator growth** is driven by the number of contributing functions: 2^{2^{d−1}} functions on d−1 inputs. As d increases by 1, this number squares. Even if most new functions contribute few DAG classes each, the collective weight grows.

**Numerator growth** is constrained by the structural redundancy of a single function. The redundancy budget s − C(g) — the gap between the size bound and a function's minimum formula size — controls the number of DAG classes T_g. Simple functions (low C(g)) dominate the max image because they have the most room for redundant constructions. But adding one input variable creates more total DAG diversity (benefiting the universe) than extra implementations of any single function (benefiting the max image). Concretely: the identity function's DAG classes grew 2.0× from d = 3 to d = 4, while the universe grew 4.8×.

### 5.5. Anti-Concentration via Savický's Theorem

We connect the dilution mechanism to a classical result from the theory of random Boolean formulas.

**Theorem 5.5 (Savický [Sav90]; Lefmann–Savický [LS97]).** For the AND/OR tree model with negated literals on n variables, the fraction of formulas of size m computing any fixed function f satisfies |F_m(f)| / |F_m| → 2^{−2^n} as m → ∞. The formula-count top share converges to 2^{−2^{d−1}}, which is doubly exponentially small in d.

This establishes anti-concentration at the *formula level*. To transfer to the DAG-class level, we need to control the canonical compression ratio |F_m(g)| / T_g (formulas per DAG class).

**Corollary 5.6 (Conditional structural anti-concentration).** If the canonical compression ratio max_g (|F_m(g)| / T_g) is bounded by poly(m), then α(d) ≤ poly(m) · 2^{−2^{d−1}} → 0 as d → ∞, establishing σ∞(d) → ∞.

*Proof.* Under the bound, T_g ≥ |F_m(g)| / poly(m). Then α(d) = max_g T_g / Σ_g T_g ≤ max_g |F_m(g)| / (Σ_g |F_m(g)| / poly(m)) = poly(m) · max_g |F_m(g)| / |F_m| → poly(m) · 2^{−2^{d−1}} → 0. ∎

**Empirical verification of the compression condition.** At d = 3, s ≤ 4, the ratio |F_m(g)| / T_g ranges from 1.1 to 2.0 across all 121 covered functions, with median 2.0. The near-constant compression arises because canonical deduplication only sorts commutative operands of binary gates. If this O(1) compression persists at larger s (as the structure of canonical sorting suggests), the corollary applies unconditionally.

### 5.6. Conjectures and Open Problems

**Conjecture 5.7 (Asymptotic convergence).** For each d ≥ 2 and complete basis B, the limit σ∞(d) = lim_{s→∞} σ(s, d) exists and is finite.

**Conjecture 5.8 (Dimensional growth).** σ∞(d) → ∞ as d → ∞. Stronger form: σ∞(d) ≥ 2^{Ω(d)}.

**Open Problem 5.9 (Restriction entropy).** For a random formula F on d inputs, define the restriction entropy H(F) = log₂|{[F|_{x_i=v}] : i ∈ [d], v ∈ {0,1}}|. Does E[H(F)] = Θ(log d) (implying polynomial growth of σ∞) or Θ(d) (implying exponential growth)?

**Open Problem 5.10 (Compression bound).** Prove that the canonical compression ratio max_g (|F_m(g)| / T_g) is bounded by poly(m) for all d. This would convert Corollary 5.6 from conditional to unconditional.

### 5.7. Pairwise Intersection Rates

At d = 3, s ≤ 4, we computed pairwise intersection rates across all function pairs and restriction directions:

| Tier pair | Intersection rate |
|---|---|
| Size 0 × Size 0 | 10.0% |
| Size 0 × Size 4 | 4.3% |
| Size 2 × Size 3 | 10.7% |
| Size 4 × Size 4 | 5.2% |

Even the most flexible pairing (size 0 × size 0) achieves only 10% intersection. Frontier functions (size 4) intersect with any tier at 4–7%. Each function's restriction image covers a small, essentially random-looking subset of the 2,324-element universe.

---

## 6. Case Study: The BENT Function

### 6.1. Setup

We analyze f(x₀, x₁, x₂, x₃) = x₀x₁ ⊕ x₂x₃ at n = 4, d = 2. The sub-cube site has 24 dimension-2 sub-cubes and 96 structural edges (1-dimensional overlaps). The 24 sub-cubes decompose as: 6 computing AND, 4 computing ZERO, 4 computing x₀, 4 computing x₁, 4 computing XOR, 2 computing NAND.

### 6.2. Incompatibility at Minimum Size

At s ≤ 4, 48 of 96 structural edges (50.0%) have empty restriction-image intersection. All 48 incompatible edges involve XOR sub-cubes adjacent to non-XOR sub-cubes. The XOR sub-function has exactly 1 formula at size 4, producing a singleton restriction image disjoint from the restriction images of AND, ZERO, identity, and NAND formulas.

The incompatibility is absolute: no choice of size-≤4 formulas for neighboring XOR and non-XOR sub-cubes can satisfy STRUCT-MATCH. A CSP solver with arc consistency confirms that the constraints cascade through the intersection graph, emptying all 24 variable domains.

### 6.3. The Global Circuit's Compatible Family

The global bent formula O(A(A(x₀,x₁),N(A(x₂,x₃))),A(A(x₂,x₃),N(A(x₀,x₁)))) of size 9, restricted to each of the 24 sub-cubes, produces a fully compatible family: 96/96 structural edges satisfy STRUCT-MATCH.

The restrictions to XOR-computing sub-cubes have size 5, not the minimum 4. The global formula's XOR restriction has a different DAG topology from the minimum-size XOR formula — the former decomposes XOR as OR-of-ANDs-of-NOTs (reflecting the global AND-then-XOR structure), while the latter uses AND-of-OR-and-NAND.

**Observation 6.1 (Structural Gap).** γ = 5/4 = 1.25. Compatible families require formulas carrying the structural fingerprint of a common global computation, imposing a size overhead beyond the local minimum.

### 6.4. The F^{cir} vs F^{fn} Distinction

Functional compatibility (correct function on the overlap) is trivially satisfied by any choice of correct local formulas. Structural compatibility (DAG-isomorphic restrictions on overlaps) fails at 50% of edges at minimum size. STRUCT-MATCH is strictly more constraining than functional compatibility.

---

## 7. Consequences for Meta-Complexity

### 7.1. The Compatibility CSP as a Meta-Complexity Object

The compatibility CSP Γ(T, d, s) is a well-defined combinatorial object for each truth table T, dimension d, and size bound s. Our results characterize its constraint density: when σ∞(d) is large, STRUCT-MATCH constraints eliminate the vast majority of assignment pairs; empirically the surviving fraction scales on the order of 1/σ∞(d).

The function OD(T) = 1 iff this CSP is satisfiable and the solution does not extend to a global formula. OD is thus a CSP satisfiability detection problem on an expanding constraint graph, placing it within the meta-complexity landscape alongside MCSP and Gap-MCSP [OS18].

### 7.2. Sparsity of OD = 1 Instances

The Savický anti-concentration theorem, combined with the empirically verified low canonical compression, implies that formula structures are spread thinly across function space. Consequently, the compatibility CSP is unsatisfiable for generic truth tables (OD = 0 is the default), and our scaling law strongly suggests that the truth tables where compatible families exist (OD = 1) form a sparse subset.

This provides quantitative support for natural proofs evasion: if {T : OD(T) = 1} has density approaching 2^{−2^{d−1}}, the OD property is "non-large" in the sense of Razborov–Rudich [RR97]. It also reframes the hardness question: the difficulty of computing OD, if any, lies in distinguishing the rare OD = 1 instances from generic OD = 0 instances — a detection problem.

### 7.3. Connections to Proof Complexity

The constraints of Γ(T, d, s) can be encoded as polynomial equations, and infeasibility (OD = 0) corresponds to a Nullstellensatz refutation. If the refutation degree grows super-polynomially for high-complexity truth tables, this would constitute a proof complexity lower bound with implications for OD via the IPS framework [GP14]. Our structural data — particularly the expanding constraint graph with Ω(d/n) edge expansion — suggests infeasibility proofs cannot be localized, a prerequisite for high degree. This direction remains unexplored.

### 7.4. What This Work Does Not Do

We emphasize that nothing in this paper constitutes progress toward proving P ≠ NP or even toward proving circuit lower bounds for OD. The structural characterization of the presheaf — however detailed — is a characterization of the *mathematical object*, not of the *computational problem* of deciding its properties. Converting structural properties of combinatorial objects into computational lower bounds for functions that detect those properties is the central challenge of meta-complexity theory, and it remains open.

What this work does provide is a precise, quantitative foundation for future attempts at this conversion. The scaling law σ∞(d) ≈ 2^{d−1}, the three-tier structural taxonomy, the redundancy budget mechanism, and the connection to Savický's distributional theory together form a toolkit that any future argument — whether through magnification, proof complexity, or direct methods — would need to engage with. By establishing these tools and identifying the exact gaps (the compression bound, the restriction entropy scaling, the detection hardness question), we aim to make the next step possible rather than to take it ourselves.

Understanding the structure of Boolean formulas at the level of DAG topology rather than function representation may provide a complementary perspective to classical circuit complexity methods.

---

## References

[CFGG04] B. Chauvin, P. Flajolet, D. Gardy, B. Gittenberger. And/Or Trees Revisited. *Combinatorics, Probability and Computing* 13(4–5):475–497, 2004.

[CHOPRS22] L. Chen, S. Hirahara, I.C. Oliveira, J. Pich, N. Rajgopal, R. Santhanam. Beyond Natural Proofs: Hardness Magnification and Locality. *Journal of the ACM* 69(4):25:1–25:49, 2022.

[GP14] J.A. Grochow, T. Pitassi. Circuit Complexity, Proof Complexity, and Polynomial Identity Testing. *Proc. 55th IEEE FOCS*, pp. 110–119, 2014.

[Hås98] J. Håstad. The Shrinkage Exponent of De Morgan Formulae is 2. *SIAM Journal on Computing* 27(1):48–64, 1998.

[Khr71] V.M. Khrapchenko. A Method of Determining Lower Bounds for the Complexity of Π-Schemes. *Matematicheskie Zametki* 10(1):83–92, 1971. English translation in *Mathematical Notes* 10(1):474–479.

[LS97] H. Lefmann, P. Savický. Some Typical Properties of Large AND/OR Boolean Formulas. *Random Structures & Algorithms* 10(3):337–351, 1997.

[OS18] I.C. Oliveira, R. Santhanam. Hardness Magnification for Natural Problems. *Proc. 59th IEEE FOCS*, pp. 65–76, 2018.

[BP05] A. Brodsky, N. Pippenger. The Boolean Functions Computed by Random Boolean Formulas or How to Grow the Right Function. *Random Structures & Algorithms* 27(4):490–519, 2005.

[RR97] A.A. Razborov, S. Rudich. Natural Proofs. *Journal of Computer and System Sciences* 55(1):24–35, 1997.

[Sav90] P. Savický. Random Boolean Formulas Representing Any Boolean Function with Asymptotically Equal Probability. *Discrete Mathematics* 83(1):95–103, 1990.

[Tar08] J. Tarui. Smallest Formulas for Parity of 2^k Variables Are Essentially Unique. *Proc. 14th COCOON*, LNCS 5092, pp. 95–105, 2008.

---

## Supplementary Material

All enumeration scripts, restriction-image computations, and raw data are available as Python source files:

- `compat_csp_n4.py`: Compatibility CSP solver with STRUCT-MATCH (n = 4)
- `restriction_audit.py`: Restriction image computation for BENT
- `d3_catalog.py`: d = 3 structural taxonomy at size ≤ 4
- `d3_size5.py`, `d3_size6.py`: Extended enumeration at sizes 5 and 6
- `par3_audit.py`: PAR3 minimum formula size determination
- `d4_universe.py`: d = 4 universe computation
- `d3_universe_growth.py`: Universe-to-image ratio convergence at d = 3
- `n5_audit.py`: Misalignment rate measurements at n = 5
- `sparsity_analysis.py`: Universe density and pairwise intersection analysis
