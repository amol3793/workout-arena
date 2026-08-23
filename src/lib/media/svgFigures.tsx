import type { ExerciseFigureKind } from "@/data/types";

/**
 * Exercise diagrams rendered as soft-shaded, 3D-look humanoid figures
 * (inspired by the reference: gradient-shaded body, dumbbells in hand,
 * glowing target muscles, start→end movement path).
 *
 * Self-authored inline SVG — license-clean, no network requests.
 */

interface FigureProps {
  kind: ExerciseFigureKind;
  className?: string;
  title: string;
}

/* ---------- palette ---------- */
const BODY = "#cfd6dd";
const BODY_LIGHT = "#e9edf0";
const BODY_SHADOW = "#8f9aa6";
const JOINT = "#6b7683";
const BAR = "#475569";
const PLATE = "#1e293b";
const GHOST = "#9aa7b4";

interface ArmPose { ex: number; ey: number; hx: number; hy: number; }
interface Pose { l: ArmPose; r: ArmPose; }

/**
 * Full translucent humanoid (start pose ghost). Grey, gradient-shaded body.
 */
function Person({
  cx = 100, armL, armR, alpha = 1,
}: { cx?: number; armL: ArmPose; armR: ArmPose; alpha?: number }) {
  return (
    <g opacity={alpha} strokeLinecap="round" strokeLinejoin="round">
      {/* legs */}
      <path d={`M ${cx - 12} 128 L ${cx - 14} 156 L ${cx - 12} 186`} stroke={BODY_SHADOW} strokeWidth={9} fill="none" />
      <path d={`M ${cx + 12} 128 L ${cx + 14} 156 L ${cx + 12} 186`} stroke={BODY_SHADOW} strokeWidth={9} fill="none" />
      {/* left arm */}
      <path d={`M ${cx - 26} 74 L ${cx + armL.ex} ${armL.ey} L ${cx + armL.hx} ${armL.hy}`} stroke={BODY_SHADOW} strokeWidth={8} fill="none" />
      {/* right arm */}
      <path d={`M ${cx + 26} 74 L ${cx + armR.ex} ${armR.ey} L ${cx + armR.hx} ${armR.hy}`} stroke={BODY_SHADOW} strokeWidth={8} fill="none" />
      {/* torso */}
      <path
        d={`M ${cx} 52
           C ${cx - 26} 54, ${cx - 32} 60, ${cx - 31} 74
           C ${cx - 30} 92, ${cx - 24} 104, ${cx - 20} 116
           L ${cx - 16} 128 C ${cx - 8} 132, ${cx + 8} 132, ${cx + 16} 128
           L ${cx + 20} 116 C ${cx + 24} 104, ${cx + 30} 92, ${cx + 31} 74
           C ${cx + 32} 60, ${cx + 26} 54, ${cx} 52 Z`}
        fill="url(#bodyGrad)" stroke={BODY_SHADOW} strokeWidth={1.5}
      />
      {/* pecs */}
      <ellipse cx={cx - 11} cy={74} rx={11} ry={9} fill={BODY_LIGHT} opacity={0.55} />
      <ellipse cx={cx + 11} cy={74} rx={11} ry={9} fill={BODY_LIGHT} opacity={0.55} />
      {/* abs */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx={cx - 5} cy={92 + i * 9} rx={5} ry={4} fill={BODY_LIGHT} opacity={0.4} />
          <ellipse cx={cx + 5} cy={92 + i * 9} rx={5} ry={4} fill={BODY_LIGHT} opacity={0.4} />
        </g>
      ))}
      {/* shoulder caps (deltoids) */}
      <ellipse cx={cx - 26} cy={72} rx={9} ry={10} fill={BODY} stroke={BODY_SHADOW} strokeWidth={1.2} />
      <ellipse cx={cx + 26} cy={72} rx={9} ry={10} fill={BODY} stroke={BODY_SHADOW} strokeWidth={1.2} />
      {/* head */}
      <ellipse cx={cx} cy={36} rx={13} ry={16} fill="url(#headGrad)" stroke={BODY_SHADOW} strokeWidth={1.5} />
      {/* feet */}
      <ellipse cx={cx - 12} cy={189} rx={6} ry={3.2} fill={BODY_SHADOW} />
      <ellipse cx={cx + 12} cy={189} rx={6} ry={3.2} fill={BODY_SHADOW} />
    </g>
  );
}

