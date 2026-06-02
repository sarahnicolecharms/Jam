import { zColor } from "@remotion/zod-types";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const textRevealSchema = z.object({
  text: z.string(),
  textColor: zColor(),
  backgroundColor: zColor(),
});

const STAGGER = 8;

export const TextReveal: React.FC<z.infer<typeof textRevealSchema>> = ({
  text,
  textColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "0 18px",
        padding: "0 120px",
      }}
    >
      {words.map((word, i) => {
        const wordFrame = frame - i * STAGGER;

        const scale = spring({
          frame: wordFrame,
          fps,
          config: { damping: 80, mass: 0.6 },
        });

        const translateY = spring({
          frame: wordFrame,
          fps,
          config: { damping: 80, mass: 0.6 },
        });

        return (
          <span
            key={i}
            style={{
              fontFamily: "SF Pro Text, Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: 120,
              color: textColor,
              display: "inline-block",
              transform: `scale(${scale}) translateY(${(1 - translateY) * 60}px)`,
              opacity: scale,
            }}
          >
            {word}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
