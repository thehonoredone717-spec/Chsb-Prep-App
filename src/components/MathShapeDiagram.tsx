import { ReactNode } from 'react';
import { MathDiagramSpec, UILanguage } from '../types/quiz';

interface MathShapeDiagramProps {
  questionId: string;
  diagram?: MathDiagramSpec;
  lang: UILanguage;
  compact?: boolean;
}

const STROKE = '#0f172a';
const TEAL = '#0f766e';
const TEAL_FILL = 'rgba(20, 184, 166, 0.14)';
const SLATE_FILL = '#f1f5f9';
const MUTED = '#64748b';
const ACCENT = '#b45309';

function RightAngleMarker({
  x,
  y,
  dx = 12,
  dy = -12,
}: {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
}) {
  return (
    <path
      d={`M ${x + dx} ${y} L ${x + dx} ${y + dy} L ${x} ${y + dy}`}
      fill="none"
      stroke={TEAL}
      strokeWidth={1.75}
    />
  );
}

function renderDiagram(id: string): { labelUz: string; labelEn: string; svg: ReactNode } | null {
  switch (id) {
    // -------- EASY 2D SHAPES --------
    case 'm31':
      return {
        labelUz: 'Doira shakli (r = 7 sm)',
        labelEn: 'Circle diagram (r = 7 cm)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="56" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <circle cx="130" cy="85" r="3" fill={STROKE} />
            <line x1="130" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2.2" />
            <text x="158" y="77" textAnchor="middle" fontSize="13" fontWeight="700" fill={TEAL}>
              r = 7 cm
            </text>
          </svg>
        ),
      };

    case 'm32':
      return {
        labelUz: 'Doira diametri (d = 10 sm)',
        labelEn: 'Circle diagram (d = 10 cm)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="56" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="74" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2.2" />
            <circle cx="130" cy="85" r="2.8" fill={STROKE} />
            <text x="130" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill={TEAL}>
              d = 10 cm
            </text>
          </svg>
        ),
      };

    case 'm35':
      return {
        labelUz: 'L-shaklidagi murakkab figura',
        labelEn: 'L-shaped compound figure',
        svg: (
          <svg viewBox="0 0 280 170" className="h-full w-full">
            <path
              d="M 60 35 L 156 35 L 156 80 L 204 80 L 204 128 L 60 128 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <line x1="156" y1="80" x2="156" y2="128" stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="108" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="48" y="85" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
            <text x="180" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              3 cm
            </text>
            <text x="212" y="108" textAnchor="start" fontSize="12" fontWeight="700" fill={TEAL}>
              2 cm
            </text>
          </svg>
        ),
      };

    case 'm36':
      return {
        labelUz: "To'rtburchak va uchburchakdan tuzilgan shakl",
        labelEn: 'Rectangle + triangle compound shape',
        svg: (
          <svg viewBox="0 0 280 180" className="h-full w-full">
            <rect x="70" y="80" width="140" height="72" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="70,80 140,28 210,80" fill="rgba(180,83,9,0.12)" stroke={STROKE} strokeWidth="2.2" />
            <line x1="140" y1="28" x2="140" y2="80" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 3" />
            <RightAngleMarker x={140} y={80} dx={9} dy={-9} />
            <text x="148" y="60" fontSize="12" fontWeight="700" fill={ACCENT}>
              h = 3 cm
            </text>
            <text x="140" y="167" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              8 cm
            </text>
            <text x="220" y="120" fontSize="12" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
          </svg>
        ),
      };

    // -------- EASY 3D SHAPES --------
    case 'm38':
    case 'm42': {
      const dims = id === 'm38' ? ['5 cm', '4 cm', '3 cm'] : ['5 cm', '3 cm', '2 cm'];
      return {
        labelUz: 'Parallelepiped (3D shakl)',
        labelEn: 'Cuboid 3D diagram',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="60,65 165,65 165,135 60,135" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="60,65 102,33 207,33 165,65" fill="rgba(15,118,110,0.2)" stroke={STROKE} strokeWidth="2" />
            <polygon points="165,65 207,33 207,103 165,135" fill="rgba(15,23,42,0.08)" stroke={STROKE} strokeWidth="2" />
            <line x1="60" y1="135" x2="102" y2="103" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="102" y1="33" x2="102" y2="103" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="102" y1="103" x2="207" y2="103" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <text x="112" y="153" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {dims[0]}
            </text>
            <text x="195" y="126" fontSize="12" fontWeight="700" fill={TEAL}>
              {dims[1]}
            </text>
            <text x="48" y="104" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {dims[2]}
            </text>
          </svg>
        ),
      };
    }

    case 'm39':
      return {
        labelUz: 'Uchburchakli prizma',
        labelEn: 'Triangular prism',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="55,130 95,55 135,130" fill="rgba(15,118,110,0.24)" stroke={STROKE} strokeWidth="2.2" />
            <polygon points="95,55 185,35 225,110 135,130" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <line x1="55" y1="130" x2="145" y2="110" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="145" y1="110" x2="225" y2="110" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="145" y1="110" x2="185" y2="35" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <text x="95" y="112" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              15 cm²
            </text>
            <text x="188" y="133" fontSize="12" fontWeight="700" fill={STROKE}>
              8 cm
            </text>
          </svg>
        ),
      };

    case 'm40':
      return {
        labelUz: 'Silindr (asos yuzasi va balandligi)',
        labelEn: 'Cylinder diagram',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 48 L 85 128 A 45 14 0 0 0 175 128 L 175 48" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="48" rx="45" ry="14" fill="rgba(15,118,110,0.22)" stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="128" rx="45" ry="14" fill="none" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <text x="130" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              A = 20 cm²
            </text>
            <text x="185" y="92" fontSize="12" fontWeight="700" fill={STROKE}>
              h = 6 cm
            </text>
          </svg>
        ),
      };

    case 'm41':
      return {
        labelUz: 'Kub (qirrasi 4 sm)',
        labelEn: 'Cube (edge 4 cm)',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <rect x="75" y="60" width="76" height="76" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="75,60 107,32 183,32 151,60" fill="rgba(15,118,110,0.2)" stroke={STROKE} strokeWidth="2" />
            <polygon points="151,60 183,32 183,108 151,136" fill="rgba(15,23,42,0.08)" stroke={STROKE} strokeWidth="2" />
            <line x1="75" y1="136" x2="107" y2="108" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="107" y1="32" x2="107" y2="108" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="107" y1="108" x2="183" y2="108" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <text x="113" y="153" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
            <text x="64" y="102" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
          </svg>
        ),
      };

    case 'm43':
      return {
        labelUz: 'Parallelepiped simmetriya tekisliklari',
        labelEn: 'Cuboid reflective symmetry',
        svg: (
          <svg viewBox="0 0 270 175" className="h-full w-full">
            <rect x="65" y="62" width="102" height="70" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="65,62 103,32 205,32 167,62" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <polygon points="167,62 205,32 205,102 167,132" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <polygon points="116,62 154,32 154,102 116,132" fill="rgba(15,118,110,0.22)" stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 2" />
            <text x="116" y="150" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
            <text x="193" y="124" fontSize="11.5" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
            <text x="56" y="100" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              3 cm
            </text>
          </svg>
        ),
      };

    case 'm44':
      return {
        labelUz: 'Kub va simmetriya tekisligi',
        labelEn: 'Cube reflective symmetry',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <rect x="75" y="60" width="76" height="76" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="75,60 107,32 183,32 151,60" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <polygon points="151,60 183,32 183,108 151,136" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <polygon points="75,60 107,32 183,108 151,136" fill="rgba(15,118,110,0.22)" stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 2" />
            <line x1="113" y1="60" x2="113" y2="136" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        ),
      };

    // -------- EASY PYTHAGORAS --------
    case 'm45':
    case 'm46':
    case 'm47':
    case 'm48':
    case 'm49':
    case 'm50': {
      const map: Record<string, [string, string, string]> = {
        m45: ['3 cm', '4 cm', 'c = ?'],
        m46: ['6 cm', '8 cm', 'c = ?'],
        m47: ['a = ?', '5 cm', '13 cm'],
        m48: ['5 cm', '12 cm', '13 cm'],
        m49: ['8', '15', '17'],
        m50: ['a', 'b', 'c'],
      };
      const [legA, legB, hyp] = map[id];
      return {
        labelUz: "To'g'ri burchakli uchburchak",
        labelEn: 'Right-angled triangle',
        svg: (
          <svg viewBox="0 0 270 170" className="h-full w-full">
            <polygon points="65,130 65,38 205,130" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" strokeLinejoin="round" />
            <RightAngleMarker x={65} y={130} dx={13} dy={-13} />
            <text x="53" y="88" textAnchor="end" fontSize="13" fontWeight="700" fill={STROKE}>
              {legA}
            </text>
            <text x="135" y="150" textAnchor="middle" fontSize="13" fontWeight="700" fill={STROKE}>
              {legB}
            </text>
            <text x="150" y="76" fontSize="13" fontWeight="700" fill={TEAL}>
              {hyp}
            </text>
          </svg>
        ),
      };
    }

    // -------- MEDIUM 2D SHAPES --------
    case 'm81':
      return {
        labelUz: 'Yarim doira (d = 12 sm)',
        labelEn: 'Semicircle (d = 12 cm)',
        svg: (
          <svg viewBox="0 0 260 165" className="h-full w-full">
            <path d="M 55 118 A 75 75 0 0 1 205 118 Z" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <circle cx="130" cy="118" r="3" fill={STROKE} />
            <text x="130" y="140" textAnchor="middle" fontSize="13" fontWeight="700" fill={TEAL}>
              d = 12 cm
            </text>
          </svg>
        ),
      };

    case 'm82':
      return {
        labelUz: 'Aylana uzunligi C = 16π sm',
        labelEn: 'Circle (C = 16π cm)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="56" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="130" cy="85" r="3" fill={STROKE} />
            <text x="158" y="77" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              r = ?
            </text>
            <text x="130" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              C = 16π cm
            </text>
          </svg>
        ),
      };

    case 'm85':
      return {
        labelUz: "Burchagi kesilgan to'g'ri to'rtburchak",
        labelEn: 'Rectangle with triangle cut out',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <rect x="65" y="32" width="150" height="106" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="155,32 215,32 215,77" fill="#ffffff" stroke={ACCENT} strokeWidth="2" strokeDasharray="4 3" />
            <text x="140" y="156" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
            <text x="54" y="88" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              8 cm
            </text>
            <text x="185" y="25" textAnchor="middle" fontSize="11" fontWeight="700" fill={ACCENT}>
              4 cm
            </text>
            <text x="223" y="58" fontSize="11" fontWeight="700" fill={ACCENT}>
              3 cm
            </text>
          </svg>
        ),
      };

    case 'm86':
      return {
        labelUz: 'Stadion shakli (to‘rtburchak + 2 yarim doira)',
        labelEn: 'Stadium track shape',
        svg: (
          <svg viewBox="0 0 300 165" className="h-full w-full">
            <path
              d="M 85 45 L 215 45 A 40 40 0 0 1 215 125 L 85 125 A 40 40 0 0 1 85 45 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <line x1="85" y1="45" x2="85" y2="125" stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <line x1="215" y1="45" x2="215" y2="125" stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="150" y="36" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              50 m
            </text>
            <text x="150" y="90" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              d = 20 m
            </text>
          </svg>
        ),
      };

    case 'm87':
      return {
        labelUz: 'L-shaklni ikki to‘g‘ri to‘rtburchakka ajratish',
        labelEn: 'Decomposing an L-shape',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <path
              d="M 65 32 L 135 32 L 135 88 L 195 88 L 195 135 L 65 135 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <line x1="135" y1="88" x2="135" y2="135" stroke={ACCENT} strokeWidth="2" strokeDasharray="5 3" />
            <text x="100" y="90" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              A₁
            </text>
            <text x="165" y="116" textAnchor="middle" fontSize="12" fontWeight="700" fill={ACCENT}>
              A₂
            </text>
          </svg>
        ),
      };

    // -------- MEDIUM 3D SHAPES --------
    case 'm88':
    case 'm90': {
      const rTxt = id === 'm88' ? 'r = 4 cm' : 'r = 3 cm';
      const hTxt = id === 'm88' ? 'h = 10 cm' : 'h = 7 cm';
      return {
        labelUz: 'Silindr 3D shakli',
        labelEn: 'Cylinder 3D diagram',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 48 L 85 128 A 45 14 0 0 0 175 128 L 175 48" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="48" rx="45" ry="14" fill="rgba(15,118,110,0.22)" stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="128" rx="45" ry="14" fill="none" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="130" y1="48" x2="175" y2="48" stroke={TEAL} strokeWidth="2" />
            <text x="152" y="42" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              {rTxt}
            </text>
            <text x="186" y="92" fontSize="12" fontWeight="700" fill={STROKE}>
              {hTxt}
            </text>
          </svg>
        ),
      };
    }

    case 'm89':
      return {
        labelUz: "To'g'ri burchakli uchburchak prizma",
        labelEn: 'Right-triangular prism',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="55,132 55,62 125,132" fill="rgba(15,118,110,0.24)" stroke={STROKE} strokeWidth="2.2" />
            <polygon points="55,62 145,35 215,105 125,132" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <line x1="55" y1="132" x2="145" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="145" y1="35" x2="145" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="145" y1="105" x2="215" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <RightAngleMarker x={55} y={132} dx={10} dy={-10} />
            <text x="45" y="100" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="90" y="148" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
            <text x="182" y="130" fontSize="11.5" fontWeight="700" fill={TEAL}>
              12 cm
            </text>
          </svg>
        ),
      };

    case 'm91':
      return {
        labelUz: 'Kvadrat asosli piramida',
        labelEn: 'Square-based pyramid',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="65,132 155,132 195,105 105,105" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <line x1="105" y1="105" x2="195" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="65" y1="132" x2="105" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <polygon points="65,132 130,32 155,132" fill="rgba(15,118,110,0.14)" stroke={STROKE} strokeWidth="2.2" />
            <polygon points="155,132 130,32 195,105" fill="rgba(15,23,42,0.07)" stroke={STROKE} strokeWidth="2" />
            <line x1="130" y1="32" x2="105" y2="105" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1="130" y1="32" x2="110" y2="132" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="110" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="185" y="128" fontSize="11.5" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="90" y="84" textAnchor="end" fontSize="11" fontWeight="700" fill={ACCENT}>
              l = 5 cm
            </text>
          </svg>
        ),
      };

    case 'm92':
      return {
        labelUz: 'Teng yonli uchburchakli prizma',
        labelEn: 'Isosceles triangular prism',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="50,132 95,58 140,132" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="95,58 190,36 235,110 140,132" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <line x1="95" y1="58" x2="95" y2="132" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="95" y="149" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="64" y="90" textAnchor="end" fontSize="11" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
            <text x="101" y="108" fontSize="11" fontWeight="700" fill={ACCENT}>
              h=4
            </text>
            <text x="200" y="132" fontSize="11.5" fontWeight="700" fill={TEAL}>
              10 cm
            </text>
          </svg>
        ),
      };

    case 'm93':
      return {
        labelUz: 'Kvadrat asosli piramidaning simmetriya tekisligi',
        labelEn: 'Square-based pyramid symmetry',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="65,132 155,132 195,105 105,105" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="65,132 130,32 155,132" fill="rgba(15,23,42,0.04)" stroke={STROKE} strokeWidth="2" />
            <polygon points="155,132 130,32 195,105" fill="rgba(15,23,42,0.08)" stroke={STROKE} strokeWidth="2" />
            <polygon points="110,132 130,32 150,105" fill="rgba(15,118,110,0.25)" stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 2" />
          </svg>
        ),
      };

    case 'm94':
      return {
        labelUz: 'Silindrning markaziy simmetriya o‘qi',
        labelEn: 'Cylinder axis & symmetry planes',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 48 L 85 128 A 45 14 0 0 0 175 128 L 175 48" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <ellipse cx="130" cy="48" rx="45" ry="14" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <rect x="85" y="48" width="90" height="80" fill="rgba(15,118,110,0.12)" stroke="none" />
            <line x1="130" y1="22" x2="130" y2="152" stroke={TEAL} strokeWidth="2" strokeDasharray="5 3" />
          </svg>
        ),
      };

    // -------- MEDIUM PYTHAGORAS --------
    case 'm95':
      return {
        labelUz: 'Devorga suyangan narvon (15 m)',
        labelEn: 'Ladder against vertical wall',
        svg: (
          <svg viewBox="0 0 270 175" className="h-full w-full">
            <line x1="75" y1="25" x2="75" y2="140" stroke={STROKE} strokeWidth="3" />
            <line x1="55" y1="140" x2="215" y2="140" stroke={STROKE} strokeWidth="2.5" />
            <line x1="75" y1="42" x2="190" y2="140" stroke={ACCENT} strokeWidth="3.2" />
            <RightAngleMarker x={75} y={140} dx={12} dy={-12} />
            <text x="64" y="95" textAnchor="end" fontSize="12" fontWeight="700" fill={TEAL}>
              h = ?
            </text>
            <text x="132" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              9 m
            </text>
            <text x="148" y="84" fontSize="12" fontWeight="700" fill={ACCENT}>
              15 m
            </text>
          </svg>
        ),
      };

    case 'm96':
      return {
        labelUz: "To'g'ri to'rtburchak diagonali",
        labelEn: 'Rectangle diagonal',
        svg: (
          <svg viewBox="0 0 280 170" className="h-full w-full">
            <rect x="65" y="45" width="150" height="82" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="65" y1="127" x2="215" y2="45" stroke={ACCENT} strokeWidth="2.2" strokeDasharray="5 3" />
            <RightAngleMarker x={65} y={127} dx={12} dy={-12} />
            <text x="140" y="145" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              12 cm
            </text>
            <text x="223" y="90" fontSize="12" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
            <text x="136" y="79" textAnchor="middle" fontSize="12" fontWeight="700" fill={ACCENT}>
              d = ?
            </text>
          </svg>
        ),
      };

    case 'm97':
      return {
        labelUz: 'Koordinata tekisligida A(1,2) va B(7,10)',
        labelEn: 'Coordinate grid A(1,2) to B(7,10)',
        svg: (
          <svg viewBox="0 0 270 175" className="h-full w-full">
            <line x1="45" y1="145" x2="235" y2="145" stroke={MUTED} strokeWidth="1.5" />
            <line x1="45" y1="145" x2="45" y2="22" stroke={MUTED} strokeWidth="1.5" />
            <polygon points="75,125 195,125 195,40" fill={TEAL_FILL} stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <line x1="75" y1="125" x2="195" y2="40" stroke={STROKE} strokeWidth="2.4" />
            <circle cx="75" cy="125" r="4" fill={TEAL} />
            <circle cx="195" cy="40" r="4" fill={TEAL} />
            <text x="72" y="140" fontSize="11" fontWeight="700" fill={STROKE}>
              A(1, 2)
            </text>
            <text x="196" y="34" fontSize="11" fontWeight="700" fill={STROKE}>
              B(7, 10)
            </text>
          </svg>
        ),
      };

    case 'm98':
      return {
        labelUz: "To'g'ri burchakli uchburchak (7 sm, 24 sm)",
        labelEn: 'Right-angled triangle (7 cm, 24 cm)',
        svg: (
          <svg viewBox="0 0 280 165" className="h-full w-full">
            <polygon points="55,128 55,64 225,128" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <RightAngleMarker x={55} y={128} dx={11} dy={-11} />
            <text x="45" y="99" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              7 cm
            </text>
            <text x="140" y="147" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              24 cm
            </text>
            <text x="150" y="88" fontSize="12" fontWeight="700" fill={TEAL}>
              c = ?
            </text>
          </svg>
        ),
      };

    case 'm99':
      return {
        labelUz: 'Teng yonli uchburchak (10 sm, 10 sm, asos 12 sm)',
        labelEn: 'Isosceles triangle',
        svg: (
          <svg viewBox="0 0 270 175" className="h-full w-full">
            <polygon points="65,136 135,36 205,136" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="135" y1="36" x2="135" y2="136" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 3" />
            <RightAngleMarker x={135} y={136} dx={10} dy={-10} />
            <text x="90" y="80" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
            <text x="180" y="80" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
            <text x="142" y="100" fontSize="12" fontWeight="700" fill={ACCENT}>
              h = ?
            </text>
            <text x="135" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              12 cm
            </text>
          </svg>
        ),
      };

    case 'm100':
      return {
        labelUz: 'Masshtablangan Pifagor uchburchagi',
        labelEn: 'Scaled Pythagorean triple',
        svg: (
          <svg viewBox="0 0 270 170" className="h-full w-full">
            <polygon points="65,130 65,42 195,130" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <RightAngleMarker x={65} y={130} dx={12} dy={-12} />
            <text x="54" y="90" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              3k
            </text>
            <text x="130" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              4k
            </text>
            <text x="142" y="78" fontSize="12" fontWeight="700" fill={TEAL}>
              5k
            </text>
          </svg>
        ),
      };

    // -------- HARD 2D SHAPES --------
    case 'm131':
      return {
        labelUz: 'Doira sektori (r = 6 sm, 60°)',
        labelEn: 'Circle sector (r = 6 cm, 60°)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <path
              d="M 100 130 L 185 130 A 85 85 0 0 0 142.5 56.4 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path d="M 122 130 A 22 22 0 0 0 111 111" fill="none" stroke={ACCENT} strokeWidth="2" />
            <text x="130" y="118" fontSize="11.5" fontWeight="700" fill={ACCENT}>
              60°
            </text>
            <text x="145" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              r = 6 cm
            </text>
          </svg>
        ),
      };

    case 'm132':
      return {
        labelUz: 'Velosiped g‘ildiragi (d = 70 sm)',
        labelEn: 'Wheel diagram (d = 70 cm)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="56" fill="none" stroke={STROKE} strokeWidth="4" />
            <circle cx="130" cy="85" r="46" fill={TEAL_FILL} stroke={TEAL} strokeWidth="1.2" />
            <line x1="74" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2" />
            <circle cx="130" cy="85" r="4" fill={STROKE} />
            <text x="130" y="76" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              d = 70 cm
            </text>
          </svg>
        ),
      };

    case 'm133':
      return {
        labelUz: 'Mikrochip shakli (4.5 mm × 2 mm)',
        labelEn: 'Rectangular microchip (4.5 mm × 2 mm)',
        svg: (
          <svg viewBox="0 0 270 165" className="h-full w-full">
            <rect x="65" y="50" width="140" height="64" rx="4" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <text x="135" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              4.5 mm
            </text>
            <text x="215" y="86" fontSize="12" fontWeight="700" fill={TEAL}>
              2 mm
            </text>
          </svg>
        ),
      };

    case 'm135':
      return {
        labelUz: 'Kvadrat ichiga chizilgan doira (d = 10 sm)',
        labelEn: 'Circle inscribed inside a 10 cm square',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <rect x="75" y="30" width="110" height="110" fill="rgba(180,83,9,0.16)" stroke={STROKE} strokeWidth="2.2" />
            <circle cx="130" cy="85" r="55" fill="#ffffff" stroke={TEAL} strokeWidth="2.2" />
            <line x1="75" y1="85" x2="185" y2="85" stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="130" y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              d = 10 cm
            </text>
            <text x="130" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
          </svg>
        ),
      };

    case 'm136':
      return {
        labelUz: 'Uchburchak + yarim doira murakkab belgisi',
        labelEn: 'Compound badge (triangle + semicircle)',
        svg: (
          <svg viewBox="0 0 260 180" className="h-full w-full">
            <polygon points="80,104 130,30 180,104" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <path d="M 80 104 A 50 50 0 0 0 180 104 Z" fill="rgba(180,83,9,0.15)" stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="30" x2="130" y2="104" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="136" y="75" fontSize="11.5" fontWeight="700" fill={ACCENT}>
              h = 6 cm
            </text>
            <text x="130" y="122" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              8 cm
            </text>
          </svg>
        ),
      };

    case 'm137':
      return {
        labelUz: 'Yarim doira perimetri (r = 5 sm)',
        labelEn: 'Semicircle perimeter (r = 5 cm)',
        svg: (
          <svg viewBox="0 0 260 165" className="h-full w-full">
            <path d="M 58 118 A 72 72 0 0 1 202 118 Z" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.4" />
            <circle cx="130" cy="118" r="3" fill={STROKE} />
            <text x="166" y="136" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              r = 5 cm
            </text>
          </svg>
        ),
      };

    // -------- HARD 3D SHAPES --------
    case 'm138':
      return {
        labelUz: 'Silindrsimon suv idishi (r = 5 sm)',
        labelEn: 'Cylindrical tank (r = 5 cm)',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 48 L 85 128 A 45 14 0 0 0 175 128 L 175 48" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="48" rx="45" ry="14" fill="rgba(15,118,110,0.2)" stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="48" x2="175" y2="48" stroke={TEAL} strokeWidth="2" />
            <text x="152" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              r = 5 cm
            </text>
            <text x="184" y="92" fontSize="12" fontWeight="700" fill={STROKE}>
              h = ?
            </text>
            <text x="130" y="160" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              V = 200π cm³
            </text>
          </svg>
        ),
      };

    case 'm139':
      return {
        labelUz: 'Trapetsiya asosli prizma',
        labelEn: 'Trapezium prism',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="50,132 72,72 122,72 144,132" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="72,72 155,44 205,44 122,72" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <polygon points="122,72 205,44 227,104 144,132" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <line x1="72" y1="72" x2="72" y2="132" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="97" y="66" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              5 cm
            </text>
            <text x="97" y="149" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              9 cm
            </text>
            <text x="77" y="108" fontSize="10.5" fontWeight="700" fill={ACCENT}>
              h=4
            </text>
            <text x="195" y="128" fontSize="11.5" fontWeight="700" fill={TEAL}>
              10 cm
            </text>
          </svg>
        ),
      };

    case 'm140':
      return {
        labelUz: 'Ochiq tepali silindr idish',
        labelEn: 'Open-top cylindrical tin',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 45 L 85 130 A 45 14 0 0 0 175 130 L 175 45" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <ellipse cx="130" cy="45" rx="45" ry="14" fill="#ffffff" stroke={ACCENT} strokeWidth="2" strokeDasharray="5 3" />
            <line x1="130" y1="45" x2="175" y2="45" stroke={TEAL} strokeWidth="2" />
            <text x="152" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              r = 5 cm
            </text>
            <text x="184" y="92" fontSize="12" fontWeight="700" fill={STROKE}>
              h = 12 cm
            </text>
          </svg>
        ),
      };

    case 'm141':
      return {
        labelUz: 'Kub (sirt yuzasi 150 sm²)',
        labelEn: 'Cube (surface area 150 cm²)',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <rect x="75" y="56" width="76" height="76" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="75,56 107,28 183,28 151,56" fill="rgba(15,118,110,0.2)" stroke={STROKE} strokeWidth="2" />
            <polygon points="151,56 183,28 183,104 151,132" fill="rgba(15,23,42,0.08)" stroke={STROKE} strokeWidth="2" />
            <text x="113" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              s = ? (SA = 150 cm²)
            </text>
          </svg>
        ),
      };

    case 'm142':
      return {
        labelUz: 'Kesilgan parallelepiped (6 × 4 × 3 sm)',
        labelEn: 'Sliced cuboid (6 × 4 × 3 cm)',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <rect x="55" y="62" width="115" height="68" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="55,62 93,32 208,32 170,62" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <polygon points="170,62 208,32 208,100 170,130" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <polygon points="112,62 150,32 150,100 112,130" fill="rgba(180,83,9,0.24)" stroke={ACCENT} strokeWidth="2" strokeDasharray="4 2" />
            <text x="112" y="148" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              6 cm
            </text>
            <text x="195" y="122" fontSize="11.5" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
            <text x="46" y="100" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              3 cm
            </text>
          </svg>
        ),
      };

    case 'm143':
      return {
        labelUz: 'Muntazam oltiburchakli prizma',
        labelEn: 'Regular hexagonal prism',
        svg: (
          <svg viewBox="0 0 260 180" className="h-full w-full">
            <polygon
              points="95,30 165,30 192,52 165,74 95,74 68,52"
              fill="rgba(15,118,110,0.22)"
              stroke={STROKE}
              strokeWidth="2"
            />
            <polygon points="68,52 95,74 95,144 68,122" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="95,74 165,74 165,144 95,144" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="165,74 192,52 192,122 165,144" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <line x1="68" y1="88" x2="192" y2="88" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
        ),
      };

    case 'm144':
      return {
        labelUz: 'Piramida kesimi (uchidan o‘tuvchi tekislik)',
        labelEn: 'Cross-section of square pyramid',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="65,132 155,132 195,105 105,105" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="65,132 130,32 155,132" fill="rgba(15,23,42,0.04)" stroke={STROKE} strokeWidth="2" />
            <polygon points="155,132 130,32 195,105" fill="rgba(15,23,42,0.08)" stroke={STROKE} strokeWidth="2" />
            <polygon points="110,132 130,32 150,105" fill="rgba(180,83,9,0.26)" stroke={ACCENT} strokeWidth="2" />
          </svg>
        ),
      };

    // -------- HARD PYTHAGORAS --------
    case 'm145':
      return {
        labelUz: 'Parallelepipedning ichki fazoviy diagonali',
        labelEn: 'Cuboid internal space diagonal',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <rect x="65" y="42" width="90" height="88" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="65,42 108,20 198,20 155,42" fill="#e2e8f0" stroke={STROKE} strokeWidth="2" />
            <polygon points="155,42 198,20 198,108 155,130" fill="#cbd5e1" stroke={STROKE} strokeWidth="2" />
            <line x1="65" y1="130" x2="198" y2="108" stroke={MUTED} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="65" y1="130" x2="198" y2="20" stroke={ACCENT} strokeWidth="2.4" />
            <text x="110" y="148" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              3 cm
            </text>
            <text x="188" y="128" fontSize="11.5" fontWeight="700" fill={STROKE}>
              4 cm
            </text>
            <text x="54" y="88" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              12 cm
            </text>
          </svg>
        ),
      };

    case 'm146':
      return {
        labelUz: "Kema yo'nalishi (12 km E, 12 km N, 4 km E)",
        labelEn: 'Ship displacement diagram',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polyline points="55,135 165,135 165,45 205,45" fill="none" stroke={STROKE} strokeWidth="2.4" />
            <line x1="55" y1="135" x2="205" y2="45" stroke={TEAL} strokeWidth="2" strokeDasharray="5 3" />
            <circle cx="55" cy="135" r="4" fill={STROKE} />
            <circle cx="205" cy="45" r="4" fill={TEAL} />
            <text x="110" y="152" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              12 km E
            </text>
            <text x="155" y="95" textAnchor="end" fontSize="11" fontWeight="700" fill={STROKE}>
              12 km N
            </text>
            <text x="185" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              4 km E
            </text>
          </svg>
        ),
      };

    case 'm147':
      return {
        labelUz: 'Teng tomonli uchburchak (10 sm)',
        labelEn: 'Equilateral triangle (side 10 cm)',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="65,138 130,32 195,138" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="32" x2="130" y2="138" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 3" />
            <RightAngleMarker x={130} y={138} dx={10} dy={-10} />
            <text x="88" y="80" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
            <text x="172" y="80" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
            <text x="130" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              10 cm
            </text>
          </svg>
        ),
      };

    case 'm148':
      return {
        labelUz: 'Doira vatari (16 sm) va markazgacha masofa (6 sm)',
        labelEn: 'Circle chord (16 cm) at 6 cm from centre',
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <circle cx="130" cy="85" r="58" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="82" y1="118" x2="178" y2="118" stroke={STROKE} strokeWidth="2.4" />
            <line x1="130" y1="85" x2="130" y2="118" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 2" />
            <line x1="130" y1="85" x2="178" y2="118" stroke={TEAL} strokeWidth="2" />
            <RightAngleMarker x={130} y={118} dx={9} dy={-9} />
            <circle cx="130" cy="85" r="3" fill={STROKE} />
            <text x="122" y="105" textAnchor="end" fontSize="11" fontWeight="700" fill={ACCENT}>
              6 cm
            </text>
            <text x="130" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              16 cm
            </text>
            <text x="160" y="96" fontSize="11.5" fontWeight="700" fill={TEAL}>
              r = ?
            </text>
          </svg>
        ),
      };

    case 'm149':
      return {
        labelUz: 'Uchburchak tomonlari (9, 40, 41 sm)',
        labelEn: 'Triangle (9 cm, 40 cm, 41 cm)',
        svg: (
          <svg viewBox="0 0 280 165" className="h-full w-full">
            <polygon points="55,128 55,68 225,128" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <text x="45" y="102" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              9 cm
            </text>
            <text x="140" y="147" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              40 cm
            </text>
            <text x="148" y="90" fontSize="12" fontWeight="700" fill={TEAL}>
              41 cm
            </text>
          </svg>
        ),
      };

    case 'm150':
      return {
        labelUz: "Tomonlari x, x+1, x+2 bo'lgan to'g'ri burchakli uchburchak",
        labelEn: 'Right triangle with sides x, x+1, x+2',
        svg: (
          <svg viewBox="0 0 270 170" className="h-full w-full">
            <polygon points="65,130 65,42 195,130" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <RightAngleMarker x={65} y={130} dx={12} dy={-12} />
            <text x="53" y="90" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              x
            </text>
            <text x="130" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              x + 1
            </text>
            <text x="144" y="78" fontSize="12" fontWeight="700" fill={TEAL}>
              x + 2
            </text>
          </svg>
        ),
      };

    default:
      return null;
  }
}

