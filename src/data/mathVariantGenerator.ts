import { DifficultyLevel, MathDiagramSpec, QuestionItem } from '../types/quiz';

const T1 = 'Unit 9.1 · Topic 1: Indices and standard form';
const T2 = 'Unit 9.1 · Topic 2: The number system';
const T3 = 'Unit 9.2 · Topic 1: Manipulating algebra, expressions and formulae';
const T4 = 'Unit 9.2 · Topic 2: Linear and simultaneous equations';
const T5 = 'Unit 9.3 · Topic 1: 2D shapes and measure';
const T6 = 'Unit 9.3 · Topic 2: 3D shapes';
const T7 = "Unit 9.3 · Topic 3: Pythagoras' theorem";

const SUP_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  '−': '⁻',
};

function sup(n: number): string {
  return String(n)
    .split('')
    .map((ch) => SUP_MAP[ch] ?? ch)
    .join('');
}

function uniqueOpts(correct: string, candidates: string[]): string[] {
  const out = [correct];
  const seen = new Set<string>([correct]);
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
    if (out.length === 4) break;
  }
  let fallbackIdx = 1;
  while (out.length < 4) {
    const candidate = `${correct} (${fallbackIdx++})`;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
    }
  }
  return out;
}

function signed(n: number): string {
  return n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
}

function qItem(
  id: string,
  topic: string,
  difficulty: DifficultyLevel,
  q: string,
  correct: string,
  distractors: string[],
  explain: string,
  diagram?: MathDiagramSpec
): QuestionItem {
  return {
    id,
    topic,
    difficulty,
    q,
    opts: uniqueOpts(correct, distractors),
    answer: 0,
    explain,
    ...(diagram ? { diagram } : {}),
  };
}

