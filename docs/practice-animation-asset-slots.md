# Practice Battle Arena — Animation Asset Slots

Replaceable asset slots for the Practice battle arena. Each slot accepts SVG or
Lottie (JSON or SMIL-export SVG) unless noted.

## Move selection (dock controls)

| Slot               | Recommended size | Format       | Current fallback                        |
| ------------------ | ---------------- | ------------ | --------------------------------------- |
| Rock selection     | 96×96 px         | SVG / Lottie | `/assets/moves/rock.svg` + ✊ emoji     |
| Paper selection    | 96×96 px         | SVG / Lottie | `/assets/moves/paper.svg` + ✋ emoji    |
| Scissors selection | 96×96 px         | SVG / Lottie | `/assets/moves/scissors.svg` + ✌️ emoji |

## Move reveal (battle stage)

| Slot            | Recommended size | Format       | Current fallback |
| --------------- | ---------------- | ------------ | ---------------- |
| Rock reveal     | 128×128 px       | SVG / Lottie | ✊ emoji         |
| Paper reveal    | 128×128 px       | SVG / Lottie | ✋ emoji         |
| Scissors reveal | 128×128 px       | SVG / Lottie | ✌️ emoji         |

## Identity

| Slot          | Recommended size | Format | Current fallback      |
| ------------- | ---------------- | ------ | --------------------- |
| Player avatar | 64×64 px         | SVG    | Lime monogram “P”     |
| CPU avatar    | 64×64 px         | SVG    | Angular placeholder ⬡ |

## Effects

| Slot           | Recommended size | Format          | Current fallback                                                                                     |
| -------------- | ---------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| VS impact      | 120×48 px        | SVG / Lottie    | “VS” typography                                                                                      |
| Victory effect | 480×240 px       | SVG / Lottie    | Green VICTORY text                                                                                   |
| Defeat effect  | 480×240 px       | SVG / Lottie    | Red DEFEAT text                                                                                      |
| Confetti       | 609×812 viewBox  | Lottie SVG/JSON | `animations/Confetti Effects Lottie Animation.svg` → `public/assets/animations/confetti-victory.svg` |

## Integration

Slots are defined in
`apps/web/src/features/practice/assets/practice-asset-slots.ts`. To swap art:

1. Add files under `apps/web/public/assets/…`
2. Update the slot `path` in `practice-asset-slots.ts`
3. Update `docs/asset-license-manifest.json`

No component rewrites are required when paths stay within the slot map.
