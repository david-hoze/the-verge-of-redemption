Build a project called `circuit-presheaf` in **Idris2** that calls **Macaulay2** for algebra. Install both (`pack install-deps` for Idris2, `apt install macaulay2` or `brew install macaulay2` for M2). If Macaulay2 isn't available on this system, still build the Idris2 parts and generate the `.m2` scripts as files.

# What this computes

Boolean formulas over the basis {AND, OR, NOT} with `d` input variables. A formula is a tree: leaves are inputs `x0..x_{d-1}` or constants `0,1`; internal nodes are AND (fan-in 2), OR (fan-in 2), or NOT (fan-in 1). **Size** = number of internal nodes (all gates count, including NOT).

Two formulas are **DAG-isomorphic** if they have the same **canonical string**:
```
can(Input i)     = "x" ++ show i
can(Const b)     = if b then "c1" else "c0"  
can(NOT c)       = "N(" ++ can(c) ++ ")"
can(AND l r)     = "A(" ++ min(can(l),can(r)) ++ "," ++ max(can(l),can(r)) ++ ")"
can(OR l r)      = "O(" ++ min(can(l),can(r)) ++ "," ++ max(can(l),can(r)) ++ ")"
```
The min/max sorts commutative children. This is the ONLY equivalence — nothing else.

**Restriction**: hardwire input `x_i` to value `v`, then propagate constants bottom-up:
- `NOT(Const b)` → `Const (not b)`
- `AND(Const False, _)` or `AND(_, Const False)` → `Const False`
- `AND(Const True, x)` or `AND(x, Const True)` → `x`
- `OR(Const True, _)` or `OR(_, Const True)` → `Const True`
- `OR(Const False, x)` or `OR(x, Const False)` → `x`

After propagation, re-index remaining inputs: any index > i decrements by 1.

**Restriction image** of function `f` at size `s`, direction `(i,v)`: the set of canonical strings of `restrict(F, i, v)` across all formulas F of size ≤ s computing f.

**Restriction universe** `U(s,d)`: union of all restriction images across all functions and directions.

**Max image** `M(s,d)`: the largest restriction image for any single function/direction.

**σ(s,d)** = |U(s,d)| / M(s,d). This is the structural entropy ratio.

# What to build

## 1. Formula core (src/Circuit/)

`Formula.idr`: The AST. Evaluation on a `Vect d Bool`. Size function. 

**Critical optimization**: For d ≤ 4, represent truth tables as bit integers (`Bits8` for d=2, `Bits16` for d=3, `Bits32` for d=4). Hardcode the input atoms:
```
d=3: x0=0xAA, x1=0xCC, x2=0xF0, const0=0x00, const1=0xFF
d=4: x0=0xAAAA, x1=0xCCCC, x2=0xF0F0, x3=0xFF00, const0=0x0000, const1=0xFFFF
```
Then: `AND(a,b)` = bitwise-and, `OR(a,b)` = bitwise-or, `NOT(a)` = bitwise-xor with all-ones mask. Truth table computation becomes O(1) per formula.

`Canonical.idr`: The canonical string function above. Use string hashing (or `SortedSet String`) for dedup.

`Restriction.idr`: The restrict function + constant propagation + re-indexing.

`Enumerate.idr`: Size-stratified enumeration. Generate size-s formulas by combining:
- NOT of any size-(s-1) formula
- AND or OR of formulas with sizes s1 + s2 = s-1, iterating s1 from 0 to (s-1)/2

**Keep formulas grouped by exact size** in a map `SortedMap Nat (List Formula)`. Only combine across size levels — never re-examine all previously generated formulas. Deduplicate by canonical string.

Also maintain a map from truth table (as bit integer) to (size → list of formulas) for analysis.

## 2. Analysis (src/Analysis/)

`SubCube.idr`: For n-bit truth table T and sub-cube dimension d:
- A sub-cube is (freeCoords : List (Fin n), fixedValues : List (Fin n, Bool))
- Enumerate all sub-cubes: choose d coords to be free, fix the rest to all 2^(n-d) combinations
- The sub-function: evaluate T on the sub-cube's inputs
- Structural intersection graph: edges between sub-cubes sharing ≥ 1 free coordinate

`RestrictionImage.idr`: For each function at each size budget, compute all restriction images. Accumulate the universe and track the max image. Output: `|U|`, `M`, `σ`, top-share `α`.

`CompatCSP.idr`: Build the compatibility CSP:
- Nodes = sub-cubes, domains = canonical forms of formulas computing the sub-function at size ≤ s
- Edges = structural edges, constraints = STRUCT-MATCH (restrictions to overlap must be DAG-isomorphic)
- For each edge, compute the set of compatible pairs: `(c_i, c_j)` where `can(restrict(c_i, overlap)) == can(restrict(c_j, overlap))`
- Classify edges: fully compatible, partially compatible, fully incompatible
- Output: node count, edge count, domain sizes, compatibility fractions

