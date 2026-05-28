import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const quoteOverlaySchema = z.object({
  textColor: zColor(),
  backgroundColor: zColor(),
});

// Each segment has text + a visual style: normal, script (italic serif), or caps (bold italic)
type SegmentStyle = "normal" | "script" | "caps";
type Segment = { text: string; style: SegmentStyle };
type Line = Segment[];

const LINES: Line[] = [
  [
    { text: "The ", style: "normal" },
    { text: "Best", style: "script" },
    { text: " way to", style: "normal" },
  ],
  [
    { text: "predict the ", style: "normal" },
    { text: "FUTURE", style: "caps" },
  ],
  [
    { text: "is to ", style: "normal" },
    { text: "Create", style: "script" },
    { text: " it.", style: "normal" },
  ],
];

const LINE_DELAY = 55; // frames between each line entering
const FONT_SIZE = 96;

const segmentStyle = (
  style: SegmentStyle,
  color: string,
): React.CSSProperties => {
  if (style === "script") {
    return {
      fontFamily: "Georgia, 'Book Antiqua', Palatino, serif",
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: FONT_SIZE * 1.15,
      color,
      lineHeight: 1,
    };
  }
  if (style === "caps") {
    return {
      fontFamily: "SF Pro Display, Helvetica Neue, Arial, sans-serif",
      fontStyle: "italic",
      fontWeight: 800,
      fontSize: FONT_SIZE * 0.9,
      color,
      lineHeight: 1,
    };
  }
  return {
    fontFamily: "SF Pro Display, Helvetica Neue, Arial, sans-serif",
    fontWeight: 400,
    fontSize: FONT_SIZE,
    color,
    lineHeight: 1,
  };
};

const AnimatedLine: React.FC<{
  segments: Segment[];
  delay: number;
  textColor: string;
}> = ({ segments, delay, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 80, mass: 0.7 },
  });

  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline",
        flexWrap: "nowrap",
      }}
    >
      {segments.map((seg, i) => (
        <span key={i} style={segmentStyle(seg.style, textColor)}>
          {seg.text}
        </span>
      ))}
    </div>
  );
};

export const QuoteOverlay: React.FC<z.infer<typeof quoteOverlaySchema>> = ({
  textColor,
  backgroundColor,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Soft vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, #00000066 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "0 160px",
          textAlign: "center",
        }}
      >
        {LINES.map((line, i) => (
          <AnimatedLine
            key={i}
            segments={line}
            delay={i * LINE_DELAY}
            textColor={textColor}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