// ---------- EASY VARIANTS 3..20 (k = 0..17 -> 18 * 25 = 450 distinct Easy questions) ----------
function buildEasyVariant(vIdx: number): QuestionItem[] {
  // vIdx = 0..17 (Variant 3..20)
  const vNum = vIdx + 3;
  const p = `mv_e_${vNum}_`;
  const list: QuestionItem[] = [];

  // Shared prime/number tables with >= 18 distinct combinations
  const bases = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 2, 3, 5, 6, 7, 8, 9];
  const b1 = bases[vIdx];
  const e1 = 2 + (vIdx % 5);
  const e2 = 3 + ((vIdx + 2) % 6);
  const e3 = 2 + ((vIdx + 4) % 4);

  // T1 (4 questions)
  // E-T1-1: Product/Quotient index law
  if (vIdx % 2 === 0) {
    const sumExp = e1 + e2 + e3;
    list.push(
      qItem(
        `${p}1`,
        T1,
        'easy',
        `Simplify ${b1}${sup(e1)} × ${b1}${sup(e2)} × ${b1}${sup(e3)} using the index laws.`,
        `${b1}${sup(sumExp)}`,
        [`${b1}${sup(e1 * e2)}`, `${b1 * b1}${sup(sumExp)}`, `${b1}${sup(sumExp - 2)}`],
        `9Ni.02: Add the indices for the same base ${b1}: ${e1} + ${e2} + ${e3} = ${sumExp}.`
      )
    );
  } else {
    const topExp = e1 + e2 + 3;
    const resExp = topExp - e3;
    list.push(
      qItem(
        `${p}1`,
        T1,
        'easy',
        `Simplify ${b1}${sup(topExp)} ÷ ${b1}${sup(e3)}.`,
        `${b1}${sup(resExp)}`,
        [`${b1}${sup(topExp + e3)}`, `${b1}${sup(resExp + 2)}`, `1${sup(resExp)}`],
        `9Ni.02: Subtract the indices when dividing like bases: ${topExp} − ${e3} = ${resExp}.`
      )
    );
  }

  // E-T1-2: Zero & negative indices
  const zBase = 11 + vIdx;
  const powBase = 2 + (vIdx % 3);
  const powExp = 3 + (vIdx % 3);
  const ansVal = 1 + Math.pow(powBase, powExp);
  list.push(
    qItem(
      `${p}2`,
      T1,
      'easy',
      `Evaluate ${zBase}⁰ + ${powBase}${sup(powExp)}.`,
      `${ansVal}`,
      [`${ansVal - 1}`, `${zBase + Math.pow(powBase, powExp)}`, `${ansVal + 2}`],
      `9Ni.02: ${zBase}⁰ = 1 and ${powBase}${sup(powExp)} = ${Math.pow(powBase, powExp)}, so 1 + ${Math.pow(powBase, powExp)} = ${ansVal}.`
    )
  );

  // E-T1-3: Standard form conversion (large or small)
  const leadA = 1 + (vIdx % 8);
  const leadB = 1 + ((vIdx * 3 + 2) % 9);
  const mantissa = `${leadA}.${leadB}`;
  if (vIdx % 2 === 0) {
    const power = 3 + (vIdx % 4);
    const numVal = Math.round(Number(mantissa) * Math.pow(10, power)).toLocaleString('en-US');
    list.push(
      qItem(
        `${p}3`,
        T1,
        'easy',
        `Write ${numVal} in standard form.`,
        `${mantissa} × 10${sup(power)}`,
        [
          `${leadA}${leadB} × 10${sup(power - 1)}`,
          `${mantissa} × 10${sup(power - 1)}`,
          `0.${leadA}${leadB} × 10${sup(power + 1)}`,
        ],
        `9Ni.03: Shift the decimal point ${power} places left so 1 ≤ A < 10: ${mantissa} × 10${sup(power)}.`
      )
    );
  } else {
    const power = 2 + (vIdx % 4);
    const zeros = '0'.repeat(power - 1);
    const decStr = `0.${zeros}${leadA}${leadB}`;
    list.push(
      qItem(
        `${p}3`,
        T1,
        'easy',
        `Write ${decStr} in standard form.`,
        `${mantissa} × 10${sup(-power)}`,
        [
          `${mantissa} × 10${sup(power)}`,
          `${leadA}${leadB} × 10${sup(-power)}`,
          `${mantissa} × 10${sup(-(power + 1))}`,
        ],
        `9Ni.03: Move the decimal point ${power} places right to get ${mantissa}, giving 10${sup(-power)}.`
      )
    );
  }

  // E-T1-4: Negative power as fraction or power of 10 division
  const negBases = [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 3, 4, 5, 6, 7, 8, 9, 12];
  const nb = negBases[vIdx];
  const ne = vIdx < 10 ? 2 : 3;
  const denom = Math.pow(nb, ne);
  list.push(
    qItem(
      `${p}4`,
      T1,
      'easy',
      `Write ${nb}${sup(-ne)} as a fraction in simplest form.`,
      `1/${denom}`,
      [`−${denom}`, `1/${nb * ne}`, `−1/${denom}`],
      `9Ni.02: a${sup(-ne)} = 1 / a${sup(ne)} = 1/${denom}.`
    )
  );

  // T2: The number system (4 questions)
  // E-T2-1: Surd bounding (square root)
  const sqRoots = [10, 11, 13, 14, 15, 18, 20, 22, 27, 31, 33, 38, 42, 46, 52, 58, 68, 74];
  const sr = sqRoots[vIdx];
  const lo = Math.floor(Math.sqrt(sr));
  const hi = lo + 1;
  list.push(
    qItem(
      `${p}5`,
      T2,
      'easy',
      `Between which two consecutive integers does √${sr} lie?`,
      `${lo} and ${hi}`,
      [`${lo - 1} and ${lo}`, `${hi} and ${hi + 1}`, `${lo + 2} and ${lo + 3}`],
      `9Ni.04: ${lo}² = ${lo * lo} < ${sr} < ${hi * hi} = ${hi}², so ${lo} < √${sr} < ${hi}.`
    )
  );

  // E-T2-2: Cube root bounding
  const cbRoots = [12, 15, 20, 24, 32, 38, 45, 55, 70, 82, 95, 110, 135, 150, 175, 200, 230, 260];
  const cr = cbRoots[vIdx];
  const clo = Math.floor(Math.cbrt(cr));
  const chi = clo + 1;
  list.push(
    qItem(
      `${p}6`,
      T2,
      'easy',
      `Estimate ∛${cr} by identifying the two consecutive integers it lies between.`,
      `${clo} and ${chi}`,
      [`${clo - 1} and ${clo}`, `${chi} and ${chi + 1}`, `${clo + 3} and ${clo + 4}`],
      `9Ni.04: ${clo}³ = ${clo ** 3} < ${cr} < ${chi ** 3} = ${chi}³, so ${clo} < ∛${cr} < ${chi}.`
    )
  );

  // E-T2-3: Terminating vs recurring decimal
  const termFracs: [string, string][] = [
    ['3/8', '2³ (only 2s)'],
    ['7/20', '2² × 5 (only 2s and 5s)'],
    ['9/25', '5² (only 5s)'],
    ['11/40', '2³ × 5 (only 2s and 5s)'],
    ['3/16', '2⁴ (only 2s)'],
    ['13/50', '2 × 5² (only 2s and 5s)'],
    ['17/20', '2² × 5 (only 2s and 5s)'],
    ['7/8', '2³ (only 2s)'],
    ['9/40', '2³ × 5 (only 2s and 5s)'],
    ['1/8', '2³ (only 2s)'],
    ['19/25', '5² (only 5s)'],
    ['21/40', '2³ × 5 (only 2s and 5s)'],
    ['5/16', '2⁴ (only 2s)'],
    ['27/50', '2 × 5² (only 2s and 5s)'],
    ['3/4', '2² (only 2s)'],
    ['11/25', '5² (only 5s)'],
    ['29/40', '2³ × 5 (only 2s and 5s)'],
    ['7/16', '2⁴ (only 2s)'],
  ];
  const recPool = ['2/3', '5/6', '4/7', '5/9', '7/11', '5/12', '2/7', '8/15'];
  const [tFrac, tExp] = termFracs[vIdx];
  const r1 = recPool[vIdx % recPool.length];
  const r2 = recPool[(vIdx + 2) % recPool.length];
  const r3 = recPool[(vIdx + 4) % recPool.length];
  const termShown = [tFrac, r1, r2, r3];
  const termRot = vIdx % 4;
  const termOrdered = [...termShown.slice(termRot), ...termShown.slice(0, termRot)];
  list.push(
    qItem(
      `${p}7`,
      T2,
      'easy',
      `Which of these simplified fractions (${termOrdered.join(', ')}) produces a terminating decimal?`,
      tFrac,
      [r1, r2, r3],
      `9Nf.01: In ${tFrac}, the denominator factors into ${tExp}, so its decimal terminates.`
    )
  );

  // E-T2-4: Rational vs irrational identification
  const irrationals = ['√5', '√7', '√11', '√13', '√17', '√19', '√21', '√23', '√29', '√31', '√37', '√41', '√43', '√47', '√53', '√59', '√61', '√67'];
  const rats = [
    ['√16', '4'],
    ['√25', '5'],
    ['√36', '6'],
    ['√49', '7'],
    ['√64', '8'],
    ['√81', '9'],
    ['√100', '10'],
    ['√121', '11'],
    ['√144', '12'],
    ['√9', '3'],
    ['√169', '13'],
    ['√196', '14'],
    ['√225', '15'],
    ['√256', '16'],
    ['√289', '17'],
    ['√324', '18'],
    ['√361', '19'],
    ['√400', '20'],
  ];
  const irr = irrationals[vIdx];
  const [sqSym, sqVal] = rats[vIdx];
  const decRat = `${(0.25 + (vIdx % 5) * 0.1).toFixed(2)}`;
  const fracRat = `${vIdx + 2}/${vIdx + 5}`;
  const ratShown = [irr, sqSym, decRat, fracRat];
  const ratRot = (vIdx + 1) % 4;
  const ratOrdered = [...ratShown.slice(ratRot), ...ratShown.slice(0, ratRot)];
  list.push(
    qItem(
      `${p}8`,
      T2,
      'easy',
      `Which of the following numbers is irrational: ${ratOrdered.join(', ')}?`,
      irr,
      [sqSym, decRat, fracRat],
      `9Ni.01: ${sqSym} = ${sqVal} (rational), ${decRat} and ${fracRat} are rational; ${irr} is not a square of a rational number.`
    )
  );

  // T3: Manipulating algebra, expressions and formulae (4 questions)
  // E-T3-1: Evaluate expression with BIDMAS
  const xVal = 2 + (vIdx % 6);
  const yVal = 3 + Math.floor(vIdx / 6);
  const cA = 2 + (vIdx % 3);
  const cB = 1 + ((vIdx + 1) % 3);
  const evalAns = cA * xVal * xVal + cB * yVal;
  list.push(
    qItem(
      `${p}9`,
      T3,
      'easy',
      `Calculate ${cA}x² + ${cB}y when x = ${xVal} and y = ${yVal}.`,
      `${evalAns}`,
      [
        `${(cA * xVal) ** 2 + cB * yVal}`,
        `${cA * xVal + cB * yVal}`,
        `${evalAns + cA * xVal}`,
      ],
      `9Ae.01: Compute powers first: x² = ${xVal * xVal}, then ${cA}(${xVal * xVal}) + ${cB}(${yVal}) = ${cA * xVal * xVal} + ${cB * yVal} = ${evalAns}.`
    )
  );

  // E-T3-2: Expand single bracket
  const kM = 2 + (vIdx % 5);
  const mX = 2 + ((vIdx + 1) % 4);
  const mC = 3 + (vIdx % 6);
  list.push(
    qItem(
      `${p}10`,
      T3,
      'easy',
      `Expand and simplify: ${kM}(${mX}x − ${mC})`,
      `${kM * mX}x − ${kM * mC}`,
      [`${kM * mX}x − ${mC}`, `${kM + mX}x − ${kM * mC}`, `${kM * mX}x + ${kM * mC}`],
      `9Ae.02: Multiply each term inside by ${kM}: ${kM}×${mX}x = ${kM * mX}x and ${kM}×(−${mC}) = −${kM * mC}.`
    )
  );

  // E-T3-3: Words to algebraic expression
  const nTimes = 3 + (vIdx % 5);
  const addConst = 4 + ((vIdx * 2) % 9);
  list.push(
    qItem(
      `${p}11`,
      T3,
      'easy',
      `Write an algebraic expression for: "Multiply a number n by ${nTimes}, then subtract ${addConst}, and finally divide the result by 2."`,
      `(${nTimes}n − ${addConst}) / 2`,
      [`${nTimes}n − ${addConst} / 2`, `${nTimes}(n − ${addConst}) / 2`, `(n + ${addConst}) / ${nTimes}`],
      `9Ae.03: Multiplying gives ${nTimes}n, subtracting ${addConst} gives ${nTimes}n − ${addConst}, and dividing the whole expression by 2 gives (${nTimes}n − ${addConst}) / 2.`
    )
  );

  // E-T3-4: Rearranging linear formula
  const coeffA = 2 + (vIdx % 5);
  const shiftB = 3 + ((vIdx + 2) % 7);
  list.push(
    qItem(
      `${p}12`,
      T3,
      'easy',
      `Make x the subject of y = ${coeffA}x ${signed(shiftB)}.`,
      `x = (y − ${shiftB}) / ${coeffA}`,
      [
        `x = (y + ${shiftB}) / ${coeffA}`,
        `x = y / ${coeffA} − ${shiftB}`,
        `x = ${coeffA}(y − ${shiftB})`,
      ],
      `9Ae.04: Subtract ${shiftB} from both sides (y − ${shiftB} = ${coeffA}x) and divide by ${coeffA}.`
    )
  );

  // T4: Linear & simultaneous equations (3 questions)
  // E-T4-1: Equation with unknown in denominator
  const xSol = 2 + (vIdx % 7);
  const cVal = 3 + (vIdx % 4);
  const bAdd = 1 + ((vIdx + 2) % 5);
  const topNum = cVal * (xSol + bAdd);
  list.push(
    qItem(
      `${p}13`,
      T4,
      'easy',
      `Solve the equation: ${topNum} / (x + ${bAdd}) = ${cVal}`,
      `x = ${xSol}`,
      [`x = ${xSol + bAdd}`, `x = ${xSol + 2}`, `x = ${Math.max(1, xSol - 1)}`],
      `9Ae.05: Multiply by (x + ${bAdd}): ${topNum} = ${cVal}(x + ${bAdd}) ⇒ x + ${bAdd} = ${xSol + bAdd} ⇒ x = ${xSol}.`
    )
  );

  // E-T4-2: Simple simultaneous sum/difference
  const sx = 4 + vIdx;
  const sy = 2 + (vIdx % 5);
  const sumXY = sx + sy;
  const diffXY = sx - sy;
  list.push(
    qItem(
      `${p}14`,
      T4,
      'easy',
      `Solve the simultaneous equations: x + y = ${sumXY} and x − y = ${diffXY}.`,
      `x = ${sx}, y = ${sy}`,
      [
        `x = ${sy}, y = ${sx}`,
        `x = ${sx + 1}, y = ${sy - 1}`,
        `x = ${sx - 1}, y = ${sy + 1}`,
      ],
      `9Ae.06: Adding gives 2x = ${2 * sx} ⇒ x = ${sx}, then y = ${sumXY} − ${sx} = ${sy}.`
    )
  );

  // E-T4-3: Intersection with vertical line or substitution
  const mGrad = 2 + (vIdx % 3);
  const cInt = 1 + ((vIdx * 2) % 7);
  const xLine = 2 + (vIdx % 5);
  const yInt = mGrad * xLine + cInt;
  list.push(
    qItem(
      `${p}15`,
      T4,
      'easy',
      `Where do the lines y = ${mGrad}x + ${cInt} and x = ${xLine} intersect?`,
      `(${xLine}, ${yInt})`,
      [`(${yInt}, ${xLine})`, `(${xLine}, ${yInt + mGrad})`, `(${xLine + 1}, ${yInt})`],
      `9Ae.06: Substitute x = ${xLine} into y = ${mGrad}x + ${cInt}: y = ${mGrad}(${xLine}) + ${cInt} = ${yInt}.`
    )
  );

  // T5: 2D shapes & measure (4 questions, WITH DIAGRAMS)
  // E-T5-1: Circle area/circumference
  const radC = 4 + (vIdx % 9);
  if (vIdx % 2 === 0) {
    list.push(
      qItem(
        `${p}16`,
        T5,
        'easy',
        `A circle has radius ${radC} cm. What is its area in terms of π?`,
        `${radC * radC}π cm²`,
        [`${2 * radC}π cm²`, `${radC}π cm²`, `${4 * radC}π cm²`],
        `9Gg.01: A = πr² = π × ${radC}² = ${radC * radC}π cm².`,
        { kind: 'circle', mode: 'r', valueLabel: `${radC} cm` }
      )
    );
  } else {
    const diamC = radC * 2;
    list.push(
      qItem(
        `${p}16`,
        T5,
        'easy',
        `A circle has diameter ${diamC} cm. What is its circumference in terms of π?`,
        `${diamC}π cm`,
        [`${radC * radC}π cm`, `${radC}π cm`, `${diamC * 2}π cm`],
        `9Gg.01: C = πd = ${diamC}π cm.`,
        { kind: 'circle', mode: 'd', valueLabel: `${diamC} cm` }
      )
    );
  }

  // E-T5-2: Semicircle perimeter
  const semiR = 3 + vIdx;
  list.push(
    qItem(
      `${p}17`,
      T5,
      'easy',
      `Find the total perimeter of a closed semicircle with radius ${semiR} cm in terms of π.`,
      `(${semiR}π + ${2 * semiR}) cm`,
      [`${semiR}π cm`, `(${2 * semiR}π + ${2 * semiR}) cm`, `(${semiR}π + ${semiR}) cm`],
      `9Gg.01: Curved arc = πr = ${semiR}π cm; straight diameter = 2r = ${2 * semiR} cm. Total = (${semiR}π + ${2 * semiR}) cm.`,
      { kind: 'semicircle', mode: 'r', valueLabel: `${semiR} cm` }
    )
  );

  // E-T5-3: Metric micro/mega unit conversion
  const mmLen = 1.5 + vIdx * 0.5;
  const umLen = Math.round(mmLen * 1000);
  list.push(
    qItem(
      `${p}18`,
      T5,
      'easy',
      `Convert ${mmLen} millimetres (mm) into micrometres (μm).`,
      `${umLen.toLocaleString('en-US')} μm`,
      [
        `${Math.round(mmLen * 100).toLocaleString('en-US')} μm`,
        `${Math.round(mmLen * 10000).toLocaleString('en-US')} μm`,
        `${(mmLen / 1000).toFixed(4)} μm`,
      ],
      `9Gg.02: 1 mm = 1,000 μm, so ${mmLen} × 1,000 = ${umLen.toLocaleString('en-US')} μm.`
    )
  );

  // E-T5-4: Compound L-shape area (WITH DIAGRAM)
  const oW = 10 + (vIdx % 5);
  const oH = 8 + (vIdx % 4);
  const cW = 3 + (vIdx % 3);
  const cH = 2 + (vIdx % 3);
  const lArea = oW * oH - cW * cH;
  list.push(
    qItem(
      `${p}19`,
      T5,
      'easy',
      `An L-shape is made by cutting a ${cW} cm × ${cH} cm rectangle from the corner of a ${oW} cm × ${oH} cm rectangle. Find its area.`,
      `${lArea} cm²`,
      [`${oW * oH} cm²`, `${oW * oH + cW * cH} cm²`, `${lArea - cW} cm²`],
      `9Gg.03: Full rectangle = ${oW} × ${oH} = ${oW * oH} cm². Cutout = ${cW} × ${cH} = ${cW * cH} cm². Remaining = ${lArea} cm².`,
      { kind: 'lshape', outerW: oW, outerH: oH, cutW: cW, cutH: cH }
    )
  );

  // T6: 3D shapes (3 questions, ALL WITH DIAGRAMS)
  // E-T6-1: Cube volume or surface area
  const cubeS = 3 + Math.floor(vIdx / 2);
  if (vIdx % 2 === 0) {
    const vol = cubeS ** 3;
    list.push(
      qItem(
        `${p}20`,
        T6,
        'easy',
        `Calculate the volume of a cube with side length ${cubeS} cm.`,
        `${vol} cm³`,
        [`${6 * cubeS * cubeS} cm³`, `${cubeS * cubeS} cm³`, `${12 * cubeS} cm³`],
        `9Gg.04: Volume = s³ = ${cubeS}³ = ${vol} cm³.`,
        { kind: 'cube', sLabel: `${cubeS} cm` }
      )
    );
  } else {
    const sa = 6 * cubeS * cubeS;
    list.push(
      qItem(
        `${p}20`,
        T6,
        'easy',
        `Calculate the total surface area of a cube with side length ${cubeS} cm.`,
        `${sa} cm²`,
        [`${cubeS ** 3} cm²`, `${4 * cubeS * cubeS} cm²`, `${cubeS * cubeS} cm²`],
        `9Gg.05: A cube has 6 faces of area ${cubeS}² = ${cubeS * cubeS} cm²: 6 × ${cubeS * cubeS} = ${sa} cm².`,
        { kind: 'cube', sLabel: `${cubeS} cm` }
      )
    );
  }

  // E-T6-2: Cuboid volume or surface area
  const cL = 5 + (vIdx % 5);
  const cW2 = 3 + (vIdx % 3);
  const cH2 = 2 + ((vIdx + 1) % 4);
  if (vIdx % 2 === 0) {
    const cSA = 2 * (cL * cW2 + cL * cH2 + cW2 * cH2);
    list.push(
      qItem(
        `${p}21`,
        T6,
        'easy',
        `Find the total surface area of a cuboid measuring ${cL} cm × ${cW2} cm × ${cH2} cm.`,
        `${cSA} cm²`,
        [`${cL * cW2 * cH2} cm²`, `${cSA / 2} cm²`, `${4 * (cL + cW2 + cH2)} cm²`],
        `9Gg.05: SA = 2(${cL}×${cW2} + ${cL}×${cH2} + ${cW2}×${cH2}) = ${cSA} cm².`,
        { kind: 'cuboid', l: cL, w: cW2, h: cH2 }
      )
    );
  } else {
    const cVol = cL * cW2 * cH2;
    list.push(
      qItem(
        `${p}21`,
        T6,
        'easy',
        `Find the volume of a cuboid measuring ${cL} cm × ${cW2} cm × ${cH2} cm.`,
        `${cVol} cm³`,
        [
          `${2 * (cL * cW2 + cL * cH2 + cW2 * cH2)} cm³`,
          `${cL * cW2 + cH2} cm³`,
          `${cVol + cL * cW2} cm³`,
        ],
        `9Gg.04: V = ${cL} × ${cW2} × ${cH2} = ${cVol} cm³.`,
        { kind: 'cuboid', l: cL, w: cW2, h: cH2 }
      )
    );
  }

  // E-T6-3: Triangular prism volume
  const tpB = 4 + (vIdx % 5);
  const tpH = 3 + ((vIdx + 1) % 4);
  const tpLen = 8 + (vIdx % 6);
  const tpVol = (tpB * tpH * tpLen) / 2;
  list.push(
    qItem(
      `${p}22`,
      T6,
      'easy',
      `A triangular prism has a right-angled triangle base (base ${tpB} cm, height ${tpH} cm) and length ${tpLen} cm. Find its volume.`,
      `${tpVol} cm³`,
      [`${tpB * tpH * tpLen} cm³`, `${tpB * tpH} cm³`, `${tpVol + tpLen} cm³`],
      `9Gg.04: Cross-section = ½ × ${tpB} × ${tpH} = ${(tpB * tpH) / 2} cm². Volume = ${(tpB * tpH) / 2} × ${tpLen} = ${tpVol} cm³.`,
      { kind: 'tri_prism', b: tpB, h: tpH, len: tpLen }
    )
  );

  // T7: Pythagoras' theorem (3 questions, ALL WITH DIAGRAMS)
  const triples: [number, number, number][] = [
    [6, 8, 10],
    [9, 12, 15],
    [12, 16, 20],
    [15, 20, 25],
    [10, 24, 26],
    [15, 36, 39],
    [8, 15, 17],
    [16, 30, 34],
    [7, 24, 25],
    [14, 48, 50],
    [20, 21, 29],
    [12, 35, 37],
    [18, 24, 30],
    [21, 28, 35],
    [24, 32, 40],
    [27, 36, 45],
    [20, 48, 52],
    [24, 45, 51],
  ];
  const [ta, tb, tc] = triples[vIdx];

  // E-T7-1: Find hypotenuse
  list.push(
    qItem(
      `${p}23`,
      T7,
      'easy',
      `A right-angled triangle has legs of ${ta} cm and ${tb} cm. Find the hypotenuse.`,
      `${tc} cm`,
      [`${ta + tb} cm`, `${tb + 2} cm`, `${tc + 4} cm`],
      `9Gg.10: c = √(${ta}² + ${tb}²) = √(${ta * ta} + ${tb * tb}) = √${tc * tc} = ${tc} cm.`,
      { kind: 'right_tri', a: `${ta} cm`, b: `${tb} cm`, c: 'c = ?' }
    )
  );

  // E-T7-2: Find missing leg (reverse triple rotated)
  const [la, lb, lc] = triples[(vIdx + 5) % triples.length];
  list.push(
    qItem(
      `${p}24`,
      T7,
      'easy',
      `A right-angled triangle has hypotenuse ${lc} cm and one leg ${la} cm. Find the other leg.`,
      `${lb} cm`,
      [`${lc - la} cm`, `${lc + la} cm`, `${lb + 3} cm`],
      `9Gg.10: b = √(${lc}² − ${la}²) = √(${lc * lc} − ${la * la}) = √${lb * lb} = ${lb} cm.`,
      { kind: 'right_tri', a: `${la} cm`, b: 'b = ?', c: `${lc} cm` }
    )
  );

  // E-T7-3: Rectangle diagonal
  const [ra, rb, rc] = triples[(vIdx + 10) % triples.length];
  list.push(
    qItem(
      `${p}25`,
      T7,
      'easy',
      `A rectangle is ${rb} cm long and ${ra} cm wide. Calculate the length of its diagonal.`,
      `${rc} cm`,
      [`${ra + rb} cm`, `${rc + 2} cm`, `${rb + 1} cm`],
      `9Gg.10: Diagonal = √(${rb}² + ${ra}²) = √${rc * rc} = ${rc} cm.`,
      { kind: 'rect', w: rb, h: ra, diagonal: '?' }
    )
  );

  return list;
}

