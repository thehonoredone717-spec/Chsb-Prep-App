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

export function generateAdditionalMathQuestions(): QuestionItem[] {
  const questions: QuestionItem[] = [];
  let idCounter = 151;

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  // 450 questions per difficulty (total 1350 generated + 150 base = 1500 questions, 500 per difficulty)
  difficulties.forEach((diff) => {
    for (let i = 0; i < 450; i++) {
      const topicIndex = i % MATH_TOPICS.length;
      const topic = MATH_TOPICS[topicIndex];
      const id = `m${idCounter++}`;
      const itemNum = i + 1;

      let qText = '';
      let opts: string[] = [];
      let explain = '';
      let diagram: MathDiagramSpec | undefined;

      switch (topicIndex) {
        // Topic 1: Indices and standard form (9Ni.02, 9Ni.03, 9Ae.02, 9Np.01)
        case 0: {
          const p1 = (itemNum % 7) + 2;
          const p2 = (itemNum % 5) + 2;
          if (diff === 'easy') {
            qText = `Simplify using index laws: 10^${p1} × 10^${p2}`;
            const sumP = p1 + p2;
            opts = [`10^${sumP}`, `10^${p1 * p2}`, `100^${sumP}`, `10^${sumP + 1}`];
            explain = `9Ni.02: For multiplication with the same base, add exponents: ${p1} + ${p2} = ${sumP}.`;
          } else if (diff === 'medium') {
            const num = (p1 * 1.5).toFixed(1);
            const exp = (itemNum % 6) + 3;
            qText = `Express ${num} × 10^${exp} as an ordinary integer or decimal.`;
            const val = Number(num) * Math.pow(10, exp);
            opts = [val.toLocaleString('en-US'), (val * 10).toLocaleString('en-US'), (val / 10).toLocaleString('en-US'), `${val}0`];
            explain = `9Ni.03 / 9Np.01: Multiply by 10^${exp} by shifting the decimal point ${exp} places right.`;
          } else {
            const k = (itemNum % 4) + 2;
            qText = `Simplify the algebraic fraction: (6x^${p1 + 2} y^${p2 + 1}) / (2x^${p1} y)`;
            opts = [`3x²y^${p2}`, `4x²y^${p2}`, `3x^${p1}y`, `3xy^${p2}`];
            explain = `9Ae.02: 6/2 = 3, x^(${p1 + 2} − ${p1}) = x², and y^(${p2 + 1} − 1) = y^${p2}.`;
          }
          break;
        }

        // Topic 2: The number system (9Ni.01, 9Ni.04, 9Nf.01)
        case 1: {
          const n = (itemNum % 15) + 11;
          const square = n * n;
          const target = square + 3;
          if (diff === 'easy') {
            qText = `Which of the following is an irrational number?`;
            opts = [`√${target}`, `√${square}`, `0.${n}`, `${n}/5`];
            explain = `9Ni.01: √${target} cannot be written as a ratio of integers and is non-terminating and non-recurring.`;
          } else if (diff === 'medium') {
            const nextSq = (n + 1) * (n + 1);
            qText = `Estimate the surd √${target + 5} between two consecutive integers.`;
            opts = [`Between ${n} and ${n + 1}`, `Between ${n - 1} and ${n}`, `Between ${n + 1} and ${n + 2}`, `Between ${n - 2} and ${n - 1}`];
            explain = `9Ni.04: ${square} < ${target + 5} < ${nextSq}, so the value lies between ${n} and ${n + 1}.`;
          } else {
            const den = [7, 11, 13, 17][itemNum % 4];
            qText = `Deduce whether the fraction 3/${den} produces a terminating or recurring decimal.`;
            opts = [
              `Recurring decimal, because ${den} has prime factors other than 2 and 5`,
              `Terminating decimal, because the numerator 3 is odd`,
              `Terminating decimal, because the denominator is a prime number`,
              `Neither terminating nor recurring`,
            ];
            explain = `9Nf.01: A fraction a/b terminates if and only if the prime factorisation of b contains only 2 and/or 5.`;
          }
          break;
        }

        // Topic 3: Manipulating algebra, expressions and formulae (9Ae.01–9Ae.04)
        case 2: {
          const a = (itemNum % 6) + 2;
          const b = (itemNum % 5) + 3;
          if (diff === 'easy') {
            qText = `Expand the brackets: ${a}(2x + ${b})`;
            opts = [`${a * 2}x + ${a * b}`, `${a * 2}x + ${b}`, `${a}x + ${a * b}`, `${a * 2}x + ${a + b}`];
            explain = `9Ae.02: Distribute ${a}: ${a} × 2x + ${a} × ${b} = ${a * 2}x + ${a * b}.`;
          } else if (diff === 'medium') {
            qText = `Expand and simplify the product: (x + ${a})(x + ${b})`;
            const mid = a + b;
            const end = a * b;
            opts = [`x² + ${mid}x + ${end}`, `x² + ${end}x + ${mid}`, `x² + ${mid}x`, `2x + ${mid}`];
            explain = `9Ae.02: x² + ${b}x + ${a}x + ${a * b} = x² + ${mid}x + ${end}.`;
          } else {
            qText = `Rearrange the formula to make x the subject: y = √(${a}x − ${b})`;
            opts = [`x = (y² + ${b}) / ${a}`, `x = (y² − ${b}) / ${a}`, `x = √(y + ${b}) / ${a}`, `x = (y + ${b})² / ${a}`];
            explain = `9Ae.04: Square both sides: y² = ${a}x − ${b} ⇒ ${a}x = y² + ${b} ⇒ x = (y² + ${b}) / ${a}.`;
          }
          break;
        }

        // Topic 4: Linear and simultaneous equations (9Ae.05, 9Ae.06)
        case 3: {
          const xVal = (itemNum % 7) + 2;
          const mult = (itemNum % 4) + 2;
          const c = (itemNum % 9) + 5;
          const rhs = mult * xVal + c;
          if (diff === 'easy') {
            qText = `Solve the linear equation: ${mult}x + ${c} = ${rhs}`;
            opts = [`x = ${xVal}`, `x = ${xVal + 1}`, `x = ${xVal - 1}`, `x = ${xVal + 2}`];
            explain = `9Ae.05: ${mult}x = ${rhs} − ${c} = ${mult * xVal} ⇒ x = ${xVal}.`;
          } else if (diff === 'medium') {
            const d = (itemNum % 3) + 2;
            qText = `Solve the equation with an unknown in denominator: ${d * xVal} / x = ${d}`;
            opts = [`x = ${xVal}`, `x = ${xVal * 2}`, `x = ${d}`, `x = 1`];
            explain = `9Ae.05: Multiply both sides by x: ${d * xVal} = ${d}x ⇒ x = ${xVal}.`;
          } else {
            const yVal = (itemNum % 5) + 1;
            const eq1 = xVal + yVal;
            const eq2 = xVal - yVal;
            qText = `Solve the simultaneous linear equations: x + y = ${eq1} and x − y = ${eq2}`;
            opts = [`x = ${xVal}, y = ${yVal}`, `x = ${yVal}, y = ${xVal}`, `x = ${xVal + 1}, y = ${yVal - 1}`, `x = ${xVal}, y = ${yVal + 1}`];
            explain = `9Ae.06: Adding equations gives 2x = ${eq1 + eq2} ⇒ x = ${xVal}, and y = ${eq1} − ${xVal} = ${yVal}.`;
          }
          break;
        }

        // Topic 5: 2D shapes and measure (9Gg.01, 9Gg.02, 9Gg.03)
        case 4: {
          const r = ((itemNum % 8) + 3) * 7; // multiple of 7 for easy 22/7 or pi
          if (diff === 'easy') {
            qText = `Calculate the circumference of a circle with radius r = ${r} cm (use π ≈ 3.14).`;
            const circ = (2 * 3.14 * r).toFixed(1);
            opts = [`${circ} cm`, `${(Number(circ) * 2).toFixed(1)} cm`, `${(Number(circ) / 2).toFixed(1)} cm`, `${(3.14 * r * r).toFixed(1)} cm`];
            explain = `9Gg.01: C = 2πr = 2 × 3.14 × ${r} = ${circ} cm.`;
            diagram = { kind: 'circle', mode: 'r', valueLabel: `r = ${r} cm` };
          } else if (diff === 'medium') {
            const w = (itemNum % 6) + 6;
            const h = (itemNum % 5) + 4;
            qText = `Calculate the area of a rectangle with width ${w} cm and height ${h} cm.`;
            opts = [`${w * h} cm²`, `${2 * (w + h)} cm²`, `${w * h * 2} cm²`, `${(w * h) / 2} cm²`];
            explain = `9Gg.03: Area = width × height = ${w} × ${h} = ${w * h} cm².`;
            diagram = { kind: 'rect', w, h, unit: 'cm' };
          } else {
            const s = (itemNum % 5) + 4;
            qText = `Calculate the perimeter of a semicircle with diameter d = ${s * 2} cm (use π ≈ 3.14).`;
            const perim = (3.14 * s + s * 2).toFixed(2);
            opts = [`${perim} cm`, `${(3.14 * s).toFixed(2)} cm`, `${(3.14 * s * 2).toFixed(2)} cm`, `${(s * 2 * 3.14).toFixed(2)} cm`];
            explain = `9Gg.01 / 9Gg.03: Perimeter = πr + d = 3.14 × ${s} + ${s * 2} = ${perim} cm.`;
            diagram = { kind: 'semicircle', mode: 'd', valueLabel: `d = ${s * 2} cm` };
          }
          break;
        }

        // Topic 6: 3D shapes (9Gg.04, 9Gg.05, 9Gg.06)
        case 5: {
          const r = (itemNum % 5) + 3;
          const h = (itemNum % 6) + 5;
          if (diff === 'easy') {
            const side = (itemNum % 6) + 3;
            qText = `Calculate the volume of a cube with side length ${side} cm.`;
            const vol = side * side * side;
            opts = [`${vol} cm³`, `${side * side * 6} cm³`, `${side * 12} cm³`, `${side * side} cm³`];
            explain = `9Gg.04: Volume of cube = s³ = ${side}³ = ${vol} cm³.`;
            diagram = { kind: 'cube', sLabel: `${side} cm` };
          } else if (diff === 'medium') {
            qText = `Calculate the volume of a cylinder with radius r = ${r} cm and height h = ${h} cm (use π ≈ 3.14).`;
            const vol = (3.14 * r * r * h).toFixed(1);
            opts = [`${vol} cm³`, `${(2 * 3.14 * r * h).toFixed(1)} cm³`, `${(3.14 * r * h).toFixed(1)} cm³`, `${(vol as any * 2).toFixed(1)} cm³`];
            explain = `9Gg.04: V = πr²h = 3.14 × ${r * r} × ${h} = ${vol} cm³.`;
            diagram = { kind: 'cylinder', r, h };
          } else {
            const side = (itemNum % 5) + 3;
            qText = `Calculate the total surface area of a cube with side length ${side} cm.`;
            const sa = 6 * side * side;
            opts = [`${sa} cm²`, `${side * side * side} cm²`, `${4 * side * side} cm²`, `${12 * side} cm²`];
            explain = `9Gg.05: Total surface area of a cube = 6s² = 6 × ${side * side} = ${sa} cm².`;
            diagram = { kind: 'cube', sLabel: `${side} cm` };
          }
          break;
        }

        // Topic 7: Pythagoras' theorem (9Gg.10, TWM.01, TWM.02)
        default: {
          const triples = [
            [3, 4, 5],
            [5, 12, 13],
            [6, 8, 10],
            [8, 15, 17],
            [9, 12, 15],
            [7, 24, 25],
            [9, 40, 41],
          ];
          const [a, b, c] = triples[itemNum % triples.length];
          if (diff === 'easy') {
            qText = `In a right-angled triangle with legs a = ${a} cm and b = ${b} cm, find the hypotenuse c.`;
            opts = [`${c} cm`, `${c + 1} cm`, `${c - 1} cm`, `${a + b} cm`];
            explain = `9Gg.10: c = √(a² + b²) = √(${a * a} + ${b * b}) = √${c * c} = ${c} cm.`;
            diagram = { kind: 'right_tri', a: `${a} cm`, b: `${b} cm`, c: 'c = ?' };
          } else if (diff === 'medium') {
            qText = `A ladder of length ${c} m rests against a wall. Its foot is ${a} m from the wall. Find the height reached up the wall.`;
            opts = [`${b} m`, `${b + 1} m`, `${b - 1} m`, `${c - a} m`];
            explain = `9Gg.10: h = √(c² − a²) = √(${c * c} − ${a * a}) = √${b * b} = ${b} m.`;
            diagram = { kind: 'ladder', wall: 'h = ?', base: `${a} m`, len: `${c} m` };
          } else {
            qText = `TWM.01 (Specialising): Verify if a triangle with sides ${a} cm, ${b} cm, and ${c} cm is a right-angled triangle.`;
            opts = [
              `Yes, because ${a}² + ${b}² = ${a * a + b * b} = ${c}²`,
              `No, because ${a} + ${b} ≠ ${c}`,
              `No, because the sides are not all equal`,
              `Yes, because all sides are integers`,
            ];
            explain = `9Gg.10 / TWM.01: By the converse of Pythagoras' theorem, ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} = ${c}², so it is right-angled.`;
            diagram = { kind: 'right_tri', a: `${a} cm`, b: `${b} cm`, c: `${c} cm`, showCheck: true };
          }
          break;
        }
      }

      questions.push({
        id,
        topic,
        difficulty: diff,
        q: qText,
        opts,
        answer: 0,
        explain,
        diagram,
      });
    }
  });

  return questions;
}
