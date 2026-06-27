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

  console.log("✓ Seed complete");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
