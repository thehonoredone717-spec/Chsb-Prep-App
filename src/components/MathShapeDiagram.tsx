import { MathDiagramSpec, UILanguage } from '../types/quiz';

interface MathShapeDiagramProps {
  questionId?: string;
  diagram?: MathDiagramSpec;
  lang?: UILanguage;
  compact?: boolean;
}

export function MathShapeDiagram({
  diagram,
  compact = false,
}: MathShapeDiagramProps) {
  if (!diagram) {
    return null;
  }

  const svgSize = compact ? 120 : 180;
  const strokeColor = '#0f766e'; // teal-700
  const fillColor = '#ccfbf1'; // teal-100
  const accentColor = '#e11d48'; // rose-600
  const textColor = '#0f172a'; // slate-900

  const renderShape = () => {
    switch (diagram.kind) {
      case 'circle': {
        const cx = 90;
        const cy = 90;
        const r = 60;
        return (
          <svg viewBox="0 0 180 180" className="mx-auto h-full w-full">
            <circle cx={cx} cy={cy} r={r} fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            <circle cx={cx} cy={cy} r="3" fill={accentColor} />
            {diagram.mode === 'r' ? (
              <>
                <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={accentColor} strokeWidth="2" strokeDasharray="3 3" />
                <text x={cx + r / 2} y={cy - 8} fill={textColor} fontSize="12" fontWeight="700" textAnchor="middle">
                  {diagram.valueLabel}
                </text>
              </>
            ) : (
              <>
                <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={accentColor} strokeWidth="2" strokeDasharray="3 3" />
                <text x={cx} y={cy - 8} fill={textColor} fontSize="12" fontWeight="700" textAnchor="middle">
                  {diagram.valueLabel}
                </text>
              </>
            )}
          </svg>
        );
      }

      case 'semicircle': {
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            <path d="M 20 100 A 70 70 0 0 1 160 100 Z" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            <line x1="20" y1="100" x2="160" y2="100" stroke={strokeColor} strokeWidth="3" />
            <circle cx="90" cy="100" r="3" fill={accentColor} />
            {diagram.mode === 'r' ? (
              <>
                <line x1="90" y1="100" x2="160" y2="100" stroke={accentColor} strokeWidth="2.5" />
                <text x="125" y="118" fill={textColor} fontSize="12" fontWeight="700" textAnchor="middle">
                  {diagram.valueLabel}
                </text>
              </>
            ) : (
              <text x="90" y="118" fill={textColor} fontSize="12" fontWeight="700" textAnchor="middle">
                {diagram.valueLabel}
              </text>
            )}
          </svg>
        );
      }

      case 'sector': {
        const cx = 90;
        const cy = 110;
        const r = 70;
        const rad = (diagram.angle * Math.PI) / 180;
        const x2 = cx + r * Math.cos(-rad);
        const y2 = cy + r * Math.sin(-rad);
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            <path
              d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${x2} ${y2} Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            <text x={cx + 40} y={cy + 16} fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              r = {diagram.r} cm
            </text>
            <text x={cx + 18} y={cy - 10} fill={accentColor} fontSize="11" fontWeight="700">
              {diagram.angle}°
            </text>
          </svg>
        );
      }

      case 'rect': {
        return (
          <svg viewBox="0 0 180 130" className="mx-auto h-full w-full">
            <rect x="25" y="25" width="130" height="80" fill={fillColor} stroke={strokeColor} strokeWidth="3" rx="4" />
            {diagram.diagonal && (
              <>
                <line x1="25" y1="105" x2="155" y2="25" stroke={accentColor} strokeWidth="2" strokeDasharray="4 3" />
                <text x="90" y="60" fill={accentColor} fontSize="11" fontWeight="700" textAnchor="middle">
                  {diagram.diagonal}
                </text>
              </>
            )}
            <text x="90" y="120" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.w} {diagram.unit || 'cm'}
            </text>
            <text x="12" y="68" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.h} {diagram.unit || 'cm'}
            </text>
          </svg>
        );
      }

      case 'right_tri': {
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            <polygon points="30,110 150,110 30,20" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            {/* Right angle symbol */}
            <path d="M 30 95 L 45 95 L 45 110" fill="none" stroke={strokeColor} strokeWidth="2" />
            <text x="90" y="125" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.b}
            </text>
            <text x="16" y="68" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.a}
            </text>
            <text x="100" y="58" fill={accentColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.c}
            </text>
          </svg>
        );
      }

      case 'ladder': {
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            {/* Wall & Ground */}
            <line x1="30" y1="15" x2="30" y2="120" stroke="#64748b" strokeWidth="4" />
            <line x1="20" y1="120" x2="160" y2="120" stroke="#64748b" strokeWidth="4" />
            {/* Right angle */}
            <path d="M 30 108 L 42 108 L 42 120" fill="none" stroke="#64748b" strokeWidth="1.5" />
            {/* Ladder */}
            <line x1="30" y1="25" x2="135" y2="120" stroke={accentColor} strokeWidth="3.5" />
            <text x="18" y="70" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.wall}
            </text>
            <text x="82" y="134" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.base}
            </text>
            <text x="95" y="64" fill={accentColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.len}
            </text>
          </svg>
        );
      }

      case 'cylinder': {
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            <ellipse cx="90" cy="30" rx="45" ry="15" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <line x1="45" y1="30" x2="45" y2="105" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="135" y1="30" x2="135" y2="105" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M 45 105 A 45 15 0 0 0 135 105" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <path d="M 45 105 A 45 15 0 0 1 135 105" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Radius line */}
            <line x1="90" y1="30" x2="135" y2="30" stroke={accentColor} strokeWidth="1.5" />
            <text x="110" y="24" fill={accentColor} fontSize="10" fontWeight="700" textAnchor="middle">
              r = {diagram.r} cm
            </text>
            {/* Height text */}
            <text x="155" y="72" fill={textColor} fontSize="11" fontWeight="700" textAnchor="start">
              h = {diagram.unknownH ? '?' : `${diagram.h} cm`}
            </text>
          </svg>
        );
      }

      case 'cube':
      case 'cuboid': {
        const l = 'l' in diagram ? diagram.l : 5;
        const w = 'w' in diagram ? diagram.w : 5;
        const h = 'h' in diagram ? diagram.h : 5;
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            {/* Front rect */}
            <rect x="35" y="55" width="85" height="60" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            {/* Top face */}
            <polygon points="35,55 65,25 150,25 120,55" fill="#f0fdfa" stroke={strokeColor} strokeWidth="2.5" />
            {/* Right face */}
            <polygon points="120,55 150,25 150,85 120,115" fill="#99f6e4" stroke={strokeColor} strokeWidth="2.5" />
            {'diagonal' in diagram && diagram.diagonal && (
              <line x1="35" y1="115" x2="150" y2="25" stroke={accentColor} strokeWidth="2" strokeDasharray="4 3" />
            )}
            <text x="77" y="128" fill={textColor} fontSize="10" fontWeight="700" textAnchor="middle">
              {'sLabel' in diagram ? diagram.sLabel : `${l} cm`}
            </text>
            <text x="145" y="105" fill={textColor} fontSize="10" fontWeight="700" textAnchor="start">
              {w} cm
            </text>
            <text x="18" y="88" fill={textColor} fontSize="10" fontWeight="700" textAnchor="middle">
              {h} cm
            </text>
          </svg>
        );
      }

      case 'tri_prism': {
        return (
          <svg viewBox="0 0 180 135" className="mx-auto h-full w-full">
            <polygon points="30,105 85,105 30,35" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="85,105 155,75 100,75 30,105" fill="#f0fdfa" stroke={strokeColor} strokeWidth="2" />
            <polygon points="30,35 100,5 100,75 30,105" fill="#99f6e4" stroke={strokeColor} strokeWidth="2" />
            <text x="58" y="118" fill={textColor} fontSize="10" fontWeight="700" textAnchor="middle">
              b = {diagram.b} cm
            </text>
            <text x="18" y="70" fill={textColor} fontSize="10" fontWeight="700" textAnchor="middle">
              h = {diagram.h} cm
            </text>
            <text x="125" y="95" fill={accentColor} fontSize="10" fontWeight="700" textAnchor="middle">
              len = {diagram.len} cm
            </text>
          </svg>
        );
      }

      case 'pyramid': {
        return (
          <svg viewBox="0 0 180 140" className="mx-auto h-full w-full">
            <polygon points="90,20 30,105 110,115" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <polygon points="90,20 110,115 155,95" fill="#99f6e4" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="30" y1="105" x2="80" y2="85" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="155" y1="95" x2="80" y2="85" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="90" y1="20" x2="80" y2="85" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="70" y="125" fill={textColor} fontSize="10" fontWeight="700" textAnchor="middle">
              base = {diagram.base} cm
            </text>
            <text x="135" y="55" fill={accentColor} fontSize="10" fontWeight="700" textAnchor="middle">
              slant = {diagram.slant} cm
            </text>
          </svg>
        );
      }

      default: {
        return (
          <svg viewBox="0 0 180 130" className="mx-auto h-full w-full">
            <rect x="35" y="25" width="110" height="80" rx="8" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="90" cy="65" r="28" fill="#f0fdfa" stroke={accentColor} strokeWidth="2" strokeDasharray="4 2" />
            <text x="90" y="70" fill={textColor} fontSize="11" fontWeight="700" textAnchor="middle">
              {diagram.kind}
            </text>
          </svg>
        );
      }
    }
  };

  return (
    <div
      className={`my-3 flex items-center justify-center rounded-xl border border-teal-200/80 bg-teal-50/40 p-2.5 shadow-xs ${
        compact ? 'max-w-[150px]' : 'max-w-[240px]'
      }`}
      style={{ height: svgSize }}
    >
      {renderShape()}
    </div>
  );
}
