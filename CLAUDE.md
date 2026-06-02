# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Remotion Studio (browser preview at localhost:3000)
npm run build      # Bundle the project for deployment
npm run lint       # Run ESLint + TypeScript type check (eslint src && tsc)
npx remotion render                    # Render the default composition
npx remotion render HelloWorld         # Render a specific composition by ID
npx remotion render HelloWorld out/video.mp4  # Render to a specific output path
npx remotion upgrade   # Upgrade all Remotion packages
```

There are no automated tests. Linting is `eslint src && tsc` — both must pass.

## Architecture

This is a [Remotion](https://www.remotion.dev) project — videos are React components that render frame-by-frame. Each frame is a static React render; animation is achieved by reading `useCurrentFrame()` and computing values from it.

### Entry point and composition registration

`src/index.ts` → calls `registerRoot(RemotionRoot)`. This is the file passed to Remotion CLI commands.

`src/Root.tsx` → defines all `<Composition>` entries. **Every video composition must be registered here** to appear in Studio's sidebar. Each `<Composition>` declares its ID, component, duration (frames), fps, and dimensions. The `schema` prop (a Zod object) enables the Studio props editor UI.

### Current compositions

| ID | Component | Duration | Size |
|----|-----------|----------|------|
| `HelloWorld` | `src/HelloWorld.tsx` | 150 frames @ 30fps | 1920×1080 |
| `OnlyLogo` | `src/HelloWorld/Logo.tsx` | 150 frames @ 30fps | 1920×1080 |

### Animation model

- `useCurrentFrame()` — returns current frame index (0-based integer)
- `useVideoConfig()` — returns `{ fps, width, height, durationInFrames }`
- `spring({ frame, fps, config })` — physics-based easing, returns 0→1
- `interpolate(value, inputRange, outputRange, options)` — maps a value from one range to another; use `extrapolateLeft/Right: "clamp"` to prevent overshoot
- `<Sequence from={N}>` — offsets time for children so they see frame 0 at parent's frame N
- `<AbsoluteFill>` — shorthand for `position: absolute; top/right/bottom/left: 0`

### SVG gradient IDs

Components that render SVG gradients (`Arc.tsx`, `Atom.tsx`) use `useState(() => String(random(null)))` to generate a stable, unique gradient ID per instance. This pattern is required when the same component is mounted multiple times to avoid gradient conflicts.

### Props and schemas

Composition props are defined with Zod schemas (e.g. `myCompSchema` in `HelloWorld.tsx`). `zColor()` from `@remotion/zod-types` validates hex color strings and renders a color picker in Studio. Always co-locate the schema with the component and export both.

### Shared constants

`src/HelloWorld/constants.ts` holds shared `COLOR_1` and `FONT_FAMILY` values used across components. Extend this file for project-wide design tokens.

## Config

`remotion.config.ts` — sets JPEG frame output format and enables overwrite. These settings apply only to CLI rendering, not to Node.js API calls.

Prettier: 2-space indentation, spaces (not tabs), bracket spacing.
