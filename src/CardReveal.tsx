import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const cardRevealSchema = z.object({
  brandName: z.string(),
  tagline: z.string(),
  icon1Initial: z.string(),
  icon2Initial: z.string(),
  icon1Color: zColor(),
  icon2Color: zColor(),
});

const FONT = "SF Pro Display, Helvetica Neue, Arial, sans-serif";
const W = 560;
const H = 300;
const R = 28;

type CardDef = {
  background: string;
  rotate: number;
  tx: number;
  ty: number;
  delay: number;
};

const CARD_DEFS: CardDef[] = [
  { background: "linear-gradient(135deg,#FF8C42,#FFBA5C)", rotate: -13, tx: -50, ty: 36, delay: 0 },
  { background: "linear-gradient(135deg,#E8708A,#F4A4B5)", rotate: -6,  tx: -25, ty: 20, delay: 10 },
  { background: "linear-gradient(135deg,#7C5CBF,#A88CE0)", rotate:  5,  tx:  22, ty: 24, delay: 20 },
];

const BackCard: React.FC<{ def: CardDef }> = ({ def }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - def.delay, fps, config: { damping: 65, mass: 0.8 } });

  const rotate = interpolate(p, [0, 1], [0, def.rotate]);
  const tx = interpolate(p, [0, 1], [0, def.tx]);
  const ty = interpolate(p, [0, 1], [900, def.ty]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: R,
        background: def.background,
        transform: `rotate(${rotate}deg) translateX(${tx}px) translateY(${ty}px)`,
        boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
      }}
    />
  );
};

const Avatar: React.FC<{ initial: string; color: string }> = ({ initial, color }) => (
  <div
    style={{
      width: 72,
      height: 72,
      borderRadius: "50%",
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 28,
      color: "#fff",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    }}
  >
    {initial.charAt(0).toUpperCase()}
  </div>
);

const FrontCard: React.FC<{
  def: CardDef;
  brandName: string;
  tagline: string;
  icon1Initial: string;
  icon2Initial: string;
  icon1Color: string;
  icon2Color: string;
  contentOpacity: number;
}> = ({ def, brandName, tagline, icon1Initial, icon2Initial, icon1Color, icon2Color, contentOpacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: frame - def.delay, fps, config: { damping: 65, mass: 0.8 } });
  const ty = interpolate(p, [0, 1], [900, def.ty]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: R,
        background: "rgba(240, 238, 250, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.3)",
        transform: `translateY(${ty}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        overflow: "hidden",
      }}
    >
      {/* Subtle shimmer blob inside card */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,191,0.12) 0%, transparent 70%)",
          top: -40,
          right: -40,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ opacity: contentOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 600,
            color: "#1a1a2e",
            letterSpacing: 0.5,
          }}
        >
          {brandName}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar initial={icon1Initial} color={icon1Color} />
          <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 300, color: "#555" }}>×</span>
          <Avatar initial={icon2Initial} color={icon2Color} />
        </div>

        {tagline ? (
          <span
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 400,
              color: "#888",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {tagline}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const GlowBlob: React.FC<{ color: string; size: number; x: string; y: string; delay: number }> = ({
  color, size, x, y, delay,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    Math.sin((frame + delay) * 0.03),
    [-1, 1],
    [0.85, 1.15],
  );
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        filter: `blur(${size * 0.25}px)`,
        transform: `scale(${scale})`,
        opacity: 0.6,
      }}
    />
  );
};

export const CardReveal: React.FC<z.infer<typeof cardRevealSchema>> = ({
  brandName,
  tagline,
  icon1Initial,
  icon2Initial,
  icon1Color,
  icon2Color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frontDef: CardDef = { background: "", rotate: 0, tx: 0, ty: 0, delay: 30 };

  const contentSpring = spring({ frame: frame - 55, fps, config: { damping: 60, mass: 0.6 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#08080f" }}>
      {/* Animated background blobs */}
      <GlowBlob color="#7C5CBF55" size={500} x="-80px" y="30%" delay={0} />
      <GlowBlob color="#E8708A33" size={400} x="60%" y="55%" delay={40} />
      <GlowBlob color="#FF8C4222" size={350} x="20%" y="65%" delay={80} />

      {/* Card stack */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: W, height: H }}>
          {CARD_DEFS.map((def, i) => (
            <BackCard key={i} def={def} />
          ))}
          <FrontCard
            def={frontDef}
            brandName={brandName}
            tagline={tagline}
            icon1Initial={icon1Initial}
            icon2Initial={icon2Initial}
            icon1Color={icon1Color}
            icon2Color={icon2Color}
            contentOpacity={contentSpring}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