function DumbbellPair({ cx, l, r }: { cx?: number; l: { x: number; y: number }; r: { x: number; y: number } }) {
  return (
    <>
      {[l, r].map((p, i) => (
        <g key={i} transform={`translate(${p.x + (cx ?? 100)} ${p.y})`}>
          <rect x={-10} y={-2.8} width={20} height={5.6} rx={2.8} fill={BAR} />
          <rect x={-14} y={-7} width={5.5} height={14} rx={2.5} fill={PLATE} />
          <rect x={8.5} y={-7} width={5.5} height={14} rx={2.5} fill={PLATE} />
        </g>
      ))}
    </>
  );
}

function MoveArrow({ d, color }: { d: string; color: string }) {
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round"
      strokeDasharray="1 8" opacity={0.9} />
  );
}

interface Spec {
  /** ghost (start) arm pose */
  start: Pose;
  /** main (end) arm pose with weight + glow */
  end: Pose;
  /** glow targets (target muscles) in body coords */
  glows: { x: number; y: number; r: number; color: string }[];
  /** motion arc paths (absolute) */
  arcs: string[];
  arcColor: string;
  bench?: boolean;
}

const CX = 100;

const SPECS: Record<Exclude<ExerciseFigureKind, "generic">, Spec> = {
  "lateral-raise": {
    start: { l: { ex: -34, ey: 96, hx: -38, hy: 122 }, r: { ex: 34, ey: 96, hx: 38, hy: 122 } },
    end: { l: { ex: -46, ey: 74, hx: -66, hy: 72 }, r: { ex: 46, ey: 74, hx: 66, hy: 72 } },
    glows: [
      { x: CX - 26, y: 72, r: 10, color: "#3b82f6" },
      { x: CX + 26, y: 72, r: 10, color: "#3b82f6" },
    ],
    arcs: ["M 62 122 A 55 55 0 0 1 34 72", "M 138 122 A 55 55 0 0 0 166 72"],
    arcColor: "#3b82f6",
  },
  "front-raise": {
    start: { l: { ex: -28, ey: 100, hx: -22, hy: 124 }, r: { ex: 28, ey: 100, hx: 22, hy: 124 } },
    end: { l: { ex: -30, ey: 62, hx: -18, hy: 40 }, r: { ex: 30, ey: 62, hx: 18, hy: 40 } },
    glows: [
      { x: CX, y: 62, r: 0, color: "transparent" },
      { x: CX - 24, y: 70, r: 9, color: "#ef4444" },
      { x: CX + 24, y: 70, r: 9, color: "#ef4444" },
    ],
    arcs: ["M 82 124 A 45 45 0 0 1 82 40", "M 118 124 A 45 45 0 0 0 118 40"],
    arcColor: "#ef4444",
  },
  "overhead-press": {
    bench: true,
    start: { l: { ex: -40, ey: 64, hx: -30, hy: 42 }, r: { ex: 40, ey: 64, hx: 30, hy: 42 } },
    end: { l: { ex: -30, ey: 32, hx: -24, hy: 8 }, r: { ex: 30, ey: 32, hx: 24, hy: 8 } },
    glows: [
      { x: CX - 24, y: 70, r: 9, color: "#ef4444" },
      { x: CX + 24, y: 70, r: 9, color: "#ef4444" },
    ],
    arcs: ["M 70 42 A 30 30 0 0 1 76 8", "M 130 42 A 30 30 0 0 0 124 8"],
    arcColor: "#ef4444",
  },
  "rear-fly": {
    start: { l: { ex: -26, ey: 100, hx: -22, hy: 124 }, r: { ex: 26, ey: 100, hx: 22, hy: 124 } },
    end: { l: { ex: -44, ey: 78, hx: -62, hy: 76 }, r: { ex: 44, ey: 78, hx: 62, hy: 76 } },
    glows: [
      { x: CX - 20, y: 68, r: 7, color: "#22c55e" },
      { x: CX + 20, y: 68, r: 7, color: "#22c55e" },
    ],
    arcs: ["M 78 124 A 52 52 0 0 1 38 76", "M 122 124 A 52 52 0 0 0 162 76"],
    arcColor: "#22c55e",
  },
  "face-pull": {
    start: { l: { ex: -40, ey: 66, hx: -56, hy: 58 }, r: { ex: 40, ey: 66, hx: 56, hy: 58 } },
    end: { l: { ex: -34, ey: 58, hx: -16, hy: 44 }, r: { ex: 34, ey: 58, hx: 16, hy: 44 } },
    glows: [
      { x: CX - 20, y: 68, r: 7, color: "#22c55e" },
      { x: CX + 20, y: 68, r: 7, color: "#22c55e" },
    ],
    arcs: ["M 44 58 A 32 32 0 0 1 84 44", "M 156 58 A 32 32 0 0 0 116 44"],
    arcColor: "#22c55e",
  },
  "external-rotation": {
    start: { l: { ex: 22, ey: 92, hx: 24, hy: 100 }, r: { ex: 22, ey: 92, hx: 24, hy: 100 } },
    end: { l: { ex: 22, ey: 92, hx: 44, hy: 88 }, r: { ex: 22, ey: 92, hx: 44, hy: 88 } },
    glows: [{ x: CX + 20, y: 70, r: 8, color: "#8b5cf6" }],
    arcs: ["M 124 100 A 26 26 0 0 1 144 88"],
    arcColor: "#8b5cf6",
  },
};

