import manifestJson from "../../public/desk/manifest.json";

export type HitArea = { x: number; y: number; w: number; h: number };

export type DeskObjectDef = {
  id: string;
  label: string;
  section: string | null;
  route: string | null;
  asset: string;
  depth: number;
  hit: HitArea;
  /** caption anchor: center-x / top-y, fractions of the canvas, placed clear of every object */
  caption: { x: number; y: number };
};

export type DeskManifest = {
  canvas: { w: number; h: number };
  art: string;
  objects: DeskObjectDef[];
  flame: { x: number; y: number };
};

export const deskManifest = manifestJson as DeskManifest;

export const clickableObjects = deskManifest.objects.filter(
  (o): o is DeskObjectDef & { route: string } => o.route !== null,
);

export const candle = deskManifest.objects.find((o) => o.id === "candle")!;
