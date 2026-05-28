import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const adsScoreAnimatedSchema = z.object({
  hookText: z.string(),
  hookScore: z.number().min(0).max(10),
  scrollStopScore: z.number().min(0).max(10),
  ctaScore: z.number().min(0).max(10),
  retentionScore: z.number().min(0).max(10),
  recommendation: z.string(),
});

const FONT = "SF Pro Display, Helvetica Neue, Arial, sans-serif";

// ── Scene timing ───────────────────────────────────────────────────────────
const SCENE_DUR = 85;   // frames each metric card is "on stage"
const OVERLAP  = 22;    // frames next card overlaps with exiting card
const NET      = SCENE_DUR - OVERLAP;

type MetricDef = {
  label: string;
  score: number;
  color1: string;
  color2: string;
  start: number; // global frame when scene begins
};

const makeDefs = (
  hookScore: number,
  scrollScore: number,
  ctaScore: number,
  retScore: number,
): MetricDef[] => [
  { label: "HOOK STRENGTH",    score: hookScore,   color1: "#0CD9AE", color2: "#00A3C4", start: 0 },
  { label: "SCROLL STOP",      score: scrollScore, color1: "#4CD964", color2: "#00A36C", start: NET },
  { label: "CTA CLARITY",      score: ctaScore,    color1: "#FF9F0A", color2: "#FF4E00", start: NET * 2 },
  { label: "RETENTION SIGNAL", score: retScore,    color1: "#0A84FF", color2: "#5E5CE6", start: NET * 3 },
];

const OVERALL_START = NET * 4;
const TOTAL_FRAMES  = OVERALL_START + 110;

// ── Helpers ────────────────────────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const scoreLabel = (s: number) =>
  s >= 8.5 ? "EXCELLENT" : s >= 7 ? "GOOD" : s >= 5 ? "AVERAGE" : "WEAK";

// ── Metric Card ────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  def: MetricDef;
  isLast?: boolean;
}> = ({ def, isLast = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lf = frame - def.start; // local frame

  // ── Entry spring (slide from right) ──
  const entryP = spring({ frame: lf, fps, config: { damping: 65, mass: 0.75 } });
  const entryX = interpolate(entryP, [0, 1], [width + 80, 0]);
  const entryScale = interpolate(entryP, [0, 1], [0.88, 1]);

  // ── Exit: slide to left (unless this is the last card) ──
  const EXIT_START = SCENE_DUR - OVERLAP - 5;
  const exitT = isLast
    ? 0
    : interpolate(lf, [EXIT_START, SCENE_DUR + 5], [0, 1], clamp);
  const exitX = interpolate(exitT, [0, 1], [0, -(width + 80)]);
  const exitScale = interpolate(exitT, [0, 1], [1, 0.88]);

  // ── Combined ──
  const tx = entryX + exitX;
  const sc = Math.min(entryScale, exitScale);
  const opacity = interpolate(lf, [-5, 5], [0, 1], clamp);

  // ── Number count-up with spring overshoot ──
  const numP = spring({ frame: Math.max(0, lf - 8), fps, config: { damping: 38, mass: 1.4 } });
  const displayNum = Math.round(interpolate(numP, [0, 1], [0, def.score * 10])) / 10;

  // ── Bar fill ──
  const barP = spring({ frame: Math.max(0, lf - 5), fps, config: { damping: 60, mass: 0.8 } });
  const barFill = interpolate(barP, [0, 1], [0, (def.score / 10) * 100]);

  // ── Pulse on final number ──
  const pulseDelay = 30;
  const pulseP = spring({ frame: Math.max(0, lf - pulseDelay), fps, config: { damping: 45, mass: 0.5 } });
  const numScale = interpolate(pulseP, [0, 0.5, 1], [1, 1.06, 1]);

  const CARD_W = 860;
  const CARD_H = 860;

  return (
    <div
      style={{
        position: "absolute",
        width: CARD_W,
        height: CARD_H,
        left: (width - CARD_W) / 2,
        top: (height - CARD_H) / 2,
        borderRadius: 48,
        background: `linear-gradient(145deg, ${def.color1} 0%, ${def.color2} 100%)`,
        boxShadow: `0 40px 100px ${def.color2}66, 0 0 0 1px rgba(255,255,255,0.12)`,
        transform: `translateX(${tx}px) scale(${sc})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Ghost number backdrop */}
      <div
        style={{
          position: "absolute",
          fontSize: 480,
          fontFamily: FONT,
          fontWeight: 900,
          color: "rgba(255,255,255,0.06)",
          lineHeight: 1,
          top: -60,
          right: -40,
          userSelect: "none",
          letterSpacing: -20,
        }}
      >
        {Math.round(def.score)}
      </div>

      {/* Metric label */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 4,
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        {def.label}
      </div>

      {/* Score number */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          transform: `scale(${numScale})`,
          transformOrigin: "center center",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 180,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: -8,
          }}
        >
          {displayNum.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            paddingBottom: 16,
          }}
        >
          /10
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 500,
          marginTop: 36,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 5,
            background: "rgba(255,255,255,0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barFill}%`,
              height: "100%",
              borderRadius: 5,
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 0 16px rgba(255,255,255,0.6)",
            }}
          />
        </div>
      </div>

      {/* Badge */}
      <div
        style={{
          background: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.4)",
          borderRadius: 40,
          padding: "10px 28px",
          fontFamily: FONT,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 3,
          color: "#fff",
        }}
      >
        ✦ {scoreLabel(def.score)}
      </div>
    </div>
  );
};

