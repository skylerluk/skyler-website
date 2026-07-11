# public/assets — CC0 asset sources

All assets here are CC0:

- `hdri/artist_workshop_1k.hdr` — Poly Haven (polyhaven.com/a/artist_workshop)
- `wood/walnut_diff.jpg` + `wood/walnut_nor.jpg` — procedurally generated cathedral
  walnut (diffuse + normal), `scripts/generate-wood.mjs`. Domain-warped fBm; one
  board across the whole desk (repeat [1,1]), no tile seam. Not a photo asset.
- `metal/Metal009_*.jpg` — ambientCG "Metal 009" brushed metal (ambientcg.com/view?id=Metal009)
- `paper/Paper001_*.jpg` — ambientCG "Paper 001" (ambientcg.com/view?id=Paper001)
- `models/binder_notebook/` — Poly Haven "Binder Notebook" (polyhaven.com/a/binder_notebook)

MacBook, candle, phone, folder, papers and books are procedural geometry
(RoundedBox/lathe/extrude) textured with the maps above — 08's sanctioned
fallback where no clean CC0 GLTF exists.
