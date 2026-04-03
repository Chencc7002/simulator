# Generated Data

This folder stores front-end-facing runtime data derived from the reviewed `data/source` layer.

Current status:
- `champions.json` contains 19 generated entries for the current Set 17 PBE rule:
  - 4-cost and above
  - exclude only tanks
- `items.json` contains 25 generated craftable offense-oriented items:
  - composition length = 2
  - exclude `Artifact`
  - selected from non-tank role recommendations in the Set 17 PBE lookup
- `items.browser.js` mirrors `items.json` as a browser global for local-file front-end loading

Build scripts:
- `scripts/build-generated-champions.cjs`
- `scripts/build-generated-items.cjs`

Practical run commands in this workspace:
- `Get-Content scripts\\build-generated-champions.cjs -Raw | node -`
- `Get-Content scripts\\build-generated-items.cjs -Raw | node -`

Generation notes:
- display names, short names, and role names prefer the Chinese mapping layer
- trait names use a runtime translation table and fall back to `待翻译`
- ability names use a runtime translation table and fall back to `待翻译`
- `descriptionZh` is intentionally `null` for now
- `descriptionRaw` keeps the English source text until a reviewed Chinese translation layer is added
- item names prefer `data/source/defaults/zh-items.json5`
- item effect fields remain close to the raw lookup names for traceability
- the current HTML loads `items.browser.js` before `app-bundle.js`
- the current DPS model should prioritize output-related special effects; purely defensive trigger effects can stay out of scope for now