// ── Overall Score Card ─────────────────────────────────────────────────────
const OverallCard: React.FC<{
  score: number;
  metrics: MetricDef[];
  start: number;
  recommendation: string;
}> = ({ score, metrics, start, recommendation }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const lf = frame - start;

  const entryP = spring({ frame: lf, fps, config: { damping: 60, mass: 0.8 } });
  const tx = interpolate(entryP, [0, 1], [width + 80, 0]);
  const sc = interpolate(entryP, [0, 1], [0.9, 1]);
  const opacity = interpolate(lf, [-5, 8], [0, 1], clamp);

  const numP = spring({ frame: Math.max(0, lf - 10), fps, config: { damping: 38, mass: 1.4 } });
  const displayNum = Math.round(interpolate(numP, [0, 1], [0, score * 10])) / 10;

  const recDelay = 55;
  const recP = spring({ frame: Math.max(0, lf - recDelay), fps, config: { damping: 65 } });
  const recOpacity = interpolate(recP, [0, 0.4], [0, 1], clamp);
  const recY = interpolate(recP, [0, 1], [20, 0]);

  const CARD_W = 860;
  const CARD_H = 1050;

  return (
    <div
      style={{
        position: "absolute",
        width: CARD_W,
        height: CARD_H,
        left: (width - CARD_W) / 2,
        top: (height - CARD_H) / 2,
        borderRadius: 48,
        background: "linear-gradient(145deg, #BF5AF2 0%, #6E35C9 100%)",
        boxShadow: "0 40px 100px #6E35C966, 0 0 0 1px rgba(255,255,255,0.12)",
        transform: `translateX(${tx}px) scale(${sc})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
        overflow: "hidden",
      }}
    >
      {/* Ghost number */}
      <div style={{ position: "absolute", fontSize: 400, fontFamily: FONT, fontWeight: 900, color: "rgba(255,255,255,0.05)", lineHeight: 1, top: -40, right: -30, letterSpacing: -15, userSelect: "none" }}>
        {Math.round(score)}
      </div>

      <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", marginBottom: 20 }}>
        OVERALL SCORE
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 28 }}>
        <span style={{ fontFamily: FONT, fontSize: 160, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -6 }}>
          {displayNum.toFixed(1)}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 44, fontWeight: 300, color: "rgba(255,255,255,0.5)", paddingBottom: 12 }}>/10</span>
      </div>

      {/* Mini metric row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: `linear-gradient(135deg, ${m.color1}, ${m.color2})`,
            borderRadius: 16,
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: 90,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {m.score.toFixed(1)}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 }}>
              {m.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div
        style={{
          opacity: recOpacity,
          transform: `translateY(${recY}px)`,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 20,
          padding: "18px 24px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          maxWidth: 700,
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💡</span>
        <span style={{ fontFamily: FONT, fontSize: 17, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>
          {recommendation}
        </span>
      </div>
    </div>
  );
};

// ── Background gradient that crossfades between scene colors ───────────────
const Background: React.FC<{ metrics: MetricDef[] }> = ({ metrics }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {metrics.map((m, i) => {
        const enter = interpolate(frame, [m.start - 5, m.start + 20], [0, 0.15], clamp);
        const exit  = i < metrics.length - 1
          ? interpolate(frame, [metrics[i + 1].start, metrics[i + 1].start + 20], [0.15, 0], clamp)
          : 0.15;
        const bgOpacity = Math.max(0, i === 0 ? enter : enter - 0 * exit);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at center, ${m.color1}33 0%, transparent 70%)`,
              opacity: bgOpacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const AdsScoreAnimated: React.FC<z.infer<typeof adsScoreAnimatedSchema>> = ({
  hookText,
  hookScore,
  scrollStopScore,
  ctaScore,
  retentionScore,
  recommendation,
}) => {
  const overall = Math.round(((hookScore + scrollStopScore + ctaScore + retentionScore) / 4) * 10) / 10;
  const metrics = makeDefs(hookScore, scrollStopScore, ctaScore, retentionScore);

  return (
    <AbsoluteFill style={{ backgroundColor: "#08090f" }}>
      <Background metrics={metrics} />

      {/* Metric cards (render all; each manages its own visibility) */}
      {metrics.map((def, i) => (
        <MetricCard key={i} def={def} isLast={false} />
      ))}

      {/* Overall card */}
      <OverallCard
        score={overall}
        metrics={metrics}
        start={OVERALL_START}
        recommendation={recommendation}
      />

      {/* Hook text watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: 1,
          }}
        >
          "{hookText}"
        </span>
      </div>
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES };
