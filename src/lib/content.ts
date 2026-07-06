import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

/**
 * The ONLY entry point for site content. Reads /content at build time and
 * structurally refuses to return anything not marked `isPublic: true`
 * (04-content-and-privacy.md hard rule).
 */

export type JournalEntry = {
  slug: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  place: string;
  tags: string[];
  excerpt: string;
  body: string;
  featured: boolean;
};

export type Essay = {
  slug: string;
  date: string; // year or ISO date
  title: string;
  hook: string;
  tags: string[];
  body: string;
};

const CONTENT_DIR = join(process.cwd(), "content");

// Never render editorial HTML comments (TODO notes to Skyler) on the site.
const stripComments = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "").trim();

// YAML parses bare dates as UTC Date objects; keep the literal yyyy-mm-dd
// (toISOString stays in UTC — no local-timezone day shift).
const isoDate = (d: unknown) =>
  d instanceof Date ? d.toISOString().slice(0, 10) : String(d);

function readPublicFiles(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(dir, f), "utf8"));
      return { slug: f.replace(/\.md$/, ""), data, body: stripComments(content) };
    })
    .filter(({ data }) => data.isPublic === true);
}

export function getJournals(): JournalEntry[] {
  return readPublicFiles(join(CONTENT_DIR, "journals"))
    .map(({ slug, data, body }) => ({
      slug,
      date: isoDate(data.date),
      title: String(data.title),
      place: String(data.place),
      tags: (data.tags ?? []) as string[],
      excerpt: String(data.excerpt ?? ""),
      body,
      featured: data.featured === true,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getJournal(slug: string): JournalEntry | undefined {
  return getJournals().find((j) => j.slug === slug);
}

export function getEssays(): Essay[] {
  return readPublicFiles(join(CONTENT_DIR, "essays"))
    .map(({ slug, data, body }) => ({
      slug,
      date: isoDate(data.date),
      title: String(data.title),
      hook: String(data.hook ?? ""),
      tags: (data.tags ?? []) as string[],
      body,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getEssay(slug: string): Essay | undefined {
  return getEssays().find((e) => e.slug === slug);
}

export type BuildStatus = "Live" | "Prototype" | "Internal";

export type Build = {
  id: string;
  name: string;
  status: BuildStatus;
  featured: boolean;
  oneLiner: string;
  detail: string;
  stack: string[];
  links: { label: string; url: string }[];
};

export function getBuilds(): Build[] {
  // builds.json is pre-vetted public product copy (04-content-and-privacy.md)
  return JSON.parse(
    readFileSync(join(CONTENT_DIR, "builds.json"), "utf8"),
  ) as Build[];
}

export function getBuild(id: string): Build | undefined {
  return getBuilds().find((b) => b.id === id);
}

export const journalTags = (js: JournalEntry[]) =>
  [...new Set(js.flatMap((j) => j.tags))].sort();

export const journalPlaces = (js: JournalEntry[]) =>
  [...new Set(js.map((j) => j.place))].sort();

export const journalYears = (js: JournalEntry[]) =>
  [...new Set(js.map((j) => j.date.slice(0, 4)))].sort().reverse();