// ---------- MEDIUM VARIANTS 3..20 (k = 0..17 -> 18 * 25 = 450 distinct Medium questions) ----------
function buildMediumVariant(vIdx: number): QuestionItem[] {
  const vNum = vIdx + 3;
  const p = `mv_m_${vNum}_`;
  const list: QuestionItem[] = [];

  // T1 (4 questions)
  // M-T1-1: Power of a power divided by power
  const baseM = 2 + (vIdx % 7);
  const p1 = 3 + (vIdx % 3);
  const p2 = 2 + ((vIdx + 1) % 3);
  const p3 = 2 + (vIdx % 4);
  const resP = p1 * p2 - p3;
  list.push(
    qItem(
      `${p}1`,
      T1,
      'medium',
      `Simplify (${baseM}${sup(p1)})${sup(p2)} ÷ ${baseM}${sup(p3)}.`,
      `${baseM}${sup(resP)}`,
      [`${baseM}${sup(p1 + p2 - p3)}`, `${baseM}${sup(p1 * p2 + p3)}`, `${baseM}${sup(resP - 1)}`],
      `9Ni.02: (${baseM}${sup(p1)})${sup(p2)} = ${baseM}${sup(p1 * p2)}, then ${p1 * p2} − ${p3} = ${resP}.`
    )
  );

  // M-T1-2: Power of algebraic product (kx^a)^b
  const kBase = 2 + (vIdx % 5);
  const xPow = 2 + Math.floor(vIdx / 5);
  const outPow = vIdx % 2 === 0 ? 2 : 3;
  const kAns = Math.pow(kBase, outPow);
  const xAnsPow = xPow * outPow;
  list.push(
    qItem(
      `${p}2`,
      T1,
      'medium',
      `Expand and simplify (${kBase}x${sup(xPow)})${sup(outPow)}.`,
      `${kAns}x${sup(xAnsPow)}`,
      [
        `${kBase * outPow}x${sup(xAnsPow)}`,
        `${kAns}x${sup(xPow + outPow)}`,
        `${kBase}x${sup(xAnsPow)}`,
      ],
      `9Ni.02 / 9Ae.02: Raise both coefficient and variable: ${kBase}${sup(outPow)} = ${kAns} and (x${sup(xPow)})${sup(outPow)} = x${sup(xAnsPow)}.`
    )
  );

  // M-T1-3: Multiply two numbers in standard form
  const sfPairs: [number, number][] = [
    [2, 3], [2.5, 4], [3, 4], [4, 5], [1.5, 4], [2, 4.5],
    [3, 5], [2.5, 6], [4, 6], [5, 3], [6, 2.5], [3.5, 4],
    [2, 3.5], [1.5, 6], [4, 4], [5, 5], [6, 3], [7, 2],
  ];
  const [mA, mB] = sfPairs[vIdx];
  const eA = 3 + (vIdx % 4);
  const eB = 2 + ((vIdx + 1) % 4);
  const rawProd = Number((mA * mB).toFixed(4));
  const normA = rawProd >= 10 ? Number((rawProd / 10).toFixed(4)) : rawProd;
  const normE = rawProd >= 10 ? eA + eB + 1 : eA + eB;
  list.push(
    qItem(
      `${p}3`,
      T1,
      'medium',
      `Calculate (${mA} × 10${sup(eA)}) × (${mB} × 10${sup(eB)}) in standard form.`,
      `${normA} × 10${sup(normE)}`,
      [
        `${rawProd >= 10 ? rawProd : Number((normA * 10).toFixed(2))} × 10${sup(eA + eB)}`,
        `${normA} × 10${sup(eA * eB)}`,
        `${normA} × 10${sup(normE - 1)}`,
      ],
      `9Ni.03: ${mA} × ${mB} = ${rawProd}, powers add to ${eA + eB}. Rewriting in standard form gives ${normA} × 10${sup(normE)}.`
    )
  );

  // M-T1-4: Simplify algebraic fraction by factorising
  const facK = 2 + (vIdx % 5);
  const facB = 2 + ((vIdx + 2) % 6);
  list.push(
    qItem(
      `${p}4`,
      T1,
      'medium',
      `Simplify (${facK}x² + ${facK * facB}x) / (${facK}x) for x ≠ 0.`,
      `x + ${facB}`,
      [`x + ${facK * facB}`, `${facK}x + ${facB}`, `x² + ${facB}`],
      `9Ae.02: Factorise the numerator as ${facK}x(x + ${facB}) and cancel ${facK}x to get x + ${facB}.`
    )
  );

  // T2: The number system (4 questions)
  // M-T2-1: 1-d.p. approximation of sqrt
  const nearSq = [
    [10, '3.2'], [11, '3.3'], [15, '3.9'], [18, '4.2'], [23, '4.8'], [27, '5.2'],
    [34, '5.8'], [39, '6.2'], [47, '6.9'], [52, '7.2'], [62, '7.9'], [67, '8.2'],
    [78, '8.8'], [84, '9.2'], [97, '9.8'], [104, '10.2'], [118, '10.9'], [125, '11.2'],
  ];
  const [nsNum, nsBest] = nearSq[vIdx];
  const nsBase = Number(nsBest);
  list.push(
    qItem(
      `${p}5`,
      T2,
      'medium',
      `Without a calculator, which value is closest to √${nsNum} to 1 decimal place?`,
      `${nsBest}`,
      [
        `${(nsBase - 0.5).toFixed(1)}`,
        `${(nsBase + 0.5).toFixed(1)}`,
        `${(nsBase - 0.9).toFixed(1)}`,
      ],
      `9Ni.04: ${nsBest}² = ${(nsBase * nsBase).toFixed(2)}, which is closest to ${nsNum}.`
    )
  );

  // M-T2-2: Recurring decimal identification via prime factors
  const recList: [string, string][] = [
    ['7/30', '30 = 2 × 3 × 5 (factor 3)'],
    ['5/14', '14 = 2 × 7 (factor 7)'],
    ['11/12', '12 = 2² × 3 (factor 3)'],
    ['7/18', '18 = 2 × 3² (factor 3)'],
    ['13/22', '22 = 2 × 11 (factor 11)'],
    ['5/28', '28 = 2² × 7 (factor 7)'],
    ['7/15', '15 = 3 × 5 (factor 3)'],
    ['9/35', '35 = 5 × 7 (factor 7)'],
    ['11/24', '24 = 2³ × 3 (factor 3)'],
    ['5/21', '21 = 3 × 7 (factor 3 and 7)'],
    ['13/30', '30 = 2 × 3 × 5 (factor 3)'],
    ['9/14', '14 = 2 × 7 (factor 7)'],
    ['5/18', '18 = 2 × 3² (factor 3)'],
    ['17/22', '22 = 2 × 11 (factor 11)'],
    ['11/28', '28 = 2² × 7 (factor 7)'],
    ['13/15', '15 = 3 × 5 (factor 3)'],
    ['17/35', '35 = 5 × 7 (factor 7)'],
    ['19/24', '24 = 2³ × 3 (factor 3)'],
  ];
  const termPool = ['3/8', '7/20', '9/25', '11/40', '13/50', '3/16'];
  const [recF, recWhy] = recList[vIdx];
  const mt1 = termPool[vIdx % termPool.length];
  const mt2 = termPool[(vIdx + 1) % termPool.length];
  const mt3 = termPool[(vIdx + 2) % termPool.length];
  const recShown = [recF, mt1, mt2, mt3];
  const recRot = vIdx % 4;
  const recOrdered = [...recShown.slice(recRot), ...recShown.slice(0, recRot)];
  list.push(
    qItem(
      `${p}6`,
      T2,
      'medium',
      `Which fraction among (${recOrdered.join(', ')}) produces a recurring (non-terminating) decimal?`,
      recF,
      [mt1, mt2, mt3],
      `9Nf.01: In ${recF}, the denominator factorises as ${recWhy}, which includes a prime other than 2 or 5.`
    )
  );

  // M-T2-3: Cube root estimation or comparison
  const cmpPairs: [number, number][] = [
    [3, 10], [4, 15], [4, 18], [5, 23], [5, 28], [6, 34],
    [6, 38], [7, 47], [7, 52], [8, 62], [8, 66], [9, 79],
    [9, 85], [10, 96], [10, 105], [11, 118], [11, 126], [12, 140],
  ];
  const [intC, surdC] = cmpPairs[vIdx];
  const isLargerSurd = surdC > intC * intC;
  const bigger = isLargerSurd ? `√${surdC}` : `${intC}`;
  const smaller = isLargerSurd ? `${intC}` : `√${surdC}`;
  list.push(
    qItem(
      `${p}7`,
      T2,
      'medium',
      `Compare ${intC} and √${surdC}. Which statement is true?`,
      `${bigger} > ${smaller}, because ${surdC} ${isLargerSurd ? '>' : '<'} ${intC * intC}`,
      [
        `${smaller} > ${bigger}, because ${surdC} ${isLargerSurd ? '<' : '>'} ${intC * intC}`,
        `${intC} = √${surdC}`,
        `${smaller} > ${bigger}, because √${surdC} < ${intC}`,
      ],
      `9Ni.04: Since ${intC} = √${intC * intC}, comparing ${intC * intC} and ${surdC} shows ${bigger} > ${smaller}.`
    )
  );

  // M-T2-4: Product of surds / rational vs irrational
  const radPrimes = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 2, 3, 5, 6, 7, 10, 11, 13];
  const rp = radPrimes[vIdx];
  const mulK = 2 + (vIdx % 4);
  list.push(
    qItem(
      `${p}8`,
      T2,
      'medium',
      `Evaluate (${mulK}√${rp}) × (√${rp}) and state whether the result is rational or irrational.`,
      `${mulK * rp} (rational)`,
      [`${mulK * rp} (irrational)`, `${mulK}√${rp} (irrational)`, `${mulK + rp} (rational)`],
      `9Ni.01: (√${rp})² = ${rp}, so ${mulK} × ${rp} = ${mulK * rp}, which is an integer (rational).`
    )
  );

  // T3: Manipulating algebra, expressions & formulae (4 questions)
  // M-T3-1: Expand (x + a)(x - b)
  const ea = 3 + (vIdx % 6);
  const eb = 2 + ((vIdx + 2) % 5);
  const midC = ea - eb;
  const endC = ea * eb;
  const midTerm = midC === 0 ? '' : midC > 0 ? ` + ${midC === 1 ? '' : midC}x` : ` − ${Math.abs(midC) === 1 ? '' : Math.abs(midC)}x`;
  list.push(
    qItem(
      `${p}9`,
      T3,
      'medium',
      `Expand and simplify: (x + ${ea})(x − ${eb})`,
      `x²${midTerm} − ${endC}`,
      [
        `x² + ${ea + eb}x − ${endC}`,
        `x²${midTerm} + ${endC}`,
        `x² − ${endC}`,
      ],
      `9Ae.02: x² − ${eb}x + ${ea}x − ${endC} = x²${midTerm} − ${endC}.`
    )
  );

  // M-T3-2: Difference of two squares (kx - m)(kx + m)
  const dk = 2 + (vIdx % 5);
  const dm = 2 + ((vIdx + 3) % 7);
  list.push(
    qItem(
      `${p}10`,
      T3,
      'medium',
      `Expand and simplify: (${dk}x − ${dm})(${dk}x + ${dm})`,
      `${dk * dk}x² − ${dm * dm}`,
      [
        `${dk * dk}x² + ${dm * dm}`,
        `${dk * dk}x² − ${2 * dk * dm}x − ${dm * dm}`,
        `${dk}x² − ${dm * dm}`,
      ],
      `9Ae.02: Using (A − B)(A + B) = A² − B² gives (${dk}x)² − ${dm}² = ${dk * dk}x² − ${dm * dm}.`
    )
  );

  // M-T3-3: Varied formula rearrangement across variants
  const formulas: [string, string, string, string[], string][] = [
    ['A = ½(a + b)h', 'a', 'a = (2A / h) − b', ['a = (A / 2h) − b', 'a = 2A / (h + b)', 'a = (2A + b) / h'], '9Ae.04: Multiply by 2, divide by h, then subtract b.'],
    ['v = u + at', 't', 't = (v − u) / a', ['t = (v + u) / a', 't = v / a − u', 't = a(v − u)'], '9Ae.04: Subtract u (v − u = at), then divide by a.'],
    ['P = 2(l + w)', 'w', 'w = (P / 2) − l', ['w = P − 2l', 'w = (P + 2l) / 2', 'w = P / (2l)'], '9Ae.04: Divide by 2 (P/2 = l + w), then subtract l.'],
    ['C = 5(F − 32) / 9', 'F', 'F = (9C / 5) + 32', ['F = (5C / 9) + 32', 'F = (9C / 5) − 32', 'F = 9(C + 32) / 5'], '9Ae.04: Multiply by 9, divide by 5, then add 32.'],
    ['V = πr²h', 'h', 'h = V / (πr²)', ['h = Vπr²', 'h = √(V / πr)', 'h = (V − π) / r²'], '9Ae.04: Divide both sides by πr².'],
    ['y = 3x − k', 'x', 'x = (y + k) / 3', ['x = (y − k) / 3', 'x = y/3 + k', 'x = 3(y + k)'], '9Ae.04: Add k to both sides, then divide by 3.'],
    ['E = ½mv²', 'm', 'm = 2E / v²', ['m = E / (2v²)', 'm = √(2E / v)', 'm = 2Ev²'], '9Ae.04: Multiply by 2 (2E = mv²) and divide by v².'],
    ['S = 4πr²', 'r (r > 0)', 'r = √(S / (4π))', ['r = S / (4π)', 'r = √(S) / 4π', 'r = 4π√S'], '9Ae.04: Divide by 4π, then take the positive square root.'],
    ['A = ½bh + c', 'b', 'b = 2(A − c) / h', ['b = (2A − c) / h', 'b = (A − c) / (2h)', 'b = 2A / h − c'], '9Ae.04: Subtract c, multiply by 2, then divide by h.'],
    ['m = (p + q) / 4', 'p', 'p = 4m − q', ['p = 4(m − q)', 'p = (m / 4) − q', 'p = 4m + q'], '9Ae.04: Multiply by 4 (4m = p + q), then subtract q.'],
    ['K = C + 273', 'C', 'C = K − 273', ['C = K + 273', 'C = 273 − K', 'C = K / 273'], '9Ae.04: Subtract 273 from both sides.'],
    ['V = (1/3)Ah', 'A', 'A = 3V / h', ['A = V / (3h)', 'A = 3Vh', 'A = (V + 3) / h'], '9Ae.04: Multiply by 3 (3V = Ah), then divide by h.'],
    ['D = S × T − 5', 'T', 'T = (D + 5) / S', ['T = (D − 5) / S', 'T = D/S + 5', 'T = S(D + 5)'], '9Ae.04: Add 5, then divide by S.'],
    ['W = 3(n − 4)', 'n', 'n = (W / 3) + 4', ['n = (W + 4) / 3', 'n = (W / 3) − 4', 'n = 3W + 4'], '9Ae.04: Divide by 3 (W/3 = n − 4), then add 4.'],
    ['R = (a − b) / t', 'a', 'a = Rt + b', ['a = Rt − b', 'a = (R + b) / t', 'a = R/t + b'], '9Ae.04: Multiply by t (Rt = a − b), then add b.'],
    ['Q = 5p² − 2', 'p (p > 0)', 'p = √((Q + 2) / 5)', ['p = (Q + 2) / 5', 'p = √((Q − 2) / 5)', 'p = √(Q / 5) + 2'], '9Ae.04: Add 2, divide by 5, then take square root.'],
    ['M = 2k + 7n', 'n', 'n = (M − 2k) / 7', ['n = (M + 2k) / 7', 'n = M/7 − 2k', 'n = 7(M − 2k)'], '9Ae.04: Subtract 2k, then divide by 7.'],
    ['H = (x + 6) / y', 'y', 'y = (x + 6) / H', ['y = H(x + 6)', 'y = H / (x + 6)', 'y = (x − 6) / H'], '9Ae.04: Multiply by y (Hy = x + 6), then divide by H.'],
  ];
  const [fEq, fSubj, fAns, fDist, fExp] = formulas[vIdx];
  list.push(
    qItem(
      `${p}11`,
      T3,
      'medium',
      `Rearrange the formula ${fEq} to make ${fSubj} the subject.`,
      fAns,
      fDist,
      fExp
    )
  );

  // M-T3-4: Rearrange formula with square root T = k√L for L
  const tK = 2 + vIdx;
  list.push(
    qItem(
      `${p}12`,
      T3,
      'medium',
      `Make L the subject of T = ${tK}√L.`,
      `L = (T / ${tK})²`,
      [`L = T² / ${tK}`, `L = √(T / ${tK})`, `L = ${tK}T²`],
      `9Ae.04: Divide by ${tK}: T/${tK} = √L, then square both sides: L = (T / ${tK})².`
    )
  );

  // T4: Linear & simultaneous equations (3 questions)
  // M-T4-1: a / (px + q) = c
  const mxSol = 2 + (vIdx % 5);
  const mp = 2 + (vIdx % 3);
  const mq = 1 + ((vIdx + 1) % 4);
  const mc = 2 + ((vIdx + 2) % 4);
  const mTop = mc * (mp * mxSol + mq);
  list.push(
    qItem(
      `${p}13`,
      T4,
      'medium',
      `Solve: ${mTop} / (${mp}x + ${mq}) = ${mc}`,
      `x = ${mxSol}`,
      [`x = ${mxSol + 1}`, `x = ${mxSol + mq}`, `x = ${Math.max(1, mxSol - 1)}`],
      `9Ae.05: ${mp}x + ${mq} = ${mTop} / ${mc} = ${mp * mxSol + mq} ⇒ ${mp}x = ${mp * mxSol} ⇒ x = ${mxSol}.`
    )
  );

  // M-T4-2: Elimination ax + y = C1, bx - y = C2
  const ex = 2 + (vIdx % 6);
  const ey = 3 + ((vIdx + 1) % 5);
  const eaC = 2 + (vIdx % 3);
  const ebC = 1 + ((vIdx + 1) % 3);
  const rhs1 = eaC * ex + ey;
  const rhs2 = ebC * ex - ey;
  list.push(
    qItem(
      `${p}14`,
      T4,
      'medium',
      `Solve simultaneously: ${eaC}x + y = ${rhs1} and ${ebC === 1 ? '' : ebC}x − y = ${rhs2}.`,
      `x = ${ex}, y = ${ey}`,
      [`x = ${ey}, y = ${ex}`, `x = ${ex + 1}, y = ${ey - 1}`, `x = ${ex}, y = ${ey + 2}`],
      `9Ae.06: Add the equations to eliminate y: ${eaC + ebC}x = ${rhs1 + rhs2} ⇒ x = ${ex}, then y = ${ey}.`
    )
  );

  // M-T4-3: Intersection of two linear graphs
  const gx = 2 + (vIdx % 5);
  const gM1 = 3 + (vIdx % 3);
  const gM2 = 1 + (vIdx % 2);
  const gy = gM1 * gx + (1 + (vIdx % 4));
  const gc1 = gy - gM1 * gx;
  const gc2 = gy - gM2 * gx;
  list.push(
    qItem(
      `${p}15`,
      T4,
      'medium',
      `Find the coordinates of intersection of y = ${gM1}x ${signed(gc1)} and y = ${gM2 === 1 ? '' : gM2}x ${signed(gc2)}.`,
      `(${gx}, ${gy})`,
      [`(${gy}, ${gx})`, `(${gx + 1}, ${gy + gM1})`, `(${gx - 1}, ${gy})`],
      `9Ae.06: Set ${gM1}x ${signed(gc1)} = ${gM2 === 1 ? '' : gM2}x ${signed(gc2)} ⇒ ${gM1 - gM2}x = ${gc2 - gc1} ⇒ x = ${gx}, y = ${gy}.`
    )
  );

  // T5: 2D shapes & measure (4 questions, 3 WITH DIAGRAMS)
  // M-T5-1: Rectangle minus semicircle area
  const rmsD = 4 + 2 * (vIdx % 4); // even: 4,6,8,10
  const rmsR = rmsD / 2;
  const rmsW = rmsD + 4 + (vIdx % 5);
  const rmsH = rmsR + 3 + (vIdx % 4);
  const rectArea = rmsW * rmsH;
  const semiAreaNum = (rmsR * rmsR) / 2;
  list.push(
    qItem(
      `${p}16`,
      T5,
      'medium',
      `A rectangle of ${rmsW} cm by ${rmsH} cm has a semicircle of diameter ${rmsD} cm cut out of one side. Find the remaining area in terms of π.`,
      `(${rectArea} − ${semiAreaNum}π) cm²`,
      [
        `(${rectArea} − ${rmsR * rmsR}π) cm²`,
        `(${rectArea} + ${semiAreaNum}π) cm²`,
        `(${rectArea} − ${rmsD}π) cm²`,
      ],
      `9Gg.03: Rectangle = ${rectArea} cm². Semicircle (r = ${rmsR} cm) = ½π(${rmsR}²) = ${semiAreaNum}π cm². Remaining = (${rectArea} − ${semiAreaNum}π) cm².`,
      { kind: 'rect_minus_semi', w: rmsW, h: rmsH, d: rmsD }
    )
  );

  // M-T5-2: Running track (stadium) perimeter
  const stLen = 50 + vIdx * 5;
  const stDiam = 20 + (vIdx % 5) * 4;
  list.push(
    qItem(
      `${p}17`,
      T5,
      'medium',
      `A running track consists of two straight ${stLen} m sections and two semicircular ends of diameter ${stDiam} m. Find its total perimeter in terms of π.`,
      `(${2 * stLen} + ${stDiam}π) m`,
      [
        `(${stLen} + ${stDiam}π) m`,
        `(${2 * stLen} + ${2 * stDiam}π) m`,
        `(${2 * stLen} + ${(stDiam / 2) ** 2}π) m`,
      ],
      `9Gg.01 / 9Gg.03: Two semicircles form one full circle of circumference ${stDiam}π m, plus two straights (${2 * stLen} m).`,
      { kind: 'stadium', straight: stLen, d: stDiam }
    )
  );

  // M-T5-3: Area unit conversion mm² to μm²
  const chipAreas = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 12];
  const chipA = chipAreas[vIdx];
  const chipUm2 = chipA * 1_000_000;
  list.push(
    qItem(
      `${p}18`,
      T5,
      'medium',
      `A flat sensor has area ${chipA} mm². Express this area in square micrometres (μm²).`,
      `${chipUm2.toLocaleString('en-US')} μm²`,
      [
        `${(chipA * 1000).toLocaleString('en-US')} μm²`,
        `${(chipA * 10000).toLocaleString('en-US')} μm²`,
        `${(chipA * 100_000).toLocaleString('en-US')} μm²`,
      ],
      `9Gg.02: 1 mm = 1,000 μm, so 1 mm² = 1,000² = 1,000,000 μm². Thus ${chipA} mm² = ${chipUm2.toLocaleString('en-US')} μm².`
    )
  );

  // M-T5-4: Sector area (18 distinct [radius, angle] pairs with clean integer π areas)
  const sectorSpecs: [number, number][] = [
    [4, 90], [9, 120], [12, 60], [10, 180], [8, 90], [12, 120],
    [6, 90], [6, 120], [6, 60], [4, 180], [10, 90], [3, 120],
    [12, 90], [18, 60], [6, 180], [8, 180], [12, 180], [8, 45],
  ];
  const [secR, secAng] = sectorSpecs[vIdx];
  const secArea = (secAng / 360) * secR * secR;
  list.push(
    qItem(
      `${p}19`,
      T5,
      'medium',
      `Find the area of a circle sector with radius ${secR} cm and central angle ${secAng}° in terms of π.`,
      `${secArea}π cm²`,
      [
        `${secR * secR}π cm²`,
        `${secArea * 2}π cm²`,
        `${(secAng / 360) * 2 * secR}π cm²`,
      ],
      `9Gg.01: Area = (${secAng}/360) × π × ${secR}² = ${secArea}π cm².`,
      { kind: 'sector', r: secR, angle: secAng }
    )
  );

  // T6: 3D shapes (3 questions, ALL WITH DIAGRAMS)
  // M-T6-1: Cylinder volume
  const cylR = 3 + (vIdx % 6);
  const cylH = 5 + ((vIdx + 2) % 8);
  const cylVol = cylR * cylR * cylH;
  list.push(
    qItem(
      `${p}20`,
      T6,
      'medium',
      `Find the volume of a solid cylinder of radius ${cylR} cm and height ${cylH} cm in terms of π.`,
      `${cylVol}π cm³`,
      [`${2 * cylR * cylH}π cm³`, `${cylR * cylH}π cm³`, `${2 * cylVol}π cm³`],
      `9Gg.04: V = πr²h = π × ${cylR}² × ${cylH} = ${cylVol}π cm³.`,
      { kind: 'cylinder', r: cylR, h: cylH }
    )
  );

  // M-T6-2: Cylinder total surface area
  const csR = 2 + (vIdx % 6);
  const csH = 4 + ((vIdx + 1) % 7);
  const csTotal = 2 * csR * csR + 2 * csR * csH;
  list.push(
    qItem(
      `${p}21`,
      T6,
      'medium',
      `Find the total surface area of a closed cylinder with radius ${csR} cm and height ${csH} cm in terms of π.`,
      `${csTotal}π cm²`,
      [
        `${2 * csR * csH}π cm²`,
        `${csR * csR + 2 * csR * csH}π cm²`,
        `${csR * csR * csH}π cm²`,
      ],
      `9Gg.05: Two circular bases = 2π(${csR}²) = ${2 * csR * csR}π; curved side = 2π(${csR})(${csH}) = ${2 * csR * csH}π. Total = ${csTotal}π cm².`,
      { kind: 'cylinder', r: csR, h: csH }
    )
  );

  // M-T6-3: Square pyramid surface area
  const pyrBase = 4 + 2 * (vIdx % 5);
  const pyrSlant = 5 + (vIdx % 7);
  const pyrSA = pyrBase * pyrBase + 2 * pyrBase * pyrSlant;
  list.push(
    qItem(
      `${p}22`,
      T6,
      'medium',
      `A square-based pyramid has base side ${pyrBase} cm and each triangular face has slant height ${pyrSlant} cm. Find its total surface area.`,
      `${pyrSA} cm²`,
      [
        `${pyrBase * pyrBase + pyrBase * pyrSlant} cm²`,
        `${2 * pyrBase * pyrSlant} cm²`,
        `${pyrBase * pyrBase + 4 * pyrBase * pyrSlant} cm²`,
      ],
      `9Gg.05: Square base = ${pyrBase}² = ${pyrBase * pyrBase} cm²; 4 triangles = 4 × ½ × ${pyrBase} × ${pyrSlant} = ${2 * pyrBase * pyrSlant} cm². Total = ${pyrSA} cm².`,
      { kind: 'pyramid', base: pyrBase, slant: pyrSlant }
    )
  );

  // T7: Pythagoras' theorem (3 questions, ALL WITH DIAGRAMS)
  const medTriples: [number, number, number][] = [
    [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41], [6, 8, 10], [9, 12, 15],
    [12, 16, 20], [10, 24, 26], [12, 35, 37], [20, 21, 29], [16, 30, 34], [15, 20, 25],
    [14, 48, 50], [18, 24, 30], [21, 28, 35], [24, 32, 40], [15, 36, 39], [20, 48, 52],
  ];
  const [ma, mb, medHyp] = medTriples[vIdx];

  // M-T7-1: Ladder problem
  list.push(
    qItem(
      `${p}23`,
      T7,
      'medium',
      `A ${medHyp} m ladder leans against a vertical wall with its base ${ma} m from the wall. How high up the wall does it reach?`,
      `${mb} m`,
      [`${medHyp - ma} m`, `${mb + 2} m`, `${ma + mb} m`],
      `9Gg.10: Height = √(${medHyp}² − ${ma}²) = √(${medHyp * medHyp} − ${ma * ma}) = √${mb * mb} = ${mb} m.`,
      { kind: 'ladder', wall: 'h = ?', base: `${ma} m`, len: `${medHyp} m` }
    )
  );

  // M-T7-2: Rhombus side from diagonals
  const [ra1, rb1, rs1] = medTriples[(vIdx + 4) % medTriples.length];
  list.push(
    qItem(
      `${p}24`,
      T7,
      'medium',
      `A rhombus has diagonals of length ${2 * ra1} cm and ${2 * rb1} cm. Find the length of one side of the rhombus.`,
      `${rs1} cm`,
      [`${2 * rs1} cm`, `${ra1 + rb1} cm`, `${rs1 + 2} cm`],
      `9Gg.10: Diagonals bisect at 90° into ${ra1} cm and ${rb1} cm. Side = √(${ra1}² + ${rb1}²) = ${rs1} cm.`,
      { kind: 'rhombus', d1: 2 * ra1, d2: 2 * rb1 }
    )
  );

  // M-T7-3: Coordinate distance
  const [ca1, cb1, cc1] = medTriples[(vIdx + 9) % medTriples.length];
  const ox = 1 + (vIdx % 4);
  const oy = 1 + ((vIdx + 2) % 4);
  list.push(
    qItem(
      `${p}25`,
      T7,
      'medium',
      `Find the straight-line distance between points (${ox}, ${oy}) and (${ox + ca1}, ${oy + cb1}).`,
      `${cc1} units`,
      [`${ca1 + cb1} units`, `${cc1 + 3} units`, `${Math.abs(cb1 - ca1)} units`],
      `9Gg.10: Δx = ${ca1}, Δy = ${cb1}. Distance = √(${ca1}² + ${cb1}²) = ${cc1} units.`,
      { kind: 'coords', x1: ox, y1: oy, x2: ox + ca1, y2: oy + cb1 }
    )
  );

  return list;
}

