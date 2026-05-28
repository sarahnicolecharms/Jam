import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { CardReveal, cardRevealSchema } from "./CardReveal";
import { WorkflowPipeline, workflowSchema } from "./WorkflowPipeline";
import { KineticType, kineticTypeSchema } from "./KineticType";
import { QuoteOverlay, quoteOverlaySchema } from "./QuoteOverlay";
import { TextReveal, textRevealSchema } from "./TextReveal";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="WorkflowPipeline"
        component={WorkflowPipeline}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        schema={workflowSchema}
        defaultProps={{
          title: "AI Script Workflow",
          step1: "TikTok transcript",
          step2: "Claude analyzes hook",
          step3: "Claude rewrites stronger hook",
          step4: "Generate CTA",
          step5: "Export script",
          accentColor: "#CC785C",
        }}
      />

      <Composition
        id="CardReveal"
        component={CardReveal}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        schema={cardRevealSchema}
        defaultProps={{
          brandName: "AnimStats",
          tagline: "New Collab",
          icon1Initial: "A",
          icon2Initial: "S",
          icon1Color: "#7C5CBF",
          icon2Color: "#E8708A",
        }}
      />

      <Composition
        id="KineticType"
        component={KineticType}
        durationInFrames={260}
        fps={30}
        width={1920}
        height={1080}
        schema={kineticTypeSchema}
        defaultProps={{
          line1: "THE LIGHT",
          line2: "that never fades",
          line3: "ENDURES.",
          accentColor: "#D4AF7A",
        }}
      />

      <Composition
        id="QuoteOverlay"
        component={QuoteOverlay}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        schema={quoteOverlaySchema}
        defaultProps={{
          textColor: "#ffffff",
          backgroundColor: "#111111",
        }}
      />

      <Composition
        id="TextReveal"
        component={TextReveal}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={textRevealSchema}
        defaultProps={{
          text: "This is your moment to shine",
          textColor: "#000000",
          backgroundColor: "#ffffff",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
