import { DifficultyLevel, MathDiagramSpec, QuestionItem } from '../types/quiz';

const MATH_TOPICS = [
  'Unit 9.1 · Topic 1: Indices and standard form',
  'Unit 9.1 · Topic 2: The number system',
  'Unit 9.2 · Topic 1: Manipulating algebra, expressions and formulae',
  'Unit 9.2 · Topic 2: Linear and simultaneous equations',
  'Unit 9.3 · Topic 1: 2D shapes and measure',
  'Unit 9.3 · Topic 2: 3D shapes',
  "Unit 9.3 · Topic 3: Pythagoras' theorem",
] as const;

function uniqueOpts(correct: string, candidates: string[]): string[] {
  const out = [correct];
  for (const c of candidates) {
    if (out.length >= 4) break;
    if (c !== correct && !out.includes(c)) {
      out.push(c);
    }
  }
  let bump = 1;
  while (out.length < 4 && bump < 50) {
    const fallback = `${correct} (${bump++})`;
    if (!out.includes(fallback)) out.push(fallback);
  }
  return out.slice(0, 4);
}

function buildMathProblem(
  topicIndex: number,
  k: number,
  section: 'test' | 'exam'
): Omit<QuestionItem, 'id'> {
  const topic = MATH_TOPICS[topicIndex];
  const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const difficulty = diffs[k % 3];

  let q = '';
  let opts: string[] = [];
  let explain = '';
  let diagram: MathDiagramSpec | undefined;

  // Offset parameter pools cleanly so Test (k=0..50) and Exam (k=0..72) NEVER collide
  const idx = section === 'test' ? k : k + 120;

  switch (topicIndex) {
    // Topic 0: Indices and standard form (9Ni.02, 9Ni.03, 9Ae.02, 9Np.01)
    case 0: {
      const subType = idx % 4;
      const seq = Math.floor(idx / 4) + 1;
      if (subType === 0) {
        const base = [2, 3, 5, 7, 10, 11][seq % 6];
        const p1 = (Math.floor(seq / 6) % 9) + 2;
        const p2 = ((seq * 3) % 8) + 2;
        const p3 = (seq % 5) + 1;
        if (section === 'test') {
          const resP = p1 + p2 - p3;
          q = `Simplify using index laws: (${base}^${p1} × ${base}^${p2}) ÷ ${base}^${p3}`;
          opts = uniqueOpts(`${base}^${resP}`, [
            `${base}^${p1 + p2 + p3}`,
            `${base}^${p1 * p2 - p3}`,
            `${base}^${resP + 2}`,
            `${base}^${Math.max(1, resP - 1)}`,
          ]);
          explain = `9Ni.02: Add indices when multiplying (${p1} + ${p2} = ${p1 + p2}) and subtract when dividing (${p1 + p2} − ${p3} = ${resP}).`;
        } else {
          const resP = p1 * 2 - p3;
          q = `Write (${base}^${p1})² ÷ ${base}^${p3} as a single power of ${base}.`;
          opts = uniqueOpts(`${base}^${resP}`, [
            `${base}^${p1 + 2 - p3}`,
            `${base}^${p1 * 2 + p3}`,
            `${base}^${resP + 1}`,
            `${base}^${Math.max(1, resP - 2)}`,
          ]);
          explain = `9Ni.02: (${base}^${p1})² = ${base}^${p1 * 2}, then subtract ${p3} to get ${base}^${resP}.`;
        }
      } else if (subType === 1) {
        const lead = ((seq * 7) % 89) + 11; // 11..99
        const mant = (lead / 10).toFixed(1);
        const exp = (seq % 6) + 3;
        if (section === 'test') {
          const val = Math.round((lead / 10) * Math.pow(10, exp));
          q = `Convert ${val.toLocaleString('en-US')} into standard form.`;
          opts = uniqueOpts(`${mant} × 10^${exp}`, [
            `${mant} × 10^${exp + 1}`,
            `${mant} × 10^${exp - 1}`,
            `${lead} × 10^${exp - 1}`,
          ]);
          explain = `9Ni.03: Shift decimal ${exp} places left so 1 ≤ ${mant} < 10: ${mant} × 10^${exp}.`;
        } else {
          const zeroes = '0'.repeat(exp - 1);
          const decStr = `0.${zeroes}${lead}`;
          q = `Express the small decimal ${decStr} in standard form.`;
          opts = uniqueOpts(`${mant} × 10^−${exp}`, [
            `${mant} × 10^−${exp + 1}`,
            `${mant} × 10^−${exp - 1}`,
            `${lead} × 10^−${exp}`,
          ]);
          explain = `9Ni.03: Moving decimal ${exp} places right gives ${mant} × 10^−${exp}.`;
        }
      } else if (subType === 2) {
        const coeffA = (seq % 5) + 2;
        const coeffB = ((seq + 2) % 4) + 2;
        const e1 = (seq % 5) + 2;
        const e2 = ((seq * 2) % 4) + 2;
        if (section === 'test') {
          const num = (coeffA * 10 + coeffB) / 10;
          const p = (seq % 4) + 2;
          const ans = Math.round(num * Math.pow(10, p));
          q = `Evaluate ${num} ÷ 10^−${p}.`;
          opts = uniqueOpts(ans.toLocaleString('en-US'), [
            (num / Math.pow(10, p)).toString(),
            (ans * 10).toLocaleString('en-US'),
            (ans / 10).toLocaleString('en-US'),
          ]);
          explain = `9Np.01: Dividing by 10^−${p} is equivalent to multiplying by 10^${p}: ${ans.toLocaleString('en-US')}.`;
        } else {
          const prod = coeffA * coeffB;
          const sumE = e1 + e2;
          q = `Work out (${coeffA} × 10^${e1}) × (${coeffB} × 10^${e2}) in standard form.`;
          const normalized =
            prod >= 10
              ? `${(prod / 10).toFixed(1)} × 10^${sumE + 1}`
              : `${prod} × 10^${sumE}`;
          opts = uniqueOpts(normalized, [
            `${prod} × 10^${e1 * e2}`,
            `${coeffA + coeffB} × 10^${sumE}`,
            `${(prod / 10).toFixed(1)} × 10^${sumE + 2}`,
            `${prod} × 10^${sumE - 1}`,
          ]);
          explain = `9Ni.03: Multiply coefficients (${coeffA} × ${coeffB} = ${prod}) and add powers (${e1} + ${e2} = ${sumE}).`;
        }
      } else {
        const factor = (seq % 5) + 2;
        const m = ((seq + 1) % 6) + 2;
        const px = (seq % 5) + 3;
        const py = ((seq + 3) % 4) + 2;
        if (section === 'test') {
          q = `Simplify the algebraic fraction: (${factor * m}x^${px + 2}y^${py + 1}) / (${m}x^2y)`;
          opts = uniqueOpts(`${factor}x^${px}y^${py}`, [
            `${factor + 1}x^${px}y^${py}`,
            `${factor}x^${px + 2}y^${py}`,
            `${factor * m}x^${px}y^${py + 1}`,
          ]);
          explain = `9Ae.02: ${factor * m} ÷ ${m} = ${factor}, x^(${px + 2}−2) = x^${px}, y^(${py + 1}−1) = y^${py}.`;
        } else {
          q = `Simplify (${factor * m}a^${px + 3}b^${py + 2}) ÷ (${m}a^3b^2).`;
          opts = uniqueOpts(`${factor}a^${px}b^${py}`, [
            `${factor}a^${px + 3}b^${py}`,
            `${m}a^${px}b^${py}`,
            `${factor}a^${px - 1}b^${py + 1}`,
          ]);
          explain = `9Ae.02: Divide coefficients (${factor}) and subtract indices for each variable: a^${px}b^${py}.`;
        }
      }
      break;
    }

    // Topic 1: The number system (9Ni.01, 9Ni.04, 9Nf.01)
    case 1: {
      const subType = idx % 4;
      const seq = Math.floor(idx / 4) + 1;
      if (subType === 0) {
        const rootBase = seq + 4; // 5..65
        const sq = rootBase * rootBase;
        const nonSq = sq + ((seq % (rootBase - 1)) + 1);
        q =
          section === 'test'
            ? `Between which two consecutive integers does √${nonSq} lie?`
            : `Estimate the value of √${nonSq} by identifying its bounding integers.`;
        opts = uniqueOpts(`${rootBase} and ${rootBase + 1}`, [
          `${rootBase - 1} and ${rootBase}`,
          `${rootBase + 1} and ${rootBase + 2}`,
          `${rootBase - 2} and ${rootBase - 1}`,
        ]);
        explain = `9Ni.04: Since ${rootBase}² = ${sq} < ${nonSq} < ${(rootBase + 1) ** 2} = ${rootBase + 1}², √${nonSq} lies between ${rootBase} and ${rootBase + 1}.`;
      } else if (subType === 1) {
        const baseN = (seq % 14) + 3; // 3..16
        const cube = baseN * baseN * baseN;
        const offset = (seq * 7) % Math.max(2, baseN * baseN);
        const val = cube + offset + 1;
        q =
          section === 'test'
            ? `Without a calculator, between which consecutive integers does ∛${val} fall?`
            : `Locate ∛${val} between two consecutive whole numbers.`;
        opts = uniqueOpts(`${baseN} and ${baseN + 1}`, [
          `${baseN - 1} and ${baseN}`,
          `${baseN + 1} and ${baseN + 2}`,
          `${baseN + 2} and ${baseN + 3}`,
        ]);
        explain = `9Ni.04: ${baseN}³ = ${cube} < ${val} < ${(baseN + 1) ** 3} = ${baseN + 1}³, so ∛${val} is between ${baseN} and ${baseN + 1}.`;
      } else if (subType === 2) {
        const termDens = [8, 16, 20, 25, 40, 50, 80, 125, 160, 200, 250, 400];
        const recDens = [3, 6, 7, 9, 11, 12, 13, 14, 15, 18, 21, 22, 24, 26, 27, 28, 30, 33, 35, 36];
        if (section === 'test') {
          const den = termDens[seq % termDens.length];
          const num = [1, 3, 7, 9, 11, 13][seq % 6];
          q = `Does the simplified fraction ${num}/${den} (or its reduced form) convert to a terminating or recurring decimal (case #${seq})?`.replace(` (case #${seq})`, `, and why (den = ${den})?`);
          opts = uniqueOpts(
            `Terminating, because ${den} has only prime factors 2 and/or 5`,
            [
              `Recurring, because ${num} is an odd integer`,
              `Recurring, because ${den} exceeds 5`,
              `Irrational, because fractions cannot terminate`,
            ]
          );
          explain = `9Nf.01: Factorising ${den} shows only primes 2 and/or 5, guaranteeing a terminating decimal.`;
        } else {
          const den = recDens[seq % recDens.length];
          const num = [1, 5, 7, 11, 13, 17][seq % 6];
          const g = gcd(num, den);
          const rn = num / g;
          const rd = den / g;
          q = `Without dividing, classify ${rn}/${rd} as terminating or recurring.`;
          opts = uniqueOpts(
            `Recurring, because ${rd} contains a prime factor other than 2 and 5`,
            [
              `Terminating, because ${rn} < ${rd}`,
              `Terminating, because ${rd} can be rounded cleanly`,
              `Irrational, because the decimal does not stop`,
            ]
          );
          explain = `9Nf.01: In simplest form ${rn}/${rd}, denominator ${rd} has prime factors besides 2 and 5, so it recurs.`;
        }
      } else {
        const p = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 31, 33, 34, 35, 37, 38, 39][seq % 24];
        const ratSq = ((seq % 12) + 4) ** 2;
        const mult = Math.floor(seq / 24) + 2;
        const val = p + mult * 40;
        const safeNonSq = Number.isInteger(Math.sqrt(val)) ? val + 1 : val;
        q =
          section === 'test'
            ? `Identify the irrational number in this list: √${safeNonSq}, √${ratSq}, ${mult}/5, 0.${mult}5.`
            : `Which value among √${safeNonSq}, √${ratSq}, ${mult}.25, −${mult}/4 cannot be expressed as a/b?`;
        opts = uniqueOpts(`√${safeNonSq}`, [`√${ratSq}`, `${mult}/5`, `0.${mult}5`, `${mult}.25`]);
        explain = `9Ni.01: ${safeNonSq} is not a square number, so √${safeNonSq} has a non-terminating, non-recurring decimal.`;
      }
      break;
    }

    // Topic 2: Manipulating algebra, expressions and formulae (9Ae.01–9Ae.04)
    case 2: {
      const subType = idx % 4;
      const seq = Math.floor(idx / 4) + 1;
      if (subType === 0) {
        const a = (seq % 12) + 2;
        const b = ((seq * 5) % 13) + 2;
        if (section === 'test') {
          q = `Expand and simplify: (x + ${a})(x + ${b})`;
          opts = uniqueOpts(`x² + ${a + b}x + ${a * b}`, [
            `x² + ${a * b}x + ${a + b}`,
            `x² + ${a + b}x + ${a + b}`,
            `2x + ${a + b}`,
          ]);
          explain = `9Ae.02: (x + ${a})(x + ${b}) = x² + (${a} + ${b})x + ${a * b} = x² + ${a + b}x + ${a * b}.`;
        } else {
          const mid = b - a;
          const midStr = mid === 0 ? '' : mid > 0 ? ` + ${mid === 1 ? '' : mid}x` : ` − ${Math.abs(mid) === 1 ? '' : Math.abs(mid)}x`;
          q = `Expand and simplify: (x − ${a})(x + ${b})`;
          opts = uniqueOpts(`x²${midStr} − ${a * b}`, [
            `x² + ${a + b}x − ${a * b}`,
            `x² − ${a + b}x + ${a * b}`,
            `x²${midStr} + ${a * b}`,
          ]);
          explain = `9Ae.02: x² + ${b}x − ${a}x − ${a * b} = x²${midStr} − ${a * b}.`;
        }
      } else if (subType === 1) {
        const k = (seq % 9) + 2;
        const c = ((seq * 3) % 11) + 2;
        if (section === 'test') {
          q = `Make x the subject of the formula: y = ${k}x − ${c}`;
          opts = uniqueOpts(`x = (y + ${c}) / ${k}`, [
            `x = (y − ${c}) / ${k}`,
            `x = ${k}y + ${c}`,
            `x = y/${k} + ${c}`,
          ]);
          explain = `9Ae.04: Add ${c} to both sides and divide by ${k}: x = (y + ${c}) / ${k}.`;
        } else {
          q = `Rearrange T = √(${k}x + ${c}) to make x the subject.`;
          opts = uniqueOpts(`x = (T² − ${c}) / ${k}`, [
            `x = (T² + ${c}) / ${k}`,
            `x = √(T − ${c}) / ${k}`,
            `x = (T − ${c})² / ${k}`,
          ]);
          explain = `9Ae.04: Square both sides: T² = ${k}x + ${c}, then subtract ${c} and divide by ${k}.`;
        }
      } else if (subType === 2) {
        const m = (seq % 8) + 2;
        const n = ((seq + 3) % 7) + 3;
        const valX = (seq % 5) + 2;
        const valY = ((seq + 1) % 4) + 2;
        if (section === 'test') {
          const ans = m * valX * valX + n * valY;
          q = `Evaluate ${m}x² + ${n}y when x = ${valX} and y = ${valY}.`;
          opts = uniqueOpts(`${ans}`, [
            `${(m * valX) ** 2 + n * valY}`,
            `${m * valX * 2 + n * valY}`,
            `${ans + m}`,
          ]);
          explain = `9Ae.01: Calculate x² first: ${valX}² = ${valX * valX}. Then ${m}×${valX * valX} + ${n}×${valY} = ${ans}.`;
        } else {
          const ans = m * valX * valX - n * valY;
          q = `Work out ${m}x² − ${n}y for x = −${valX} and y = ${valY}.`;
          opts = uniqueOpts(`${ans}`, [
            `${-m * valX * valX - n * valY}`,
            `${m * valX * 2 - n * valY}`,
            `${ans + 2 * n * valY}`,
          ]);
          explain = `9Ae.01: (−${valX})² = +${valX * valX}. Then ${m}×${valX * valX} − ${n}×${valY} = ${ans}.`;
        }
      } else {
        const a = (seq % 7) + 2;
        const b = ((seq * 2) % 9) + 3;
        if (section === 'test') {
          q = `Write an algebraic expression for: "Cube a number n, multiply by ${a}, then subtract ${b}."`;
          opts = uniqueOpts(`${a}n³ − ${b}`, [
            `(${a}n)³ − ${b}`,
            `${a}(n − ${b})³`,
            `${a}n² − ${b}`,
          ]);
          explain = `9Ae.03: Cube n → n³; multiply by ${a} → ${a}n³; subtract ${b} → ${a}n³ − ${b}.`;
        } else {
          q = `Simplify (${a * 3}x + ${b * 3}) / 3.`;
          opts = uniqueOpts(`${a}x + ${b}`, [
            `${a}x + ${b * 3}`,
            `${a * 3}x + ${b}`,
            `${a + b}x`,
          ]);
          explain = `9Ae.02: Divide both terms in the numerator by 3 to get ${a}x + ${b}.`;
        }
      }
      break;
    }

    // Topic 3: Linear and simultaneous equations (9Ae.05, 9Ae.06)
    case 3: {
      const subType = idx % 3;
      const seq = Math.floor(idx / 3) + 1;
      if (subType === 0) {
        const xVal = (seq % 12) + 2;
        const m = ((seq + 1) % 7) + 2;
        const c = ((seq * 3) % 15) + 3;
        const rhs = m * xVal + c;
        if (section === 'test') {
          q = `Solve for x: ${m}x + ${c} = ${rhs}`;
          opts = uniqueOpts(`x = ${xVal}`, [
            `x = ${xVal + 2}`,
            `x = ${Math.max(1, xVal - 1)}`,
            `x = ${xVal + m}`,
          ]);
          explain = `9Ae.05: ${m}x = ${rhs} − ${c} = ${m * xVal} ⇒ x = ${xVal}.`;
        } else {
          const rhsSub = m * xVal - c;
          q = `Find x if ${m}x − ${c} = ${rhsSub}.`;
          opts = uniqueOpts(`x = ${xVal}`, [
            `x = ${xVal + 1}`,
            `x = ${Math.max(1, xVal - 2)}`,
            `x = ${Math.abs(rhsSub)}`,
          ]);
          explain = `9Ae.05: Add ${c}: ${m}x = ${m * xVal} ⇒ x = ${xVal}.`;
        }
      } else if (subType === 1) {
        const xVal = (seq % 9) + 3;
        const shift = ((seq + 2) % 5) + 1;
        const mult = (seq % 6) + 2;
        if (section === 'test') {
          const denomVal = xVal + shift;
          const numer = mult * denomVal;
          q = `Solve the fractional equation: ${numer} / (x + ${shift}) = ${mult}`;
          opts = uniqueOpts(`x = ${xVal}`, [
            `x = ${denomVal}`,
            `x = ${xVal + mult}`,
            `x = ${Math.max(1, xVal - shift)}`,
          ]);
          explain = `9Ae.05: Multiply by (x + ${shift}): ${numer} = ${mult}(x + ${shift}) ⇒ x + ${shift} = ${denomVal} ⇒ x = ${xVal}.`;
        } else {
          const denomVal = xVal;
          const numer = mult * denomVal;
          q = `Solve: ${numer} / x + ${shift} = ${mult + shift}`;
          opts = uniqueOpts(`x = ${xVal}`, [
            `x = ${xVal + shift}`,
            `x = ${mult}`,
            `x = ${Math.max(1, xVal - 1)}`,
          ]);
          explain = `9Ae.05: Subtract ${shift}: ${numer}/x = ${mult} ⇒ x = ${numer} ÷ ${mult} = ${xVal}.`;
        }
      } else {
        const xVal = (seq % 10) + 3;
        const yVal = ((seq * 2) % 8) + 1;
        const coeffX = (seq % 4) + 2;
        if (section === 'test') {
          const eq1 = xVal + yVal;
          const eq2 = coeffX * xVal - yVal;
          q = `Solve simultaneously: x + y = ${eq1} and ${coeffX}x − y = ${eq2}`;
          opts = uniqueOpts(`x = ${xVal}, y = ${yVal}`, [
            `x = ${yVal}, y = ${xVal}`,
            `x = ${xVal + 1}, y = ${Math.max(0, yVal - 1)}`,
            `x = ${xVal}, y = ${yVal + 2}`,
          ]);
          explain = `9Ae.06: Adding both equations eliminates y: ${coeffX + 1}x = ${eq1 + eq2} ⇒ x = ${xVal}, y = ${yVal}.`;
        } else {
          const eq1 = coeffX * xVal + yVal;
          const eq2 = xVal + yVal;
          q = `Find the intersection (x, y) of the lines ${coeffX}x + y = ${eq1} and x + y = ${eq2}.`;
          opts = uniqueOpts(`(${xVal}, ${yVal})`, [
            `(${yVal}, ${xVal})`,
            `(${xVal + 1}, ${yVal})`,
            `(${xVal}, ${yVal + 1})`,
          ]);
          explain = `9Ae.06: Subtracting the equations gives ${coeffX - 1}x = ${eq1 - eq2} ⇒ x = ${xVal}, then y = ${eq2} − ${xVal} = ${yVal}.`;
        }
      }
      break;
    }

    // Topic 4: 2D shapes and measure (9Gg.01, 9Gg.02, 9Gg.03)
    case 4: {
      const subType = idx % 4;
      const seq = Math.floor(idx / 4) + 1;
      if (subType === 0) {
        const r = seq + 3;
        if (section === 'test') {
          q = `Find the exact area of a circle with radius r = ${r} cm in terms of π.`;
          opts = uniqueOpts(`${r * r}π cm²`, [
            `${2 * r}π cm²`,
            `${r}π cm²`,
            `${4 * r * r}π cm²`,
          ]);
          explain = `9Gg.01: A = πr² = π × ${r}² = ${r * r}π cm².`;
          diagram = { kind: 'circle', mode: 'r', valueLabel: `r = ${r} cm` };
        } else {
          const d = r * 2;
          q = `A circle has diameter d = ${d} cm. Find its exact circumference in terms of π.`;
          opts = uniqueOpts(`${d}π cm`, [
            `${r * r}π cm`,
            `${r}π cm`,
            `${2 * d}π cm`,
          ]);
          explain = `9Gg.01: C = πd = ${d}π cm.`;
          diagram = { kind: 'circle', mode: 'd', valueLabel: `d = ${d} cm` };
        }
      } else if (subType === 1) {
        const r = seq + 3;
        const d = r * 2;
        if (section === 'test') {
          const p = (3.14 * r + d).toFixed(2);
          q = `Calculate the total perimeter of a semicircle with diameter d = ${d} cm (use π ≈ 3.14).`;
          opts = uniqueOpts(`${p} cm`, [
            `${(3.14 * r).toFixed(2)} cm`,
            `${(3.14 * d).toFixed(2)} cm`,
            `${(3.14 * r + r).toFixed(2)} cm`,
          ]);
          explain = `9Gg.01: Semicircle perimeter = curved arc (πr) + straight diameter = 3.14×${r} + ${d} = ${p} cm.`;
          diagram = { kind: 'semicircle', mode: 'd', valueLabel: `d = ${d} cm` };
        } else {
          const areaSemi = (0.5 * r * r).toFixed(1).replace(/\.0$/, '');
          q = `Find the exact area of a semicircle with radius r = ${r} cm in terms of π.`;
          opts = uniqueOpts(`${areaSemi}π cm²`, [
            `${r * r}π cm²`,
            `${d}π cm²`,
            `${r}π cm²`,
          ]);
          explain = `9Gg.01: Semicircle area = ½πr² = ½ × ${r * r}π = ${areaSemi}π cm².`;
          diagram = { kind: 'semicircle', mode: 'r', valueLabel: `r = ${r} cm` };
        }
      } else if (subType === 2) {
        const w = (seq % 15) + 6;
        const h = ((seq * 3) % 12) + 5;
        const triH = ((seq + 2) % 8) + 2;
        if (section === 'test') {
          const area = w * h + (w * triH) / 2;
          q = `A compound 2D shape combines a ${w} cm × ${h} cm rectangle with a triangle of base ${w} cm and height ${triH} cm. Find total area.`;
          opts = uniqueOpts(`${area} cm²`, [
            `${w * h + w * triH} cm²`,
            `${w * h} cm²`,
            `${area + w} cm²`,
          ]);
          explain = `9Gg.03: Rectangle (${w}×${h} = ${w * h}) + Triangle (½×${w}×${triH} = ${(w * triH) / 2}) = ${area} cm².`;
          diagram = { kind: 'rect_tri', w, hRect: h, hTri: triH };
        } else {
          const cutW = Math.max(2, Math.floor(w / 2));
          const cutH = Math.max(2, Math.floor(h / 2));
          const area = w * h - cutW * cutH;
          q = `An L-shaped metal plate starts as a ${w} cm × ${h} cm rectangle with a ${cutW} cm × ${cutH} cm corner cut out. Find its area.`;
          opts = uniqueOpts(`${area} cm²`, [
            `${w * h + cutW * cutH} cm²`,
            `${w * h} cm²`,
            `${2 * (w + h)} cm²`,
          ]);
          explain = `9Gg.03: ${w}×${h} − ${cutW}×${cutH} = ${w * h} − ${cutW * cutH} = ${area} cm².`;
          diagram = { kind: 'lshape', outerW: w, outerH: h, cutW, cutH };
        }
      } else {
        const val = ((seq * 7) % 85) + 12;
        if (section === 'test') {
          const dec = (val / 10).toFixed(1);
          q = `Convert ${dec} mm into micrometres (μm).`;
          opts = uniqueOpts(`${(val * 100).toLocaleString('en-US')} μm`, [
            `${(val * 10).toLocaleString('en-US')} μm`,
            `${(val * 1000).toLocaleString('en-US')} μm`,
            `${(val / 100).toFixed(2)} μm`,
          ]);
          explain = `9Gg.02: 1 mm = 1,000 μm, so ${dec} × 1,000 = ${(val * 100).toLocaleString('en-US')} μm.`;
        } else {
          const dec = (val / 10).toFixed(1);
          q = `Convert ${dec} megametres (Mm) into kilometres (km).`;
          opts = uniqueOpts(`${(val * 100).toLocaleString('en-US')} km`, [
            `${(val * 10).toLocaleString('en-US')} km`,
            `${(val * 1000).toLocaleString('en-US')} km`,
            `${(val / 10).toFixed(2)} km`,
          ]);
          explain = `9Gg.02: 1 Mm = 1,000 km, so ${dec} × 1,000 = ${(val * 100).toLocaleString('en-US')} km.`;
        }
      }
      break;
    }

    // Topic 5: 3D shapes (9Gg.04, 9Gg.05, 9Gg.06)
    case 5: {
      const subType = idx % 4;
      const seq = Math.floor(idx / 4) + 1;
      if (subType === 0) {
        const s = (seq % 20) + 3;
        if (section === 'test') {
          q = `Find the volume of a cube whose side length is ${s} cm.`;
          opts = uniqueOpts(`${s ** 3} cm³`, [
            `${6 * s * s} cm³`,
            `${s * s} cm³`,
            `${12 * s} cm³`,
          ]);
          explain = `9Gg.04: Volume of a cube = s³ = ${s}³ = ${s ** 3} cm³.`;
          diagram = { kind: 'cube', sLabel: `${s} cm` };
        } else {
          const sa = 6 * s * s;
          q = `A cube has edge length ${s} cm. Find its total surface area.`;
          opts = uniqueOpts(`${sa} cm²`, [
            `${s ** 3} cm²`,
            `${4 * s * s} cm²`,
            `${12 * s} cm²`,
          ]);
          explain = `9Gg.05: Total surface area = 6s² = 6 × ${s * s} = ${sa} cm².`;
          diagram = { kind: 'cube', sLabel: `${s} cm` };
        }
      } else if (subType === 1) {
        const l = (seq % 11) + 4;
        const w = ((seq + 2) % 7) + 3;
        const h = ((seq * 2) % 6) + 2;
        if (section === 'test') {
          const vol = l * w * h;
          q = `A cuboid measures ${l} cm by ${w} cm by ${h} cm. Calculate its volume.`;
          opts = uniqueOpts(`${vol} cm³`, [
            `${2 * (l * w + l * h + w * h)} cm³`,
            `${l + w + h} cm³`,
            `${vol * 2} cm³`,
          ]);
          explain = `9Gg.04: V = l × w × h = ${l} × ${w} × ${h} = ${vol} cm³.`;
          diagram = { kind: 'cuboid', l, w, h };
        } else {
          const sa = 2 * (l * w + l * h + w * h);
          q = `Calculate the total surface area of a ${l} cm × ${w} cm × ${h} cm closed cuboid.`;
          opts = uniqueOpts(`${sa} cm²`, [
            `${l * w * h} cm²`,
            `${l * w + l * h + w * h} cm²`,
            `${sa + l * w} cm²`,
          ]);
          explain = `9Gg.05: SA = 2(lw + lh + wh) = 2(${l * w} + ${l * h} + ${w * h}) = ${sa} cm².`;
          diagram = { kind: 'cuboid', l, w, h };
        }
      } else if (subType === 2) {
        const r = (seq % 9) + 2;
        const h = ((seq * 3) % 11) + 4;
        if (section === 'test') {
          const coeff = r * r * h;
          q = `A cylinder has radius ${r} cm and height ${h} cm. Express its volume in terms of π.`;
          opts = uniqueOpts(`${coeff}π cm³`, [
            `${2 * r * h}π cm³`,
            `${r * h}π cm³`,
            `${2 * r * r + 2 * r * h}π cm³`,
          ]);
          explain = `9Gg.04: V = πr²h = π × ${r}² × ${h} = ${coeff}π cm³.`;
          diagram = { kind: 'cylinder', r, h };
        } else {
          const coeff = 2 * r * r + 2 * r * h;
          q = `A closed cylinder has radius ${r} cm and height ${h} cm. Find its total surface area in terms of π.`;
          opts = uniqueOpts(`${coeff}π cm²`, [
            `${2 * r * h}π cm²`,
            `${r * r * h}π cm²`,
            `${r * r + 2 * r * h}π cm²`,
          ]);
          explain = `9Gg.05: SA = 2πr² + 2πrh = ${2 * r * r}π + ${2 * r * h}π = ${coeff}π cm².`;
          diagram = { kind: 'cylinder', r, h };
        }
      } else {
        const b = ((seq % 8) + 3) * 2;
        const h = ((seq + 1) % 7) + 3;
        const len = ((seq * 2) % 9) + 5;
        const vol = (b * h * len) / 2;
        q =
          section === 'test'
            ? `A triangular prism has base ${b} cm, triangular height ${h} cm, and length ${len} cm. Find its volume.`
            : `Calculate the volume of a triangular prism of length ${len} cm whose triangular cross-section has base ${b} cm and height ${h} cm.`;
        opts = uniqueOpts(`${vol} cm³`, [
          `${b * h * len} cm³`,
          `${(b * h) / 2} cm³`,
          `${vol + len} cm³`,
        ]);
        explain = `9Gg.04: Cross-section = ½×${b}×${h} = ${(b * h) / 2} cm². Volume = ${(b * h) / 2} × ${len} = ${vol} cm³.`;
        diagram = { kind: 'tri_prism', b, h, len };
      }
      break;
    }

    // Topic 6: Pythagoras' theorem (9Gg.10, TWM.01, TWM.02)
    default: {
      const baseTriples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
        [9, 40, 41],
        [11, 60, 61],
        [12, 35, 37],
      ];
      const subType = idx % 3;
      const seq = Math.floor(idx / 3);
      const [ta, tb, tc] = baseTriples[seq % baseTriples.length];
      const scale = Math.floor(seq / baseTriples.length) + 1;
      const a = ta * scale;
      const b = tb * scale;
      const c = tc * scale;

      if (subType === 0) {
        if (section === 'test') {
          q = `A right-angled triangle has legs a = ${a} cm and b = ${b} cm. Find the hypotenuse c.`;
          opts = uniqueOpts(`${c} cm`, [`${c + 2} cm`, `${Math.max(1, c - 2)} cm`, `${a + b} cm`]);
          explain = `9Gg.10: c = √(${a}² + ${b}²) = √${c * c} = ${c} cm.`;
          diagram = { kind: 'right_tri', a: `${a} cm`, b: `${b} cm`, c: 'c = ?' };
        } else {
          q = `A right-angled triangle has hypotenuse c = ${c} cm and one leg a = ${a} cm. Find the missing leg b.`;
          opts = uniqueOpts(`${b} cm`, [`${c - a} cm`, `${b + 2} cm`, `${a + 1} cm`]);
          explain = `9Gg.10: b = √(${c}² − ${a}²) = √${b * b} = ${b} cm.`;
          diagram = { kind: 'right_tri', a: `${a} cm`, b: 'b = ?', c: `${c} cm` };
        }
      } else if (subType === 1) {
        if (section === 'test') {
          q = `A ${c} m ladder leans against a wall with its base ${a} m away. How high up the wall does it reach?`;
          opts = uniqueOpts(`${b} m`, [`${c - a} m`, `${b + 1} m`, `${Math.max(1, b - 1)} m`]);
          explain = `9Gg.10: h = √(${c}² − ${a}²) = √${b * b} = ${b} m.`;
          diagram = { kind: 'ladder', wall: 'h = ?', base: `${a} m`, len: `${c} m` };
        } else {
          q = `A rectangle has width ${a} cm and length ${b} cm. Find the length of its diagonal.`;
          opts = uniqueOpts(`${c} cm`, [`${a + b} cm`, `${c + 1} cm`, `${Math.max(1, c - 2)} cm`]);
          explain = `9Gg.10: Diagonal = √(${a}² + ${b}²) = ${c} cm.`;
          diagram = { kind: 'rect', w: b, h: a, unit: 'cm', diagonal: 'd = ?' };
        }
      } else {
        const x1 = (seq % 5) + 1;
        const y1 = ((seq + 2) % 4) + 1;
        const x2 = x1 + a;
        const y2 = y1 + b;
        if (section === 'test') {
          q = `Find the straight-line distance between A(${x1}, ${y1}) and B(${x2}, ${y2}) on a coordinate plane.`;
          opts = uniqueOpts(`${c} units`, [`${a + b} units`, `${c + 2} units`, `${Math.max(1, c - 1)} units`]);
          explain = `9Gg.10: Δx = ${a}, Δy = ${b}, so distance = √(${a}² + ${b}²) = ${c} units.`;
          diagram = { kind: 'coords', x1, y1, x2, y2 };
        } else {
          q = `TWM.01: A triangle has sides ${a} cm, ${b} cm, and ${c} cm. Why is it right-angled?`;
          opts = uniqueOpts(
            `Because ${a}² + ${b}² = ${a * a + b * b} = ${c}²`,
            [
              `Because ${a} + ${b} = ${c}`,
              `Because all sides are prime numbers`,
              `Because ${c} − ${b} = ${a}`,
            ]
          );
          explain = `TWM.01 / 9Gg.10: ${a}² + ${b}² = ${c}² satisfies the converse of Pythagoras' theorem.`;
          diagram = { kind: 'right_tri', a: `${a} cm`, b: `${b} cm`, c: `${c} cm`, showCheck: true };
        }
      }
      break;
    }
  }

  return {
    topic,
    difficulty,
    q,
    opts,
    answer: 0,
    explain,
    diagram,
  };
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function generateMathTestExtras(existingQuestions: QuestionItem[]): QuestionItem[] {
  const seen = new Set(existingQuestions.map((item) => (typeof item.q === 'string' ? item.q.trim() : item.q.en.trim())));
  const needed = Math.max(0, 500 - existingQuestions.length);
  const out: QuestionItem[] = [];
  const topicCounts = new Array(MATH_TOPICS.length).fill(0);
  let idCounter = 151;

  for (let i = 0; out.length < needed && i < 5000; i++) {
    const topicIndex = i % MATH_TOPICS.length;
    const k = topicCounts[topicIndex]++;
    const built = buildMathProblem(topicIndex, k, 'test');
    const stem = (typeof built.q === 'string' ? built.q : built.q.en).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    out.push({
      id: `m_t_${idCounter++}`,
      ...built,
    });
  }
  return out;
}

export function generateMathExamBank(testQuestions: QuestionItem[]): QuestionItem[] {
  const seen = new Set(testQuestions.map((item) => (typeof item.q === 'string' ? item.q.trim() : item.q.en.trim())));
  const out: QuestionItem[] = [];
  const topicCounts = new Array(MATH_TOPICS.length).fill(0);
  let idCounter = 1;
  let guard = 0;

  while (out.length < 500 && guard++ < 5000) {
    const topicIndex = out.length % MATH_TOPICS.length;
    const k = topicCounts[topicIndex]++;
    const built = buildMathProblem(topicIndex, k, 'exam');
    const stem = (typeof built.q === 'string' ? built.q : built.q.en).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    out.push({
      id: `m_e_${idCounter++}`,
      ...built,
    });
  }
  return out;
}
