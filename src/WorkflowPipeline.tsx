import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const workflowSchema = z.object({
  title: z.string(),
  step1: z.string(),
  step2: z.string(),
  step3: z.string(),
  step4: z.string(),
  step5: z.string(),
  accentColor: zColor(),
});

const FONT = "SF Pro Display, Helvetica Neue, Arial, sans-serif";
const CARD_W = 700;
const CARD_H = 96;
const ARROW_H = 52;
const STEP_DELAY = 22; // frames between each step entering

type StepConfig = {
  color: string;
  icon: string;
};

const STEP_STYLES: StepConfig[] = [
  { color: "#EE1D52", icon: "◉" }, // TikTok red
  { color: "#CC785C", icon: "◈" }, // Claude warm
  { color: "#CC785C", icon: "◈" }, // Claude warm
  { color: "#A259FF", icon: "◆" }, // purple
  { color: "#00C9A7", icon: "✦" }, // teal/export
];

// ── Step card ──────────────────────────────────────────────────────────────
const StepCard: React.FC<{
  label: string;
  index: number;
  delay: number;
  isLast: boolean;
}> = ({ label, index, delay, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cfg = STEP_STYLES[index] ?? STEP_STYLES[STEP_STYLES.length - 1];

  const p = spring({ frame: frame - delay, fps, config: { damping: 72, mass: 0.6 } });

  const tx = interpolate(p, [0, 1], [120, 0]);
  const opacity = interpolate(p, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.09)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        paddingLeft: 0,
        paddingRight: 28,
        overflow: "hidden",
        transform: `translateX(${tx}px)`,
        opacity,
        boxShadow: isLast
          ? `0 0 40px ${cfg.color}44, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 8px 24px rgba(0,0,0,0.3)",
        position: "relative",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: 4,
          alignSelf: "stretch",
          background: cfg.color,
          borderRadius: "18px 0 0 18px",
          flexShrink: 0,
        }}
      />

      {/* Icon circle */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `${cfg.color}22`,
          border: `1.5px solid ${cfg.color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: cfg.color,
          fontSize: 20,
        }}
      >
        {index + 1}
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 500,
          color: isLast ? "#fff" : "rgba(255,255,255,0.88)",
          letterSpacing: -0.3,
          flex: 1,
        }}
      >
        {label}
      </span>

      {/* Right chevron */}
      <span
        style={{
          fontFamily: FONT,
          fontSize: 18,
          color: `${cfg.color}99`,
          fontWeight: 300,
        }}
      >
        {isLast ? "✓" : "›"}
      </span>
    </div>
  );
};

// ── Arrow connector ────────────────────────────────────────────────────────
const Arrow: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - delay - 8, fps, config: { damping: 80, mass: 0.5 } });
  const lineH = 28;
  const drawnH = interpolate(p, [0, 1], [0, lineH]);
  const arrowOpacity = interpolate(p, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: CARD_W,
        height: ARROW_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          width: 2,
          height: drawnH,
          background: `linear-gradient(to bottom, ${color}66, ${color}cc)`,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          color: `${color}cc`,
          fontSize: 16,
          lineHeight: 1,
          opacity: arrowOpacity,
          marginTop: -2,
        }}
      >
        ▼
      </span>
    </div>
  );
};

// ── Main composition ───────────────────────────────────────────────────────
export const WorkflowPipeline: React.FC<z.infer<typeof workflowSchema>> = ({
  title,
  step1,
  step2,
  step3,
  step4,
  step5,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [step1, step2, step3, step4, step5];

  const titleP = spring({ frame: frame - 5, fps, config: { damping: 70, mass: 0.7 } });
  const titleOpacity = interpolate(titleP, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleP, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0e14" }}>
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          filter: "blur(80px)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Title */}
        <div
          style={{
            width: CARD_W,
            marginBottom: 40,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: 48,
              height: 3,
              borderRadius: 2,
              background: accentColor,
            }}
          />
        </div>

        {/* Steps + arrows */}
        {steps.map((label, i) => {
          const stepDelay = 15 + i * STEP_DELAY;
          const arrowColor = STEP_STYLES[i]?.color ?? accentColor;

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <StepCard label={label} index={i} delay={stepDelay} isLast={i === steps.length - 1} />
              {i < steps.length - 1 && (
                <Arrow delay={stepDelay} color={arrowColor} />
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
