import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";

export const kineticTypeSchema = z.object({
  line1: z.string(),
  line2: z.string(),
  line3: z.string(),
  accentColor: zColor(),
});

const FONT = "SF Pro Display, Helvetica Neue, Arial, sans-serif";
const FADE = 25;
const SCENE = 100;
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SceneWrapper: React.FC<{
  children: React.ReactNode;
  fadeOutStart?: number;
}> = ({ children, fadeOutStart = SCENE - FADE }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, fadeOutStart, fadeOutStart + FADE],
    [0, 1, 1, 0],
    { ...clamp, easing: easeInOut },
  );
  const y = interpolate(frame, [0, FADE], [28, 0], {
    ...clamp,
    easing: easeOut,
  });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
  );
};

const BigLine: React.FC<{ text: string; color: string; glow?: boolean }> = ({
  text,
  color,
  glow = false,
}) => {
  const frame = useCurrentFrame();
  const ls = interpolate(frame, [0, FADE * 2], [20, 6], {
    ...clamp,
    easing: easeOut,
  });
  const glowStrength = glow
    ? interpolate(frame, [FADE, FADE * 2], [0, 1], {
        ...clamp,
        easing: easeOut,
      })
    : 0;

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 108,
        fontWeight: 100,
        color,
        letterSpacing: ls,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: glow
          ? `0 0 ${glowStrength * 60}px ${color}99, 0 0 ${glowStrength * 140}px ${color}44`
          : "none",
      }}
    >
      {text}
    </div>
  );
};

const Divider: React.FC = () => {
  const frame = useCurrentFrame();
  const scaleX = interpolate(frame, [0, FADE * 2], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const opacity = interpolate(frame, [0, FADE, SCENE - FADE, SCENE], [0, 0.35, 0.35, 0], {
    ...clamp,
  });
  return (
    <div
      style={{
        width: 200,
        height: 1,
        backgroundColor: "#ebebeb",
        transform: `scaleX(${scaleX})`,
        opacity,
        transformOrigin: "center",
      }}
    />
  );
};

export const KineticType: React.FC<z.infer<typeof kineticTypeSchema>> = ({
  line1,
  line2,
  line3,
  accentColor,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0d0d",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Vignette overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, #000000cc 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Scene 1 — opening line */}
      <Sequence durationInFrames={SCENE + 20}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <SceneWrapper>
            <BigLine text={line1} color="#ebebeb" />
          </SceneWrapper>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 — middle line with dividers */}
      <Sequence from={80} durationInFrames={SCENE + 20}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Divider />
          <SceneWrapper>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 50,
                fontWeight: 300,
                color: "#ebebeb",
                letterSpacing: 4,
                fontStyle: "italic",
                textAlign: "center",
                opacity: 0.85,
              }}
            >
              {line2}
            </div>
          </SceneWrapper>
          <Divider />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 — closing word with glow */}
      <Sequence from={160} durationInFrames={SCENE}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <SceneWrapper fadeOutStart={SCENE - FADE}>
            <BigLine text={line3} color={accentColor} glow />
          </SceneWrapper>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
