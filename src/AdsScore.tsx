import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const adsScoreSchema = z.object({
  hookText: z.string(),
  hookScore: z.number().min(0).max(10),
  scrollStopScore: z.number().min(0).max(10),
  ctaScore: z.number().min(0).max(10),
  retentionScore: z.number().min(0).max(10),
  recommendation: z.string(),
});

const FONT = "SF Pro Display, Helvetica Neue, Arial, sans-serif";
const CARD_W = 780;

const scoreColor = (s: number) => {
  if (s >= 8.5) return "#34C759";
  if (s >= 7)   return "#00C9A7";
  if (s >= 5)   return "#FF9500";
  return "#FF3B30";
};

const scoreLabel = (s: number) => {
  if (s >= 8.5) return "Excellent";
  if (s >= 7)   return "Good";
  if (s >= 5)   return "Average";
  return "Weak";
};

// ── Animated score row ─────────────────────────────────────────────────────
const ScoreRow: React.FC<{
  label: string;
  score: number;
  delay: number;
}> = ({ label, score, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - delay, fps, config: { damping: 68, mass: 0.65 } });

  const slideX = interpolate(p, [0, 1], [80, 0]);
  const opacity = interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
  const barFill = interpolate(p, [0, 1], [0, score / 10]);
  const displayScore = Math.round(interpolate(p, [0, 1], [0, score * 10])) / 10;

  const color = scoreColor(score);

  return (
    <div
      style={{
        width: CARD_W,
        opacity,
        transform: `translateX(${slideX}px)`,
        marginBottom: 20,
      }}
    >
      {/* Label + score number */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 700,
              color,
            }}
          >
            {displayScore.toFixed(1)}
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
            }}
          >
            /10
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 500,
              color,
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: 6,
              padding: "2px 8px",
              marginLeft: 4,
            }}
          >
            {scoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div
        style={{
          width: "100%",
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barFill * 100}%`,
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(to right, ${color}99, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  );
};

// ── Overall score ring (simple arc using border) ───────────────────────────
const OverallRing: React.FC<{ score: number; delay: number }> = ({ score, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - delay, fps, config: { damping: 60, mass: 0.7 } });
  const opacity = interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(p, [0, 1], [0.7, 1]);
  const displayScore = (Math.round(interpolate(p, [0, 1], [0, score * 10])) / 10).toFixed(1);
  const color = scoreColor(score);

  return (
    <div
      style={{
        width: CARD_W,
        marginTop: 16,
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.09)`,
        borderRadius: 24,
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: `0 0 60px ${color}22, 0 12px 40px rgba(0,0,0,0.4)`,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Overall Score
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 72, fontWeight: 800, color, lineHeight: 1 }}>
            {displayScore}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 24, color: "rgba(255,255,255,0.3)" }}>/10</span>
        </div>
      </div>
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: `6px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}11`,
          boxShadow: `0 0 30px ${color}44`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 40, lineHeight: 1 }}>
          {score >= 7 ? "🏆" : score >= 5 ? "📊" : "⚠️"}
        </span>
      </div>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const AdsScore: React.FC<z.infer<typeof adsScoreSchema>> = ({
  hookText,
  hookScore,
  scrollStopScore,
  ctaScore,
  retentionScore,
  recommendation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const overall = Math.round(((hookScore + scrollStopScore + ctaScore + retentionScore) / 4) * 10) / 10;

  const headerP = spring({ frame: frame - 5, fps, config: { damping: 70 } });
  const headerOpacity = interpolate(headerP, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(headerP, [0, 1], [24, 0]);

  const tipDelay = 160;
  const tipP = spring({ frame: frame - tipDelay, fps, config: { damping: 65 } });
  const tipOpacity = interpolate(tipP, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const tipY = interpolate(tipP, [0, 1], [20, 0]);

  const METRICS = [
    { label: "Hook Strength",   score: hookScore,       delay: 30 },
    { label: "Scroll Stop",     score: scrollStopScore, delay: 52 },
    { label: "CTA Clarity",     score: ctaScore,        delay: 74 },
    { label: "Retention Signal",score: retentionScore,  delay: 96 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0e15" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, #A259FF18 0%, transparent 70%)", top: "-10%", left: "50%", transform: "translateX(-50%)", filter: "blur(80px)" }} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 0, padding: "0 150px" }}>

        {/* Header */}
        <div style={{ width: CARD_W, marginBottom: 36, opacity: headerOpacity, transform: `translateY(${headerY}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EE1D52", boxShadow: "0 0 8px #EE1D52" }} />
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, color: "#EE1D52", textTransform: "uppercase" }}>
              TikTok Ad Score
            </span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: 10 }}>
            Ad Score Report
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 17,
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "8px 14px",
              display: "inline-block",
              fontStyle: "italic",
            }}
          >
            "{hookText}"
          </div>
        </div>

        {/* Score rows */}
        {METRICS.map((m) => (
          <ScoreRow key={m.label} label={m.label} score={m.score} delay={m.delay} />
        ))}

        {/* Overall score */}
        <OverallRing score={overall} delay={118} />

        {/* Recommendation */}
        <div
          style={{
            width: CARD_W,
            marginTop: 20,
            opacity: tipOpacity,
            transform: `translateY(${tipY}px)`,
            background: "rgba(162,89,255,0.06)",
            border: "1px solid rgba(162,89,255,0.2)",
            borderRadius: 16,
            padding: "18px 22px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</span>
          <span style={{ fontFamily: FONT, fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
            {recommendation}
          </span>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