function FigureBody({ spec }: { spec: Spec }) {
  return (
    <>
      {/* stage */}
      <ellipse cx={CX} cy={193} rx={62} ry={7} fill="#e2e8f0" />
      {spec.bench && <rect x={72} y={128} width={56} height={8} rx={3} fill="#94a3b8" />}

      {/* ghost start pose */}
      <Person armL={spec.start.l} armR={spec.start.r} alpha={0.28} />

      {/* main end pose */}
      <Person armL={spec.end.l} armR={spec.end.r} />

      {/* dumbbells at hands of end pose */}
      <DumbbellPair l={{ x: spec.end.l.hx, y: spec.end.l.hy }} r={{ x: spec.end.r.hx, y: spec.end.r.hy }} />

      {/* motion arcs */}
      {spec.arcs.map((d, i) => <MoveArrow key={i} d={d} color={spec.arcColor} />)}

      {/* glowing target muscles */}
      {spec.glows.map((g, i) => (
        g.r > 0 && (
          <g key={i}>
            <circle cx={g.x} cy={g.y} r={g.r} fill={g.color} opacity={0.35} />
            <circle cx={g.x} cy={g.y} r={g.r * 0.55} fill={g.color} opacity={0.55} />
          </g>
        )
      ))}
    </>
  );
}

export function ExerciseFigure({ kind, className, title }: FigureProps) {
  const spec = kind === "generic" ? SPECS["lateral-raise"] : SPECS[kind];
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{title}</title>
      <defs>
        <radialGradient id="bodyGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={BODY_LIGHT} />
          <stop offset="100%" stopColor={BODY} />
        </radialGradient>
        <radialGradient id="headGrad" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#f2f5f7" />
          <stop offset="100%" stopColor={BODY} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={200} height={200} fill="transparent" />
      <FigureBody spec={spec} />
    </svg>
  );
}
