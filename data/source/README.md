# Source Data Layout

This folder is the human-reviewed source-of-truth layer.

Goals:
- keep one entity per file
- keep source URLs and verification notes close to the data
- allow partial records with `null` fields while we are still collecting data
- make manual edits easy before any generated runtime JSON is produced

Current status:
- structure is in place
- first sample champions are from the current MetaTFT PBE `/units` ranking flow
- champion detail fields such as base stats, cost, traits, and ability text are now sourced from the Set 17 PBE lookup JSON for the first sample champions
- `stats` is reserved for confirmed base values from a source lookup
- `displayStatsByStar` is reserved for manually reviewed 1/2/3-star panel values when the site shows expanded arrays that are not directly available in the lookup source
- raw source values may stay in English when they are copied directly from MetaTFT
- the website should consume a Chinese-first display layer so all user-facing text can remain Chinese

Recommended workflow:
1. edit files in `data/source/**`
2. verify or update `review` fields
3. fill `displayStatsByStar` only when you have visually verified the panel values
4. keep user-facing translations in `data/source/defaults/zh-display.json5`
5. later add a build step that converts these JSON5 files into `data/generated/*.json`

Important note:
- the current MetaTFT PBE units endpoint reported `patch: 17.1` on `2026-04-02`
- these sample files follow the live source response, even though the project target is Set 17 PBE more broadly
