# Replacing Practice Assets

This project uses replaceable local assets for Practice mode presentation and
audio. Final artwork and licensed sound files can be swapped without rewriting
gameplay logic.

## Directory layout

```text
apps/web/public/assets/
  moves/                 Move icon placeholders (SVG)
  audio/sfx/             Future sound effect files
  audio/music/           Future music tracks
  animations/reveal/     Future reveal animation assets
  animations/victory/    Future victory animation assets
  animations/defeat/     Future defeat animation assets
apps/web/src/features/practice/moves/move-metadata.ts
apps/web/src/lib/audio/sound-registry.ts
```

## Move icons

1. Add or replace SVG files under `public/assets/moves/`.
2. Update paths in `move-metadata.ts` if filenames change.
3. Keep text labels in the UI so moves remain understandable without icons.

## Sound effects and music

1. Add approved files under `public/assets/audio/sfx/` or
   `public/assets/audio/music/`.
2. Register the asset in `sound-registry.ts` with category, label, and enabled
   flag.
3. Extend `audio-engine.ts` to load file based assets when a path is present.
4. Until files are approved, generated tones remain the fallback.

Current temporary tones are original synthesized output from the Web Audio API.
They are not third party downloads.

## Animations

Practice reveal, victory, and defeat currently use CSS motion in
`practice-game.module.css`.

To replace them later:

1. Add lightweight assets under `public/assets/animations/`.
2. Wire them through dedicated presentation components.
3. Respect reduced motion by disabling or simplifying animation when
   `settings.reducedMotion` is true.

## Licensing rule

Do not add third party assets unless license, attribution, and commercial use
terms are verified. Record every asset in `docs/asset-license-manifest.json`.
