import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../app/_lib/db/schema";

const client = postgres(process.env.DATABASE_URL_DIRECT!);
const db = drizzle(client, { schema });

async function seed() {
  // ─── Governing Bodies ───────────────────────────────────────────────────────
  console.log("Seeding governing bodies...");
  await db
    .insert(schema.governingBodies)
    .values([
      { slug: "ndca", name: "National Dance Council of America", abbreviation: "NDCA" },
      { slug: "dvida", name: "Dance Vision International Dance Association", abbreviation: "DVIDA" },
      { slug: "istd", name: "Imperial Society of Teachers of Dancing", abbreviation: "ISTD" },
      { slug: "arthur-murray", name: "Arthur Murray International", abbreviation: "Arthur Murray" },
      { slug: "fred-astaire", name: "Fred Astaire Dance Studios", abbreviation: "Fred Astaire" },
    ])
    .onConflictDoNothing();

  // ─── Dance Styles ───────────────────────────────────────────────────────────
  console.log("Seeding dance styles...");
  await db
    .insert(schema.danceStyles)
    .values([
      // International Standard
      { slug: "waltz",          name: "Waltz",          category: "standard" },
      { slug: "tango",          name: "Tango",          category: "standard" },
      { slug: "viennese-waltz", name: "Viennese Waltz", category: "standard" },
      { slug: "foxtrot",        name: "Foxtrot",        category: "standard" },
      { slug: "quickstep",      name: "Quickstep",      category: "standard" },
      // International Latin
      { slug: "cha-cha",    name: "Cha Cha",    category: "latin" },
      { slug: "samba",      name: "Samba",      category: "latin" },
      { slug: "rumba",      name: "Rumba",      category: "latin" },
      { slug: "paso-doble", name: "Paso Doble", category: "latin" },
      { slug: "jive",       name: "Jive",       category: "latin" },
      // American Smooth
      { slug: "smooth-waltz",          name: "Waltz",          category: "smooth" },
      { slug: "smooth-tango",          name: "Tango",          category: "smooth" },
      { slug: "smooth-foxtrot",        name: "Foxtrot",        category: "smooth" },
      { slug: "smooth-viennese-waltz", name: "Viennese Waltz", category: "smooth" },
      // American Rhythm
      { slug: "rhythm-cha-cha",  name: "Cha Cha",         category: "rhythm" },
      { slug: "rhythm-rumba",    name: "Rumba",           category: "rhythm" },
      { slug: "east-coast-swing", name: "East Coast Swing", category: "rhythm" },
      { slug: "bolero",          name: "Bolero",          category: "rhythm" },
      { slug: "mambo",           name: "Mambo",           category: "rhythm" },
    ])
    .onConflictDoNothing();

  // ─── Dance Levels ───────────────────────────────────────────────────────────
  console.log("Seeding dance levels...");
  const styles = await db
    .select({ id: schema.danceStyles.id })
    .from(schema.danceStyles);

  await db
    .insert(schema.danceLevels)
    .values(
      styles.flatMap(({ id: styleId }) => [
        { styleId, name: "bronze" as const, order: 1 },
        { styleId, name: "silver" as const, order: 2 },
        { styleId, name: "gold"   as const, order: 3 },
        { styleId, name: "open"   as const, order: 4 },
      ])
    )
    .onConflictDoNothing();

  // ─── Patterns ───────────────────────────────────────────────────────────────
  console.log("Seeding patterns...");

  // Look up styles and their levels so we can map slugs → IDs
  const styleRows = await db
    .select({ id: schema.danceStyles.id, slug: schema.danceStyles.slug })
    .from(schema.danceStyles);

  const levelRows = await db
    .select({ id: schema.danceLevels.id, styleId: schema.danceLevels.styleId, name: schema.danceLevels.name })
    .from(schema.danceLevels);

  const styleBySlug = Object.fromEntries(styleRows.map((s) => [s.slug, s.id]));

  function levelId(styleSlug: string, levelName: "bronze" | "silver" | "gold" | "open"): string {
    const sId = styleBySlug[styleSlug];
    if (!sId) throw new Error(`Unknown style slug: ${styleSlug}`);
    const level = levelRows.find((l) => l.styleId === sId && l.name === levelName);
    if (!level) throw new Error(`Missing level ${levelName} for ${styleSlug}`);
    return level.id;
  }

  const patternSeeds: Array<{
    styleSlug: string;
    levelName: "bronze" | "silver" | "gold" | "open";
    patterns: Array<{ name: string; description?: string; order: number }>;
  }> = [
    // ── International Standard: Waltz ───────────────────────────────────────
    {
      styleSlug: "waltz",
      levelName: "bronze",
      patterns: [
        { name: "Natural Turn", order: 1 },
        { name: "Reverse Turn", order: 2 },
        { name: "Closed Changes", order: 3 },
        { name: "Natural Spin Turn", order: 4 },
        { name: "Whisk", order: 5 },
        { name: "Chasse from PP", order: 6 },
        { name: "Outside Change", order: 7 },
        { name: "Progressive Chasse to Right", order: 8 },
      ],
    },
    {
      styleSlug: "waltz",
      levelName: "silver",
      patterns: [
        { name: "Double Reverse Spin", order: 1 },
        { name: "Reverse Corte", order: 2 },
        { name: "Back Whisk", order: 3 },
        { name: "Back Lock", order: 4 },
        { name: "Natural Hesitation", order: 5 },
        { name: "Outside Spin", order: 6 },
        { name: "Turning Lock", order: 7 },
        { name: "Drag Hesitation", order: 8 },
        { name: "Hover Corte", order: 9 },
      ],
    },
    // ── International Standard: Tango ───────────────────────────────────────
    {
      styleSlug: "tango",
      levelName: "bronze",
      patterns: [
        { name: "Walks", order: 1 },
        { name: "Progressive Side Step", order: 2 },
        { name: "Link", order: 3 },
        { name: "Closed Promenade", order: 4 },
        { name: "Open Promenade", order: 5 },
        { name: "Open Reverse Turn (lady outside)", order: 6 },
        { name: "Progressive Link", order: 7 },
        { name: "Back Open Promenade", order: 8 },
      ],
    },
    // ── International Standard: Foxtrot ─────────────────────────────────────
    {
      styleSlug: "foxtrot",
      levelName: "bronze",
      patterns: [
        { name: "Feather Step", order: 1 },
        { name: "Reverse Turn", order: 2 },
        { name: "Three-Step", order: 3 },
        { name: "Natural Turn", order: 4 },
        { name: "Change of Direction", order: 5 },
        { name: "Feather Finish", order: 6 },
        { name: "Reverse Wave", order: 7 },
        { name: "Closed Impetus", order: 8 },
        { name: "Open Telemark", order: 9 },
      ],
    },
    // ── International Standard: Quickstep ───────────────────────────────────
    {
      styleSlug: "quickstep",
      levelName: "bronze",
      patterns: [
        { name: "Quarter Turns", order: 1 },
        { name: "Progressive Chasse", order: 2 },
        { name: "Forward Lock Step", order: 3 },
        { name: "Natural Turn", order: 4 },
        { name: "Natural Pivot Turn", order: 5 },
        { name: "Natural Spin Turn", order: 6 },
        { name: "Reverse Turn", order: 7 },
        { name: "Tipple Chasse to Right", order: 8 },
        { name: "Progressive Chasse to Right", order: 9 },
      ],
    },
    // ── International Latin: Cha Cha ────────────────────────────────────────
    {
      styleSlug: "cha-cha",
      levelName: "bronze",
      patterns: [
        { name: "Basic Movement", order: 1 },
        { name: "New York", order: 2 },
        { name: "Spot Turn to Left (lady right)", order: 3 },
        { name: "Underarm Turn to Left", order: 4 },
        { name: "Underarm Turn to Right", order: 5 },
        { name: "Hand to Hand", order: 6 },
        { name: "Three Cha Chas Left", order: 7 },
        { name: "Three Cha Chas Right", order: 8 },
        { name: "Side Steps", order: 9 },
        { name: "There and Back", order: 10 },
      ],
    },
    // ── International Latin: Rumba ───────────────────────────────────────────
    {
      styleSlug: "rumba",
      levelName: "bronze",
      patterns: [
        { name: "Basic Movement", order: 1 },
        { name: "New York", order: 2 },
        { name: "Spot Turn to Left (lady right)", order: 3 },
        { name: "Underarm Turn to Left", order: 4 },
        { name: "Underarm Turn to Right", order: 5 },
        { name: "Hand to Hand", order: 6 },
        { name: "Three Threes", order: 7 },
        { name: "Side Steps", order: 8 },
        { name: "Volta", order: 9 },
        { name: "Alemana", order: 10 },
      ],
    },
    // ── International Latin: Samba ───────────────────────────────────────────
    {
      styleSlug: "samba",
      levelName: "bronze",
      patterns: [
        { name: "Natural Basic Movement", order: 1 },
        { name: "Reverse Basic Movement", order: 2 },
        { name: "Samba Walks in PP", order: 3 },
        { name: "Whisks", order: 4 },
        { name: "Samba Locks Forward", order: 5 },
        { name: "Samba Locks Backward", order: 6 },
        { name: "Volta Spot Turn to Left", order: 7 },
        { name: "Volta Spot Turn to Right", order: 8 },
        { name: "Side Samba Walk", order: 9 },
      ],
    },
    // ── International Latin: Jive ────────────────────────────────────────────
    {
      styleSlug: "jive",
      levelName: "bronze",
      patterns: [
        { name: "Basic in Place", order: 1 },
        { name: "Fallaway Rock", order: 2 },
        { name: "Fallaway Throwaway", order: 3 },
        { name: "Link", order: 4 },
        { name: "Change of Places (lady right to left)", order: 5 },
        { name: "Change of Places (lady left to right)", order: 6 },
        { name: "Change of Hands Behind Back", order: 7 },
        { name: "American Spin", order: 8 },
        { name: "Mooch", order: 9 },
        { name: "Toe Heel Swivels", order: 10 },
      ],
    },
    // ── American Rhythm: Cha Cha ─────────────────────────────────────────────
    {
      styleSlug: "rhythm-cha-cha",
      levelName: "bronze",
      patterns: [
        { name: "Basic Movement", order: 1 },
        { name: "New Yorker", order: 2 },
        { name: "Underarm Turn", order: 3 },
        { name: "Spot Turn", order: 4 },
        { name: "Fifth Position Break", order: 5 },
        { name: "Switch Turns", order: 6 },
        { name: "Chase", order: 7 },
        { name: "Open Break with Underarm Turn", order: 8 },
      ],
    },
    // ── American Rhythm: Rumba ───────────────────────────────────────────────
    {
      styleSlug: "rhythm-rumba",
      levelName: "bronze",
      patterns: [
        { name: "Box Step", order: 1 },
        { name: "Fifth Position Break", order: 2 },
        { name: "Underarm Turn", order: 3 },
        { name: "Spot Turn", order: 4 },
        { name: "Progressive Walks", order: 5 },
        { name: "Cuban Walks", order: 6 },
        { name: "Cuddle", order: 7 },
        { name: "Crossover Break", order: 8 },
      ],
    },
    // ── American Rhythm: East Coast Swing ────────────────────────────────────
    {
      styleSlug: "east-coast-swing",
      levelName: "bronze",
      patterns: [
        { name: "Single Rhythm Basic", order: 1 },
        { name: "Double Rhythm Basic", order: 2 },
        { name: "Triple Rhythm Basic", order: 3 },
        { name: "Left Underarm Turn", order: 4 },
        { name: "Right Underarm Turn", order: 5 },
        { name: "Tuck Turn", order: 6 },
        { name: "Inside Roll", order: 7 },
        { name: "Outside Roll", order: 8 },
        { name: "Lindy Circle", order: 9 },
      ],
    },
    // ── American Smooth: Waltz ───────────────────────────────────────────────
    {
      styleSlug: "smooth-waltz",
      levelName: "bronze",
      patterns: [
        { name: "Natural Turn", order: 1 },
        { name: "Reverse Turn", order: 2 },
        { name: "Progressive Step", order: 3 },
        { name: "Twinkle", order: 4 },
        { name: "Open Twinkle", order: 5 },
        { name: "Underarm Turn", order: 6 },
        { name: "Conversation Piece", order: 7 },
        { name: "Box Step", order: 8 },
        { name: "Left Box", order: 9 },
      ],
    },
    // ── American Smooth: Foxtrot ─────────────────────────────────────────────
    {
      styleSlug: "smooth-foxtrot",
      levelName: "bronze",
      patterns: [
        { name: "Magic Step", order: 1 },
        { name: "Open Step", order: 2 },
        { name: "Promenade", order: 3 },
        { name: "Rock Turn", order: 4 },
        { name: "Progressive Step", order: 5 },
        { name: "Conversation Piece", order: 6 },
        { name: "Underarm Turn", order: 7 },
        { name: "Feather Step", order: 8 },
        { name: "Three Step", order: 9 },
      ],
    },
    // ── American Smooth: Tango ───────────────────────────────────────────────
    {
      styleSlug: "smooth-tango",
      levelName: "bronze",
      patterns: [
        { name: "Basic", order: 1 },
        { name: "Corte", order: 2 },
        { name: "Open Promenade", order: 3 },
        { name: "Reverse Turn", order: 4 },
        { name: "Progressive Link", order: 5 },
        { name: "Fan and Sweep", order: 6 },
        { name: "Back Corte", order: 7 },
        { name: "Natural Turn", order: 8 },
      ],
    },
  ];

  for (const group of patternSeeds) {
    const sId = styleBySlug[group.styleSlug];
    if (!sId) {
      console.warn(`Skipping unknown style: ${group.styleSlug}`);
      continue;
    }
    const lId = levelId(group.styleSlug, group.levelName);
    await db
      .insert(schema.patterns)
      .values(
        group.patterns.map((p) => ({
          styleId: sId,
          levelId: lId,
          name: p.name,
          description: p.description ?? null,
          order: p.order,
        }))
      )
      .onConflictDoNothing();
  }

  console.log("✓ Seed complete");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