## 3. Macaulay2 integration (src/Algebra/)

`M2Gen.idr`: Given a CSP (from CompatCSP), generate a `.m2` script:

```m2
-- Auto-generated
R = QQ[v0_0, v0_1, ..., vN_K];

I = ideal(
  -- Boolean: v^2 - v for each variable
  v0_0^2 - v0_0,
  ...
  -- Exactly-one per node: sum of node's vars = 1
  v0_0 + v0_1 + v0_2 - 1,
  ...
  -- Incompatibility: product = 0 for each incompatible pair
  v3_0 * v7_0,
  ...
);

-- Unsatisfiability check
if 1 % I == 0 then print "UNSAT" else print "SAT";

-- Groebner basis
G = gens gb I;
print G;
```

For NS degree scanning at a specific degree bound d, also generate:
```m2
-- Check if 1 is in I at degree d
-- Use hilbertFunction or direct membership test
print hilbertFunction(0, R/I);
-- If this is 0, the system is unsatisfiable
```

`M2Parse.idr`: Parse M2 text output. Detect:
- `"UNSAT"` or `"SAT"` from the membership test
- `{1}` in Groebner basis output (= unsatisfiable)
- Hilbert function values

`NSDriver.idr`: Orchestrate:
1. Take a CSP from `CompatCSP`
2. Optionally select a subgraph (by node indices) to keep the instance small
3. Call `M2Gen` to write the `.m2` file
4. Shell out: `system "M2 --script generated.m2 > output.txt"`
5. Call `M2Parse` on the output
6. Report result

## 4. CLI (src/Main.idr)

```
circuit-presheaf enumerate --dim 3 --max-size 5
circuit-presheaf scaling --max-size 4
circuit-presheaf convergence --dim 3 --max-size 7
circuit-presheaf taxonomy --dim 3 --max-size 4
circuit-presheaf bent --size 4
circuit-presheaf bent --size 5 --m2gen bent_s5.m2
circuit-presheaf m2run bent_s5.m2
```

Output: human-readable tables by default. `--json` flag for machine-readable.

## 5. Tests

Verify against these known values from the Python campaign:

**Enumeration counts:**
| d | s≤ | formulas | functions covered |
|---|---|---|---|
| 2 | 4 | 36,052 | 16/16 |
| 3 | 4 | 93,315 | 121/256 |
| 3 | 5 | 1,587,920 | 191/256 |
| 4 | 4 | 207,078 | 886/65,536 |

**Scaling law σ(s,d):**
| d | s≤4 |U| | s≤4 M | s≤4 σ |
|---|---|---|---|
| 2 | 225 | 111 | 2.03 |
| 3 | 2,324 | 367 | 6.33 |
| 4 | 11,075 | 835 | 13.26 |

**Size convergence at d=3:**
| s≤ | |U| | M | σ |
|---|---|---|---|
| 0 | 4 | 1 | 4.00 |
| 1 | 12 | 3 | 4.00 |
| 2 | 52 | 10 | 5.20 |
| 3 | 324 | 54 | 6.00 |
| 4 | 2,324 | 367 | 6.33 |
| 5 | 18,316 | 2,845 | 6.44 |

**Top share α(d):** 49.3% (d=2), 15.8% (d=3), 7.5% (d=4)

**BENT at n=4, d=2, s≤4:** 24 sub-cubes, 96 structural edges, 48 incompatible (50%), 48 compatible.

**Minimum formula sizes (d=3):** XOR=4, AND=1, AND3=2, OR3=2, NAND3=3, MAJ3=4, PAR3=11.

**Canonical compression (d=3, s≤4):** ratio of raw formulas to canonical DAG classes ranges from 1.1 to 2.0 across all functions, median 2.0.

All of these must match before proceeding to new computations.

# Performance requirements

- d=3 s≤5: under 5 seconds (Python takes 60s; expect 10-50× speedup from compiled Idris2)
- d=3 s≤7: under 5 minutes (Python can't do this)
- d=4 s≤5: under 10 minutes (Python can't do this)

The bottleneck is the enumeration loop — canonical string computation and hash-based dedup. Use mutable hash maps (`IORef` + `Data.IOArray` or similar) for the inner loop.

# Build order

1. Formula.idr + Canonical.idr + Restriction.idr — get the core types right
2. Enumerate.idr — verify formula counts match the table above
3. RestrictionImage.idr — verify σ values match
4. SubCube.idr + CompatCSP.idr — verify BENT numbers match
5. M2Gen.idr — generate `.m2` scripts
6. M2Parse.idr + NSDriver.idr — run M2 if available
7. Main.idr — CLI wiring
8. Push to d=3 s≤7 and d=4 s≤5 (new territory)