// ---------- HARD VARIANTS 3..20 (k = 0..17 -> 18 * 25 = 450 distinct Hard questions) ----------
function buildHardVariant(vIdx: number): QuestionItem[] {
  const vNum = vIdx + 3;
  const p = `mv_h_${vNum}_`;
  const list: QuestionItem[] = [];

  // T1 (4 questions)
  // H-T1-1: Negative exponent fraction simplification
  const hb = 2 + (vIdx % 6);
  const ha = 3 + Math.floor(vIdx / 6) * 2;
  const hNegB = 2 + ((vIdx + 1) % 4);
  const hNegC = 4 + (vIdx % 3);
  const netExp = ha - hNegB + hNegC; // (b^a * b^-hNegB) / b^-hNegC
  list.push(
    qItem(
      `${p}1`,
      T1,
      'hard',
      `Simplify (${hb}${sup(ha)} × ${hb}${sup(-hNegB)}) ÷ ${hb}${sup(-hNegC)} as a single power of ${hb}.`,
      `${hb}${sup(netExp)}`,
      [
        `${hb}${sup(ha - hNegB - hNegC)}`,
        `${hb}${sup(ha + hNegB - hNegC)}`,
        `${hb}${sup(netExp - 2)}`,
      ],
      `9Ni.02: Numerator = ${hb}${sup(ha - hNegB)}. Dividing by ${hb}${sup(-hNegC)} adds ${hNegC}: (${ha - hNegB}) − (−${hNegC}) = ${netExp}.`
    )
  );

  // H-T1-2: Solve index equation b^(2x) * b^k = b^m
  const sb = 2 + (vIdx % 5);
  const xAns = 2 + (vIdx % 6);
  const kShift = 1 + ((vIdx + 1) % 4);
  const rhsExp = 2 * xAns + kShift;
  list.push(
    qItem(
      `${p}2`,
      T1,
      'hard',
      `Solve for x: ${sb}^(2x) × ${sb}${sup(kShift)} = ${sb}${sup(rhsExp)}`,
      `x = ${xAns}`,
      [`x = ${xAns + 1}`, `x = ${rhsExp}`, `x = ${xAns + kShift}`],
      `9Ni.02: Combine left-hand side to ${sb}^(2x + ${kShift}) = ${sb}${sup(rhsExp)} ⇒ 2x + ${kShift} = ${rhsExp} ⇒ x = ${xAns}.`
    )
  );

  // H-T1-3: Standard form addition A×10^n + B×10^(n-1)
  const sfN = 4 + (vIdx % 5);
  const sfA = 2 + (vIdx % 6);
  const sfB = 3 + ((vIdx * 2 + 1) % 6);
  const sumMantissa = Number((sfA + sfB / 10).toFixed(2));
  list.push(
    qItem(
      `${p}3`,
      T1,
      'hard',
      `Calculate (${sfA} × 10${sup(sfN)}) + (${sfB} × 10${sup(sfN - 1)}) and give your answer in standard form.`,
      `${sumMantissa} × 10${sup(sfN)}`,
      [
        `${sfA + sfB} × 10${sup(sfN)}`,
        `${sumMantissa} × 10${sup(sfN - 1)}`,
        `${sfA}.${sfB} × 10${sup(2 * sfN - 1)}`,
      ],
      `9Ni.03: Convert ${sfB} × 10${sup(sfN - 1)} = ${sfB / 10} × 10${sup(sfN)}, then add (${sfA} + ${sfB / 10}) × 10${sup(sfN)} = ${sumMantissa} × 10${sup(sfN)}.`
    )
  );

  // H-T1-4: Simplify algebraic power expression (k x^a y^b)^2 / (m x^c y^d)
  const ck = 2 + (vIdx % 5);
  const cm = ck;
  const coefAns = ck;
  const xa = 2 + (vIdx % 4);
  const yb = 3 + (vIdx % 3);
  const xc = 1 + (vIdx % 2);
  const yd = 2 + ((vIdx + 1) % 3);
  const xNet = 2 * xa - xc;
  const yNet = 2 * yb - yd;
  list.push(
    qItem(
      `${p}4`,
      T1,
      'hard',
      `Simplify (${ck}x${sup(xa)}y${sup(yb)})² ÷ (${cm}x${sup(xc)}y${sup(yd)}).`,
      `${coefAns}x${sup(xNet)}y${sup(yNet)}`,
      [
        `${ck * 2}x${sup(xNet)}y${sup(yNet)}`,
        `${coefAns}x${sup(xa - xc)}y${sup(yb - yd)}`,
        `${coefAns}x${sup(xNet + 1)}y${sup(yNet - 1)}`,
      ],
      `9Ae.02: Square numerator to ${ck * ck}x${sup(2 * xa)}y${sup(2 * yb)}, divide coefficients (${ck * ck}/${cm} = ${coefAns}) and subtract indices.`
    )
  );

  // T2: The number system (4 questions)
  // H-T2-1: Conjugate surds (a + √b)(a - √b)
  const conjA = 3 + (vIdx % 6);
  const conjPrimes = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 2, 3, 5, 6, 7, 10, 11, 13];
  const conjB = conjPrimes[vIdx];
  const conjAns = conjA * conjA - conjB;
  list.push(
    qItem(
      `${p}5`,
      T2,
      'hard',
      `Expand and simplify (${conjA} + √${conjB})(${conjA} − √${conjB}).`,
      `${conjAns}`,
      [
        `${conjA * conjA + conjB}`,
        `${conjA - conjB}`,
        `${conjAns} + 2√${conjB}`,
      ],
      `9Ni.01 / 9Ae.02: Using (a + b)(a − b) = a² − b², (${conjA})² − (√${conjB})² = ${conjA * conjA} − ${conjB} = ${conjAns}.`
    )
  );

  // H-T2-2: Rational product vs irrational sum
  const spList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 2, 3, 5, 7, 11, 13, 17, 19];
  const sp = spList[vIdx];
  const sa1 = 2 + (vIdx % 3);
  const sb1 = 3 + ((vIdx + 1) % 3);
  list.push(
    qItem(
      `${p}6`,
      T2,
      'hard',
      `Let p = ${sa1}√${sp} and q = ${sb1}√${sp}. Which statement is true?`,
      `p × q is rational (${sa1 * sb1 * sp}), while p + q is irrational (${sa1 + sb1}√${sp})`,
      [
        `Both p × q and p + q are rational`,
        `Both p × q and p + q are irrational`,
        `p × q is irrational, while p + q is rational`,
      ],
      `9Ni.01: ${sa1}√${sp} × ${sb1}√${sp} = ${sa1 * sb1} × ${sp} = ${sa1 * sb1 * sp} (rational), whereas ${sa1}√${sp} + ${sb1}√${sp} = ${sa1 + sb1}√${sp} (irrational).`
    )
  );

  // H-T2-3: Best 1-d.p. approximation of larger surd
  const bigSurds: [number, string][] = [
    [150, '12.2'], [175, '13.2'], [205, '14.3'], [230, '15.2'], [260, '16.1'], [295, '17.2'],
    [330, '18.2'], [365, '19.1'], [410, '20.2'], [450, '21.2'], [490, '22.1'], [535, '23.1'],
    [580, '24.1'], [630, '25.1'], [680, '26.1'], [735, '27.1'], [790, '28.1'], [850, '29.2'],
  ];
  const [bsNum, bsBest] = bigSurds[vIdx];
  const bsF = Number(bsBest);
  list.push(
    qItem(
      `${p}7`,
      T2,
      'hard',
      `Without a calculator, which is the closest approximation for √${bsNum}?`,
      `${bsBest}`,
      [`${(bsF - 0.6).toFixed(1)}`, `${(bsF + 0.6).toFixed(1)}`, `${(bsF + 1.2).toFixed(1)}`],
      `9Ni.04: ${bsBest}² ≈ ${(bsF * bsF).toFixed(1)}, matching √${bsNum}.`
    )
  );

  // H-T2-4: Counterexample for irrational operations
  const ceSurds = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 31];
  const ceP = ceSurds[vIdx];
  const ceK = 3 + (vIdx % 7);
  list.push(
    qItem(
      `${p}8`,
      T2,
      'hard',
      `TWM.04 (Convincing): Which counterexample involving √${ceP} disproves the conjecture "The sum of two irrational numbers is never rational"?`,
      `(${ceK} + √${ceP}) + (${ceK} − √${ceP}) = ${2 * ceK} (rational)`,
      [
        `√${ceP} + √${ceP} = 2√${ceP} (irrational)`,
        `√4 + √9 = 5 (both terms are rational)`,
        `π + √${ceP} (irrational)`,
      ],
      `TWM.04: Both ${ceK} + √${ceP} and ${ceK} − √${ceP} are irrational, yet their sum cancels √${ceP} to give rational integer ${2 * ceK}.`
    )
  );

  // T3: Manipulating algebra, expressions & formulae (4 questions)
  // H-T3-1: Simplify (k x^2 + k b x) / (x^2 - b^2)
  const fk = 2 + (vIdx % 6);
  const fb = 4 + Math.floor(vIdx / 6);
  list.push(
    qItem(
      `${p}9`,
      T3,
      'hard',
      `Simplify the algebraic fraction (${fk}x² + ${fk * fb}x) / (x² − ${fb * fb}) for x ≠ ±${fb}.`,
      `${fk}x / (x − ${fb})`,
      [`${fk} / (x − ${fb})`, `${fk}x / (x + ${fb})`, `${fk * fb}x / −${fb * fb}`],
      `9Ae.02: Numerator = ${fk}x(x + ${fb}); denominator = (x − ${fb})(x + ${fb}). Cancel (x + ${fb}) to get ${fk}x / (x − ${fb}).`
    )
  );

  // H-T3-2: Add algebraic fractions p/(2x) + q/(4x)
  const ap = 4 + (vIdx % 6);
  const aq = 1 + 2 * Math.floor(vIdx / 6); // odd (1, 3, 5) so numerator 2*ap + aq is odd and stays unsimplified over 4x!
  const fracSum = 2 * ap + aq;
  list.push(
    qItem(
      `${p}10`,
      T3,
      'hard',
      `Write as a single simplified fraction: (${ap} / 2x) + (${aq} / 4x)`,
      `${fracSum} / (4x)`,
      [`${ap + aq} / (6x)`, `${fracSum} / (8x²)`, `${ap + aq} / (4x)`],
      `9Ae.02: Use common denominator 4x: ${2 * ap}/(4x) + ${aq}/(4x) = ${fracSum}/(4x).`
    )
  );

  // H-T3-3: Rearrange rational formula y = (ax + b)/(x - c) for x
  const ra = 2 + (vIdx % 5);
  const rb = 1 + ((vIdx + 2) % 6);
  const rc = 2 + ((vIdx + 1) % 5);
  list.push(
    qItem(
      `${p}11`,
      T3,
      'hard',
      `Make x the subject of y = (${ra}x + ${rb}) / (x − ${rc}).`,
      `x = (${rc}y + ${rb}) / (y − ${ra})`,
      [
        `x = (${rc}y − ${rb}) / (y + ${ra})`,
        `x = (y − ${ra}) / (${rc}y + ${rb})`,
        `x = (${rc}y + ${rb}) / (y + ${ra})`,
      ],
      `9Ae.04: y(x − ${rc}) = ${ra}x + ${rb} ⇒ x(y − ${ra}) = ${rc}y + ${rb} ⇒ x = (${rc}y + ${rb}) / (y − ${ra}).`
    )
  );

  // H-T3-4: Expand k(x - a)^2 - (x^2 - b)
  const ek = 2 + (vIdx % 3);
  const ea2 = 2 + (vIdx % 4);
  const eb2 = 3 + (vIdx % 5);
  const cX2 = ek - 1;
  const cX = -2 * ek * ea2;
  const cConst = ek * ea2 * ea2 + eb2;
  list.push(
    qItem(
      `${p}12`,
      T3,
      'hard',
      `Expand and simplify: ${ek}(x − ${ea2})² − (x² − ${eb2})`,
      `${cX2 === 1 ? '' : cX2}x² − ${Math.abs(cX)}x + ${cConst}`,
      [
        `${cX2 === 1 ? '' : cX2}x² − ${Math.abs(cX)}x + ${ek * ea2 * ea2 - eb2}`,
        `${ek + 1}x² − ${Math.abs(cX)}x + ${cConst}`,
        `${cX2 === 1 ? '' : cX2}x² + ${cConst}`,
      ],
      `9Ae.02: ${ek}(x² − ${2 * ea2}x + ${ea2 * ea2}) − x² + ${eb2} = ${cX2 === 1 ? '' : cX2}x² − ${Math.abs(cX)}x + ${cConst}.`
    )
  );

  // T4: Linear & simultaneous equations (3 questions)
  // H-T4-1: Fractional equation p/x + q/(2x) = r
  const xAnsH = 0.5;
  const hxDen = 2 + (vIdx % 5); // actually let's solve p/(2x+1) = r
  const xH = 2 + (vIdx % 7);
  const coefH = 2 + (vIdx % 3);
  const shiftH = 1 + (vIdx % 4);
  const quotH = 3 + ((vIdx + 1) % 4);
  const numH = quotH * (coefH * xH + shiftH);
  list.push(
    qItem(
      `${p}13`,
      T4,
      'hard',
      `Solve for x: ${numH} / (${coefH}x + ${shiftH}) = ${quotH}`,
      `x = ${xH}`,
      [`x = ${xH + 0.5}`, `x = ${xH + shiftH}`, `x = ${xH + 2}`],
      `9Ae.05: ${coefH}x + ${shiftH} = ${numH} / ${quotH} = ${coefH * xH + shiftH} ⇒ ${coefH}x = ${coefH * xH} ⇒ x = ${xH}.`
    )
  );

  // H-T4-2: Full 2x2 simultaneous equations
  const sxH = 2 + (vIdx % 6);
  const syH = 1 + ((vIdx + 2) % 5);
  const a1 = 2 + (vIdx % 3);
  const b1 = 3 + ((vIdx + 1) % 3);
  const a2 = 3 + ((vIdx + 1) % 2);
  const b2 = 2 + (vIdx % 2);
  const c1H = a1 * sxH + b1 * syH;
  const c2H = a2 * sxH + b2 * syH;
  // Ensure determinant != 0 (a1*b2 != a2*b1). If equal, adjust b2.
  const b2Safe = a1 * b2 === a2 * b1 ? b2 + 1 : b2;
  const c2HSafe = a2 * sxH + b2Safe * syH;
  list.push(
    qItem(
      `${p}14`,
      T4,
      'hard',
      `Solve simultaneously: ${a1}x + ${b1}y = ${c1H} and ${a2}x + ${b2Safe}y = ${c2HSafe}.`,
      `x = ${sxH}, y = ${syH}`,
      [
        `x = ${syH}, y = ${sxH}`,
        `x = ${sxH + 1}, y = ${syH - 1}`,
        `x = ${sxH + 2}, y = ${syH + 1}`,
      ],
      `9Ae.06: Multiply equations to match coefficients and eliminate one variable to obtain x = ${sxH}, y = ${syH} (check: ${a1}(${sxH}) + ${b1}(${syH}) = ${c1H}).`
    )
  );

  // H-T4-3: Boat speed equation with unknown in denominator
  const boatV = 10 + vIdx;
  const curC = 2 + (vIdx % 3);
  const hrsT = 2 + (vIdx % 3);
  const distKm = (boatV + curC) * hrsT;
  list.push(
    qItem(
      `${p}15`,
      T4,
      'hard',
      `A boat travels ${distKm} km downstream at speed (v + ${curC}) km/h in ${hrsT} hours. Form an equation and find v.`,
      `${boatV} km/h`,
      [`${boatV + curC} km/h`, `${boatV - curC} km/h`, `${Math.round(distKm / 2)} km/h`],
      `9Ae.05: ${distKm} / (v + ${curC}) = ${hrsT} ⇒ v + ${curC} = ${boatV + curC} ⇒ v = ${boatV} km/h.`
    )
  );
  void xAnsH;
  void hxDen;

  // T5: 2D shapes & measure (4 questions, 3 WITH DIAGRAMS)
  // H-T5-1: Square minus inscribed circle
  const sqSide = 6 + 2 * vIdx; // even: 6..40
  const sqR = sqSide / 2;
  list.push(
    qItem(
      `${p}16`,
      T5,
      'hard',
      `A circle of diameter ${sqSide} cm is inscribed inside a ${sqSide} cm × ${sqSide} cm square. Find the shaded area inside the square but outside the circle (in terms of π).`,
      `(${sqSide * sqSide} − ${sqR * sqR}π) cm²`,
      [
        `(${sqSide * sqSide} − ${sqSide * sqSide}π) cm²`,
        `(${sqSide * sqSide} − ${sqSide}π) cm²`,
        `(${4 * sqSide} − ${sqR * sqR}π) cm²`,
      ],
      `9Gg.03: Square = ${sqSide}² = ${sqSide * sqSide} cm²; Circle (r = ${sqR} cm) = ${sqR * sqR}π cm². Remaining = (${sqSide * sqSide} − ${sqR * sqR}π) cm².`,
      { kind: 'square_minus_circle', s: sqSide }
    )
  );

  // H-T5-2: Triangle + semicircle compound badge
  const tbBase = 6 + 2 * (vIdx % 6);
  const tbR = tbBase / 2;
  const tbH = 7 + Math.floor(vIdx / 6);
  const triA = (tbBase * tbH) / 2;
  const semiPiA = (tbR * tbR) / 2;
  list.push(
    qItem(
      `${p}17`,
      T5,
      'hard',
      `A badge consists of a triangle of base ${tbBase} cm and height ${tbH} cm with a semicircle of diameter ${tbBase} cm attached to its base. Find its total area in terms of π.`,
      `(${triA} + ${semiPiA}π) cm²`,
      [
        `(${triA} + ${tbR * tbR}π) cm²`,
        `(${tbBase * tbH} + ${semiPiA}π) cm²`,
        `(${triA} + ${tbR}π) cm²`,
      ],
      `9Gg.03: Triangle = ½ × ${tbBase} × ${tbH} = ${triA} cm²; Semicircle (r = ${tbR}) = ½π(${tbR}²) = ${semiPiA}π cm².`,
      { kind: 'tri_plus_semi', base: tbBase, h: tbH }
    )
  );

  // H-T5-3: Microchip area in μm² in standard form
  const mcW = 2 + (vIdx % 6) * 0.5;
  const mcH = 2 + Math.floor(vIdx / 6);
  const mcUm2 = mcW * mcH * 1_000_000;
  const mcExp = Math.floor(Math.log10(mcUm2));
  const mcMant = Number((mcUm2 / Math.pow(10, mcExp)).toFixed(3));
  list.push(
    qItem(
      `${p}18`,
      T5,
      'hard',
      `A rectangular microchip measures ${mcW} mm by ${mcH} mm. Express its area in square micrometres (μm²) in standard form.`,
      `${mcMant} × 10${sup(mcExp)} μm²`,
      [
        `${mcMant} × 10${sup(mcExp - 3)} μm²`,
        `${mcMant} × 10${sup(mcExp + 3)} μm²`,
        `${mcMant} × 10${sup(-mcExp)} μm²`,
      ],
      `9Gg.02: ${mcW} mm = ${mcW * 1000} μm and ${mcH} mm = ${mcH * 1000} μm. Area = ${mcUm2.toLocaleString('en-US')} = ${mcMant} × 10${sup(mcExp)} μm².`
    )
  );

  // H-T5-4: Wheel revolutions using 22/7
  const wDiams = [35, 70, 105, 140, 21, 42, 49, 56, 63, 77, 84, 91, 98, 112, 119, 126, 133, 147];
  const wD = wDiams[vIdx];
  const wRevs = 50 + (vIdx % 3) * 50; // 50, 100, 150
  const circCm = (22 * wD) / 7;
  const distM = (circCm * wRevs) / 100;
  list.push(
    qItem(
      `${p}19`,
      T5,
      'hard',
      `A wheel of diameter ${wD} cm completes ${wRevs} full revolutions. Using π ≈ 22/7, how far does it travel in metres?`,
      `${distM} m`,
      [`${distM / 10} m`, `${distM * 10} m`, `${distM / 2} m`],
      `9Gg.01: C = (22/7) × ${wD} = ${circCm} cm = ${circCm / 100} m. Over ${wRevs} revolutions: ${circCm / 100} × ${wRevs} = ${distM} m.`,
      { kind: 'circle', mode: 'd', valueLabel: `${wD} cm` }
    )
  );

  // T6: 3D shapes (3 questions, ALL WITH DIAGRAMS)
  // H-T6-1: Open-top cylinder surface area
  const ocR = 3 + (vIdx % 6);
  const ocH = 7 + ((vIdx + 3) % 8);
  const ocSA = ocR * ocR + 2 * ocR * ocH;
  list.push(
    qItem(
      `${p}20`,
      T6,
      'hard',
      `An open-top cylindrical container (one circular base + curved side, no lid) has radius ${ocR} cm and height ${ocH} cm. Find its external surface area in terms of π.`,
      `${ocSA}π cm²`,
      [
        `${2 * ocR * ocR + 2 * ocR * ocH}π cm²`,
        `${2 * ocR * ocH}π cm²`,
        `${ocR * ocR * ocH}π cm²`,
      ],
      `9Gg.05: Base = π(${ocR}²) = ${ocR * ocR}π; Curved wall = 2π(${ocR})(${ocH}) = ${2 * ocR * ocH}π. Total = ${ocSA}π cm².`,
      { kind: 'cylinder', r: ocR, h: ocH, openTop: true }
    )
  );

  // H-T6-2: Trapezium prism volume
  const tpA = 4 + (vIdx % 5);
  const tpB2 = tpA + 2 + 2 * (vIdx % 3); // same parity -> integer half-sum
  const tpH2 = 3 + (vIdx % 4);
  const tpL2 = 8 + (vIdx % 7);
  const trapVol = ((tpA + tpB2) / 2) * tpH2 * tpL2;
  list.push(
    qItem(
      `${p}21`,
      T6,
      'hard',
      `A prism has a trapezium cross-section with parallel sides ${tpA} cm and ${tpB2} cm, height ${tpH2} cm, and prism length ${tpL2} cm. Find its volume.`,
      `${trapVol} cm³`,
      [`${trapVol * 2} cm³`, `${Math.round(trapVol / 2)} cm³`, `${tpA * tpB2 * tpL2} cm³`],
      `9Gg.04: Trapezium area = ½(${tpA} + ${tpB2}) × ${tpH2} = ${((tpA + tpB2) / 2) * tpH2} cm². Volume = ${((tpA + tpB2) / 2) * tpH2} × ${tpL2} = ${trapVol} cm³.`,
      { kind: 'trap_prism', a: tpA, b: tpB2, h: tpH2, len: tpL2 }
    )
  );

  // H-T6-3: Cube volume from SA OR sliced cuboid SA increase
  if (vIdx % 2 === 0) {
    const csSide = 4 + Math.floor(vIdx / 2);
    const csSA2 = 6 * csSide * csSide;
    const csVol2 = csSide ** 3;
    list.push(
      qItem(
        `${p}22`,
        T6,
        'hard',
        `A solid cube has total surface area ${csSA2} cm². Find its volume.`,
        `${csVol2} cm³`,
        [`${csSide * csSide} cm³`, `${csSA2} cm³`, `${(csSide + 1) ** 3} cm³`],
        `9Gg.05: 6s² = ${csSA2} ⇒ s² = ${csSide * csSide} ⇒ s = ${csSide} cm. Volume = ${csSide}³ = ${csVol2} cm³.`,
        { kind: 'cube', sLabel: `SA = ${csSA2} cm²` }
      )
    );
  } else {
    const oddIdx = Math.floor(vIdx / 2);
    const scL = 6 + oddIdx;
    const scW = 3 + (oddIdx % 4);
    const scH = 2 + (oddIdx % 3);
    const incSA = 2 * scW * scH;
    list.push(
      qItem(
        `${p}22`,
        T6,
        'hard',
        `A solid cuboid of ${scL} cm × ${scW} cm × ${scH} cm is sliced once parallel to its ${scW} cm × ${scH} cm face. By how much does total surface area increase?`,
        `${incSA} cm²`,
        [`${scW * scH} cm²`, `${2 * scL * scW} cm²`, `${incSA * 2} cm²`],
        `9Gg.05: Making one slice exposes two new ${scW} cm × ${scH} cm faces: 2 × (${scW} × ${scH}) = ${incSA} cm².`,
        { kind: 'cuboid', l: scL, w: scW, h: scH, sliced: true }
      )
    );
  }

  // T7: Pythagoras' theorem (3 questions, ALL WITH DIAGRAMS)
  // H-T7-1: 3D cuboid space diagonal (integer Pythagorean double-triple!)
  const cub3DTriples: [number, number, number, number][] = [
    [3, 4, 12, 13],
    [6, 8, 24, 26],
    [5, 12, 84, 85],
    [4, 3, 12, 13],
    [1, 2, 2, 3],
    [2, 3, 6, 7],
    [4, 4, 7, 9],
    [2, 6, 9, 11],
    [6, 6, 7, 11],
    [3, 6, 6, 9],
    [8, 9, 12, 17],
    [1, 4, 8, 9],
    [4, 8, 1, 9],
    [6, 10, 15, 19],
    [2, 10, 11, 15],
    [12, 16, 15, 25],
    [9, 12, 8, 17],
    [8, 15, 12, 20.6], // wait: let's keep exact integers! 8^2+15^2=17^2 -> let's use exact [8, 15, 144] -> 145!
  ];
  cub3DTriples[17] = [5, 12, 12, 17.6]; // nope! Let's fix index 17 to [12, 16, 21, 29] -> 12^2+16^2=400=20^2, 20^2+21^2=841=29^2! Exact!
  cub3DTriples[17] = [12, 16, 21, 29];
  // Also check every single tuple: a^2 + b^2 + c^2 = d^2!
  // [3,4,12,13]: 9+16+144=169 ✓
  // [6,8,24,26]: 36+64+576=676 ✓
  // [5,12,84,85]: 25+144+7056=7225=85^2 ✓
  // [4,3,12,13] -> duplicate of 0 -> replace with [9,12,20,25] (81+144+400=625 ✓)
  cub3DTriples[3] = [9, 12, 20, 25];
  // [1,2,2,3]: 1+4+4=9 ✓
  // [2,3,6,7]: 4+9+36=49 ✓
  // [4,4,7,9]: 16+16+49=81 ✓
  // [2,6,9,11]: 4+36+81=121 ✓
  // [6,6,7,11]: 36+36+49=121 ✓
  // [3,6,6,9]: 9+36+36=81 ✓
  // [8,9,12,17]: 64+81+144=289 ✓
  // [1,4,8,9]: 1+16+64=81 ✓
  // [4,8,1,9] -> replace with [12,15,16,25]: 144+225+256=625 ✓
  cub3DTriples[12] = [12, 15, 16, 25];
  // [6,10,15,19]: 36+100+225=361=19^2 ✓
  // [2,10,11,15]: 4+100+121=225=15^2 ✓
  // [12,16,15,25]: 144+256+225=625=25^2 ✓
  // [9,12,8,17]: 81+144+64=289=17^2 ✓
  // [12,16,21,29]: 144+256+441=841=29^2 ✓

  const [dL, dW, dH, dDiag] = cub3DTriples[vIdx];
  list.push(
    qItem(
      `${p}23`,
      T7,
      'hard',
      `A cuboid has dimensions ${dL} cm, ${dW} cm, and ${dH} cm. Find the exact length of its longest internal space diagonal.`,
      `${dDiag} cm`,
      [`${dL + dW + dH} cm`, `${dDiag + 2} cm`, `${dDiag + 4} cm`],
      `9Gg.10: Space diagonal = √(${dL}² + ${dW}² + ${dH}²) = √${dDiag * dDiag} = ${dDiag} cm.`,
      { kind: 'cuboid', l: dL, w: dW, h: dH, diagonal: true }
    )
  );

  // H-T7-2: Circle chord radius
  const chTriples: [number, number, number][] = [
    [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17],
    [7, 24, 25], [24, 7, 25], [9, 12, 15], [12, 9, 15], [10, 24, 26], [24, 10, 26],
    [12, 16, 20], [16, 12, 20], [15, 20, 25], [20, 15, 25], [18, 24, 30], [24, 18, 30],
  ];
  const [halfCh, chDist, chRad] = chTriples[vIdx];
  const fullChord = 2 * halfCh;
  list.push(
    qItem(
      `${p}24`,
      T7,
      'hard',
      `A chord of a circle has length ${fullChord} cm and lies ${chDist} cm from the centre. Find the radius of the circle.`,
      `${chRad} cm`,
      [`${fullChord + chDist} cm`, `${chRad + 3} cm`, `${halfCh + chDist} cm`],
      `9Gg.10: Half the chord is ${halfCh} cm. Radius r = √(${halfCh}² + ${chDist}²) = √${chRad * chRad} = ${chRad} cm.`,
      { kind: 'chord', chordLen: fullChord, dist: chDist }
    )
  );

  // H-T7-3: Equilateral triangle exact surd area
  const eqSide = 4 + 2 * (vIdx % 9); // even: 4,6,8,10,12,14,16,18,20 (wait: repeats after 9 if same -> use 4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38)
  const eqS = 4 + 2 * vIdx;
  const eqHalf = eqS / 2;
  const eqAreaCoeff = eqHalf * eqHalf; // area = 1/2 * 2h * h√3 = h^2 √3!
  list.push(
    qItem(
      `${p}25`,
      T7,
      'hard',
      `An equilateral triangle has side length ${eqS} cm. Find its exact area in surd form.`,
      `${eqAreaCoeff}√3 cm²`,
      [`${2 * eqAreaCoeff}√3 cm²`, `${eqAreaCoeff} cm²`, `${eqS * eqHalf}√3 cm²`],
      `9Gg.10: Height h = √(${eqS}² − ${eqHalf}²) = ${eqHalf}√3 cm. Area = ½ × ${eqS} × ${eqHalf}√3 = ${eqAreaCoeff}√3 cm².`,
      { kind: 'equilateral', s: eqS }
    )
  );
  void eqSide;

  return list;
}

export function generateAdditionalMathQuestions(): QuestionItem[] {
  const generated: QuestionItem[] = [];
  for (let vIdx = 0; vIdx < 18; vIdx++) {
    generated.push(...buildEasyVariant(vIdx));
  }
  for (let vIdx = 0; vIdx < 18; vIdx++) {
    generated.push(...buildMediumVariant(vIdx));
  }
  for (let vIdx = 0; vIdx < 18; vIdx++) {
    generated.push(...buildHardVariant(vIdx));
  }
  return generated;
}
