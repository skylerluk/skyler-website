# skylerluk.com — project rules (keep this lean)

Personal website: a candlelit desk you light and explore. Goal: a visitor **feels who Skyler is and remembers it.** Warm, filmic, intimate, first-person. Copy this file to the repo root at `Dev/skyler-website/CLAUDE.md`.

## Commands
- dev `npm run dev` · build `npm run build` · lint `npm run lint` · typecheck `npm run typecheck`
- Run build + lint + typecheck before committing a milestone. Every commit must leave the app runnable.

## Non-negotiables (YOU MUST)
- **Privacy.** Publish ONLY `/content/**` files marked `isPublic: true`. Never publish a real person's name from journals or any excluded/hard-rule material (see `04-content-and-privacy.md`). Run the privacy audit in `07` before every commit. When unsure, exclude.
- **Never invent content.** Journal/essay text is pre-vetted in `/content`. If content is missing, leave a `TODO` and ask — do not fabricate.
- **Art:** baked 2.5D cinematic (see `01`). Not flat vector, not live WebGL/3D.
- **Warm palette only.** Labels always legible once lit. The candle is the switch (no button).
- **Never commit secrets/.env.**

## Spec (load on demand — don't dump it all into context)
Index: @00-START-HERE.md · Specs: @01-art-direction.md @02-flow-and-motion.md @03-sections.md @04-content-and-privacy.md @05-data-and-routing.md @06-build-plan.md @07-verification-and-guardrails.md

## Git
Repo `github.com/skylerluk/skyler-website`. Commit per part, branch per milestone, use `gh` for PRs. Keep `main` building. (Deploy target domain is still `skylerluk.com`.)