function renderSpecDiagram(spec: MathDiagramSpec): { labelUz: string; labelEn: string; svg: ReactNode } {
  switch (spec.kind) {
    case 'circle':
      return {
        labelUz: `Doira (${spec.mode} = ${spec.valueLabel})`,
        labelEn: `Circle (${spec.mode} = ${spec.valueLabel})`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="56" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <circle cx="130" cy="85" r="3" fill={STROKE} />
            {spec.mode === 'r' ? (
              <>
                <line x1="130" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2.2" />
                <text x="158" y="77" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
                  r = {spec.valueLabel}
                </text>
              </>
            ) : (
              <>
                <line x1="74" y1="85" x2="186" y2="85" stroke={TEAL} strokeWidth="2.2" />
                <text x="130" y="77" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
                  d = {spec.valueLabel}
                </text>
              </>
            )}
          </svg>
        ),
      };

    case 'semicircle':
      return {
        labelUz: `Yarim doira (${spec.mode} = ${spec.valueLabel})`,
        labelEn: `Semicircle (${spec.mode} = ${spec.valueLabel})`,
        svg: (
          <svg viewBox="0 0 260 160" className="h-full w-full">
            <path
              d="M 55 115 A 75 75 0 0 1 205 115 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <circle cx="130" cy="115" r="3" fill={STROKE} />
            {spec.mode === 'r' ? (
              <line x1="130" y1="115" x2="205" y2="115" stroke={TEAL} strokeWidth="2.4" />
            ) : (
              <line x1="55" y1="115" x2="205" y2="115" stroke={TEAL} strokeWidth="2.4" />
            )}
            <text x="130" y="135" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              {spec.mode} = {spec.valueLabel}
            </text>
          </svg>
        ),
      };

    case 'sector': {
      const rad = (spec.angle * Math.PI) / 180;
      const rPx = 74;
      const cx = 90;
      const cy = 128;
      const x2 = cx + rPx * Math.cos(-rad);
      const y2 = cy + rPx * Math.sin(-rad);
      const largeArc = spec.angle > 180 ? 1 : 0;
      return {
        labelUz: `Doira sektori (r = ${spec.r} sm, ${spec.angle}°)` ,
        labelEn: `Circle sector (r = ${spec.r} cm, ${spec.angle}°)`,
        svg: (
          <svg viewBox="0 0 260 165" className="h-full w-full">
            <path
              d={`M ${cx} ${cy} L ${cx + rPx} ${cy} A ${rPx} ${rPx} 0 ${largeArc} 0 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <text x={cx + rPx / 2} y={cy + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              r = {spec.r} cm
            </text>
            <text x={cx + 26} y={cy - 12} fontSize="12" fontWeight="700" fill={TEAL}>
              {spec.angle}°
            </text>
          </svg>
        ),
      };
    }

    case 'rect': {
      const u = spec.unit ?? 'cm';
      return {
        labelUz: `To'g'ri to'rtburchak (${spec.w} ${u} × ${spec.h} ${u})`,
        labelEn: `Rectangle (${spec.w} ${u} × ${spec.h} ${u})`,
        svg: (
          <svg viewBox="0 0 270 165" className="h-full w-full">
            <rect x="65" y="34" width="140" height="86" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            {spec.diagonal && (
              <>
                <line x1="65" y1="120" x2="205" y2="34" stroke={TEAL} strokeWidth="2.2" strokeDasharray="5 3" />
                <RightAngleMarker x={205} y={120} dx={-12} dy={-12} />
                <text x="132" y="72" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
                  d = {spec.diagonal}
                </text>
              </>
            )}
            <text x="135" y="138" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.w} {u}
            </text>
            <text x="213" y="81" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.h} {u}
            </text>
          </svg>
        ),
      };
    }

    case 'lshape':
      return {
        labelUz: 'L-shakl (murakkab 2D shakl)',
        labelEn: 'Compound L-shape diagram',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <path
              d="M 55 28 L 215 28 L 215 80 L 140 80 L 140 138 L 55 138 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <line x1="140" y1="28" x2="140" y2="80" stroke={MUTED} strokeWidth="1.3" strokeDasharray="4 3" />
            <text x="135" y="21" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.outerW} cm
            </text>
            <text x="45" y="88" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.outerH} cm
            </text>
            <text x="180" y="96" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              cut {spec.cutW}×{spec.cutH}
            </text>
          </svg>
        ),
      };

    case 'rect_tri':
      return {
        labelUz: "To'g'ri to'rtburchak va uchburchakdan tuzilgan shakl",
        labelEn: 'Compound shape: rectangle + triangle',
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <rect x="55" y="68" width="120" height="72" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <polygon points="175,68 235,140 175,140" fill="rgba(180, 83, 9, 0.14)" stroke={STROKE} strokeWidth="2.2" />
            <text x="115" y="156" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.w} cm
            </text>
            <text x="45" y="108" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.hRect} cm
            </text>
            <text x="212" y="96" fontSize="11.5" fontWeight="700" fill={ACCENT}>
              b={spec.hTri}
            </text>
          </svg>
        ),
      };

    case 'rect_minus_semi':
      return {
        labelUz: `To'g'ri to'rtburchakdan yarim doira kesib olingan (${spec.w}×${spec.h} sm)`,
        labelEn: `Rectangle minus semicircle (${spec.w}×${spec.h} cm, d=${spec.d} cm)`,
        svg: (
          <svg viewBox="0 0 280 165" className="h-full w-full">
            <path
              d="M 60 35 L 220 35 L 220 130 L 176 130 A 36 36 0 0 0 104 130 L 60 130 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <line x1="104" y1="130" x2="176" y2="130" stroke={TEAL} strokeWidth="1.6" strokeDasharray="4 3" />
            <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.w} cm
            </text>
            <text x="50" y="85" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.h} cm
            </text>
            <text x="140" y="147" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              d = {spec.d} cm
            </text>
          </svg>
        ),
      };

    case 'stadium':
      return {
        labelUz: `Yugurish yo'lagi shakli (${spec.straight} m, d = ${spec.d} m)`,
        labelEn: `Running track shape (${spec.straight} m, d = ${spec.d} m)`,
        svg: (
          <svg viewBox="0 0 280 160" className="h-full w-full">
            <path
              d="M 85 45 L 195 45 A 35 35 0 0 1 195 115 L 85 115 A 35 35 0 0 1 85 45 Z"
              fill={TEAL_FILL}
              stroke={STROKE}
              strokeWidth="2.2"
            />
            <line x1="85" y1="45" x2="85" y2="115" stroke={MUTED} strokeWidth="1.3" strokeDasharray="4 3" />
            <line x1="195" y1="45" x2="195" y2="115" stroke={MUTED} strokeWidth="1.3" strokeDasharray="4 3" />
            <text x="140" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.straight} m
            </text>
            <text x="140" y="84" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              d = {spec.d} m
            </text>
          </svg>
        ),
      };

    case 'square_minus_circle':
      return {
        labelUz: `Kvadrat (${spec.s}×${spec.s} sm) ichidagi doira`,
        labelEn: `Circle inscribed in ${spec.s}×${spec.s} cm square`,
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <rect x="75" y="25" width="110" height="110" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <circle cx="130" cy="80" r="55" fill="#ffffff" stroke={TEAL} strokeWidth="2.2" />
            <line x1="75" y1="80" x2="185" y2="80" stroke={TEAL} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="130" y="153" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.s} cm
            </text>
            <text x="130" y="73" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              d = {spec.s} cm
            </text>
          </svg>
        ),
      };

    case 'tri_plus_semi':
      return {
        labelUz: `Uchburchak (${spec.base}×${spec.h} sm) va yarim doira`,
        labelEn: `Triangle (b=${spec.base}, h=${spec.h}) + semicircle`,
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 80 95 A 50 50 0 0 0 180 95 Z" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="80,95 180,95 130,28" fill="rgba(180, 83, 9, 0.14)" stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="28" x2="130" y2="95" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="142" y="68" fontSize="11.5" fontWeight="700" fill={ACCENT}>
              h={spec.h}
            </text>
            <text x="130" y="112" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              d = {spec.base} cm
            </text>
          </svg>
        ),
      };

    case 'cube':
      return {
        labelUz: `Kub (${spec.sLabel})`,
        labelEn: `Cube (${spec.sLabel})`,
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="75,62 155,62 155,142 75,142" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.1" />
            <polygon points="75,62 108,36 188,36 155,62" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2.1" />
            <polygon points="155,62 188,36 188,116 155,142" fill="rgba(20, 184, 166, 0.24)" stroke={STROKE} strokeWidth="2.1" />
            <text x="115" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEAL}>
              {spec.sLabel}
            </text>
          </svg>
        ),
      };

    case 'cuboid':
      return {
        labelUz: `Parallelepiped (${spec.l}×${spec.w}×${spec.h} sm)`,
        labelEn: `Cuboid (${spec.l}×${spec.w}×${spec.h} cm)`,
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="55,66 175,66 175,134 55,134" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="55,66 95,38 215,38 175,66" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="175,66 215,38 215,106 175,134" fill="rgba(20, 184, 166, 0.24)" stroke={STROKE} strokeWidth="2" />
            {spec.diagonal && (
              <line x1="55" y1="134" x2="215" y2="38" stroke="#be123c" strokeWidth="2.2" />
            )}
            {spec.sliced && (
              <polygon points="115,66 155,38 155,106 115,134" fill="rgba(190, 18, 60, 0.2)" stroke="#be123c" strokeWidth="1.8" strokeDasharray="4 3" />
            )}
            <text x="115" y="152" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.l} cm
            </text>
            <text x="206" y="128" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.w} cm
            </text>
            <text x="45" y="104" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.h} cm
            </text>
          </svg>
        ),
      };

    case 'tri_prism':
      return {
        labelUz: `Uchburchakli prizma (${spec.b}×${spec.h}×${spec.len} sm)`,
        labelEn: `Triangular prism (${spec.b}×${spec.h}×${spec.len} cm)`,
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="58,130 132,130 58,64" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.1" />
            <polygon points="58,64 134,36 208,102 132,130" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <line x1="132" y1="130" x2="208" y2="102" stroke={STROKE} strokeWidth="2" />
            <RightAngleMarker x={58} y={130} dx={10} dy={-10} />
            <text x="95" y="147" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.b} cm
            </text>
            <text x="48" y="100" textAnchor="end" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.h} cm
            </text>
            <text x="184" y="126" fontSize="11.5" fontWeight="700" fill={TEAL}>
              L={spec.len}
            </text>
          </svg>
        ),
      };

    case 'cylinder':
      return {
        labelUz: `Silindr (r = ${spec.r} sm, h = ${spec.unknownH ? '?' : `${spec.h} sm`})`,
        labelEn: `Cylinder (r = ${spec.r} cm, h = ${spec.unknownH ? '?' : `${spec.h} cm`})`,
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <path d="M 85 45 L 85 130 A 45 14 0 0 0 175 130 L 175 45 Z" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2" />
            <ellipse
              cx="130"
              cy="45"
              rx="45"
              ry="14"
              fill={spec.openTop ? '#ffffff' : SLATE_FILL}
              stroke={STROKE}
              strokeWidth="2"
              strokeDasharray={spec.openTop ? '4 3' : undefined}
            />
            <line x1="130" y1="45" x2="175" y2="45" stroke={TEAL} strokeWidth="2" />
            <text x="152" y="39" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEAL}>
              r={spec.r}
            </text>
            <text x="184" y="92" fontSize="12" fontWeight="700" fill={STROKE}>
              h = {spec.unknownH ? '?' : `${spec.h} cm`}
            </text>
          </svg>
        ),
      };

    case 'trap_prism':
      return {
        labelUz: `Trapetsiya prizma (${spec.a}, ${spec.b}, h=${spec.h}, L=${spec.len})`,
        labelEn: `Trapezium prism (${spec.a}, ${spec.b}, h=${spec.h}, L=${spec.len})`,
        svg: (
          <svg viewBox="0 0 280 175" className="h-full w-full">
            <polygon points="60,130 140,130 124,78 76,78" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.1" />
            <polygon points="76,78 124,78 190,46 142,46" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2" />
            <polygon points="124,78 190,46 206,98 140,130" fill="rgba(20, 184, 166, 0.22)" stroke={STROKE} strokeWidth="2" />
            <text x="100" y="147" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              {spec.b} cm
            </text>
            <text x="100" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              {spec.a} cm
            </text>
            <text x="184" y="122" fontSize="11.5" fontWeight="700" fill={TEAL}>
              L={spec.len} cm
            </text>
          </svg>
        ),
      };

    case 'pyramid':
      return {
        labelUz: `Kvadrat asosli piramida (${spec.base}×${spec.base} sm, balandlik ${spec.slant} sm)`,
        labelEn: `Square pyramid (${spec.base}×${spec.base} cm, slant h=${spec.slant} cm)`,
        svg: (
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <polygon points="65,134 155,134 195,104 105,104" fill={SLATE_FILL} stroke={STROKE} strokeWidth="1.8" />
            <polygon points="65,134 155,134 130,34" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.1" />
            <polygon points="155,134 195,104 130,34" fill="rgba(20, 184, 166, 0.22)" stroke={STROKE} strokeWidth="2.1" />
            <line x1="130" y1="34" x2="110" y2="134" stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="110" y="152" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.base} cm
            </text>
            <text x="148" y="88" fontSize="11.5" fontWeight="700" fill={TEAL}>
              h={spec.slant}
            </text>
          </svg>
        ),
      };

    case 'prism_sym':
      return {
        labelUz: `Muntazam ${spec.sides}-burchakli prizma simmetriyasi`,
        labelEn: `Regular ${spec.sides}-sided prism symmetry`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            {Array.from({ length: spec.sides }).map((_, idx) => {
              const a1 = (2 * Math.PI * idx) / spec.sides - Math.PI / 2;
              const a2 = (2 * Math.PI * (idx + 1)) / spec.sides - Math.PI / 2;
              const r = 48;
              const x1 = 130 + r * Math.cos(a1);
              const y1 = 85 + r * Math.sin(a1);
              const x2 = 130 + r * Math.cos(a2);
              const y2 = 85 + r * Math.sin(a2);
              return (
                <g key={idx}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="2.2" />
                  <line x1={130} y1={85} x2={x1} y2={y1} stroke={TEAL} strokeWidth="1.2" strokeDasharray="3 3" />
                </g>
              );
            })}
            <circle cx="130" cy="85" r="3" fill={TEAL} />
            <text x="130" y="155" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={TEAL}>
              n = {spec.sides}
            </text>
          </svg>
        ),
      };

    case 'right_tri':
      return {
        labelUz: `To'g'ri burchakli uchburchak (${spec.a}, ${spec.b}, ${spec.c})`,
        labelEn: `Right triangle (${spec.a}, ${spec.b}, ${spec.c})`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <polygon points="65,130 65,42 195,130" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            {!spec.showCheck && <RightAngleMarker x={65} y={130} dx={12} dy={-12} />}
            <text x="54" y="90" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.a}
            </text>
            <text x="130" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.b}
            </text>
            <text x="142" y="78" fontSize="12" fontWeight="700" fill={TEAL}>
              {spec.c}
            </text>
          </svg>
        ),
      };

    case 'ladder':
      return {
        labelUz: 'Devorga suyalgan narvon (Pifagor)',
        labelEn: 'Ladder against wall (Pythagoras)',
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <line x1="72" y1="26" x2="72" y2="136" stroke={MUTED} strokeWidth="4" />
            <line x1="60" y1="136" x2="215" y2="136" stroke={MUTED} strokeWidth="3" />
            <line x1="72" y1="42" x2="184" y2="136" stroke={TEAL} strokeWidth="3.2" />
            <RightAngleMarker x={72} y={136} dx={12} dy={-12} />
            <text x="62" y="92" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.wall}
            </text>
            <text x="128" y="153" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.base}
            </text>
            <text x="140" y="80" fontSize="12" fontWeight="700" fill={TEAL}>
              {spec.len}
            </text>
          </svg>
        ),
      };

    case 'chord':
      return {
        labelUz: `Aylana vatari (${spec.chordLen} sm, masofa ${spec.dist} sm)`,
        labelEn: `Circle chord (${spec.chordLen} cm, distance ${spec.dist} cm)`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <circle cx="130" cy="85" r="58" fill={SLATE_FILL} stroke={STROKE} strokeWidth="2.1" />
            <line x1="84" y1="120" x2="176" y2="120" stroke={STROKE} strokeWidth="2.4" />
            <line x1="130" y1="85" x2="130" y2="120" stroke={ACCENT} strokeWidth="2" />
            <line x1="130" y1="85" x2="176" y2="120" stroke={TEAL} strokeWidth="2.2" />
            <RightAngleMarker x={130} y={120} dx={9} dy={-9} />
            <circle cx="130" cy="85" r="3" fill={STROKE} />
            <text x="122" y="106" textAnchor="end" fontSize="11.5" fontWeight="700" fill={ACCENT}>
              {spec.dist}
            </text>
            <text x="130" y="136" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={STROKE}>
              {spec.chordLen} cm
            </text>
            <text x="160" y="98" fontSize="11.5" fontWeight="700" fill={TEAL}>
              r = ?
            </text>
          </svg>
        ),
      };

    case 'equilateral':
      return {
        labelUz: `Teng tomonli uchburchak (a = ${spec.s} sm)`,
        labelEn: `Equilateral triangle (side = ${spec.s} cm)`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <polygon points="75,134 185,134 130,36" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="130" y1="36" x2="130" y2="134" stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 3" />
            <RightAngleMarker x={130} y={134} dx={10} dy={-10} />
            <text x="130" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.s} cm
            </text>
            <text x="92" y="80" textAnchor="end" fontSize="12" fontWeight="700" fill={STROKE}>
              {spec.s} cm
            </text>
          </svg>
        ),
      };

    case 'coords':
      return {
        labelUz: `Koordinata masofasi (${spec.x1},${spec.y1}) → (${spec.x2},${spec.y2})`,
        labelEn: `Coordinate distance (${spec.x1},${spec.y1}) to (${spec.x2},${spec.y2})`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <line x1="45" y1="135" x2="225" y2="135" stroke={MUTED} strokeWidth="1.6" />
            <line x1="55" y1="20" x2="55" y2="145" stroke={MUTED} strokeWidth="1.6" />
            <polygon points="85,120 185,120 185,48" fill={TEAL_FILL} stroke={TEAL} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="85" y1="120" x2="185" y2="48" stroke={STROKE} strokeWidth="2.4" />
            <circle cx="85" cy="120" r="4" fill={TEAL} />
            <circle cx="185" cy="48" r="4" fill={TEAL} />
            <text x="85" y="133" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              ({spec.x1},{spec.y1})
            </text>
            <text x="190" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill={STROKE}>
              ({spec.x2},{spec.y2})
            </text>
          </svg>
        ),
      };

    case 'rhombus':
      return {
        labelUz: `Romb diagonallari (${spec.d1} sm va ${spec.d2} sm)`,
        labelEn: `Rhombus with diagonals ${spec.d1} cm & ${spec.d2} cm`,
        svg: (
          <svg viewBox="0 0 260 170" className="h-full w-full">
            <polygon points="130,26 205,85 130,144 55,85" fill={TEAL_FILL} stroke={STROKE} strokeWidth="2.2" />
            <line x1="55" y1="85" x2="205" y2="85" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="130" y1="26" x2="130" y2="144" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="4 3" />
            <RightAngleMarker x={130} y={85} dx={9} dy={-9} />
            <text x="172" y="79" fontSize="11" fontWeight="700" fill={ACCENT}>
              {spec.d1} cm
            </text>
            <text x="138" y="122" fontSize="11" fontWeight="700" fill={ACCENT}>
              {spec.d2} cm
            </text>
            <text x="176" y="48" fontSize="12" fontWeight="700" fill={TEAL}>
              s = ?
            </text>
          </svg>
        ),
      };
  }
}

export function MathShapeDiagram({ questionId, diagram, lang, compact = false }: MathShapeDiagramProps) {
  const rendered = diagram ? renderSpecDiagram(diagram) : renderDiagram(questionId);
  if (!rendered) return null;

  return (
    <figure
      className={`my-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3 ${
        compact ? 'max-w-[260px]' : 'max-w-[320px]'
      }`}
    >
      <div className={compact ? 'h-28 w-full' : 'h-36 w-full'}>{rendered.svg}</div>
      <figcaption className="mt-1 text-center text-[11px] font-medium text-slate-500">
        {lang === 'uz' ? rendered.labelUz : rendered.labelEn}
      </figcaption>
    </figure>
  );
}
