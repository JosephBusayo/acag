// Runs the hairstyle matcher on each demo screenshot (photo 3 of every style) against the
// seeded portfolio, and reports whether the right style came back. Run: npm run match:check
import { readdirSync, readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { matchImage } from "../src/server/ai/match-image";
import { db } from "../src/server/db/client";
import { shops, styles } from "../src/server/db/schema";

// Screenshot file name to the styles a stylist would accept as its top match. Three file names
// don't describe their photos: "locs" shows chunky twists, "twists-men" shows short locs and
// "cornrows-women" shows box braids. Box and knotless braids look alike, so either counts.
const EXPECTED: Record<string, string[]> = {
  "knotless-braids": ["Knotless Braids", "Box Braids"],
  "box-braids": ["Box Braids", "Knotless Braids"],
  "cornrows-women": ["Box Braids", "Knotless Braids"],
  "silk-press": ["Silk Press"],
  locs: ["Two-Strand Twists", "Men's Twists"],
  "twists-women": ["Two-Strand Twists"],
  fade: ["Skin Fade"],
  "cornrows-men": ["Men's Cornrows"],
  "twists-men": ["Starter Locs"],
};

async function main() {
  const [shop] = await db.select().from(shops).where(eq(shops.slug, "crown-and-coil"));
  if (!shop) throw new Error("Seed the demo salon first: npm run db:seed");
  const rows = await db.select().from(styles).where(eq(styles.shopId, shop.id));
  const fetchImage = async (url: string) => Buffer.from(await (await fetch(url)).arrayBuffer());
  const portfolio = await Promise.all(
    rows.map(async (s) => ({ id: s.id, name: s.name, images: await Promise.all(s.imageUrls.slice(0, 2).map(fetchImage)) })),
  );
  const names = new Map(rows.map((s) => [s.id, s.name]));

  const only = process.argv[2];
  let right = 0;
  const files = readdirSync("demo-assets/screenshots").filter((f) => !only || f.startsWith(only));
  for (const file of files) {
    const key = file.replace(/\.jpg$/, "");
    const started = Date.now();
    const result = await matchImage(readFileSync(`demo-assets/screenshots/${file}`), portfolio);
    const found = result.matches.map((m) => `${names.get(m.productId)} ${m.confidence.toFixed(2)}`);
    const ok = EXPECTED[key]?.includes(names.get(result.matches[0]?.productId ?? "") ?? "") ?? false;
    if (ok) right++;
    console.log(`${ok ? "OK  " : "MISS"} ${key.padEnd(16)} ${result.status.padEnd(9)} ${found.join(" | ")}  (${Date.now() - started} ms)`);
  }
  console.log(`${right}/${files.length} top matches correct`);
  process.exit(0);
}

main().catch((error: Error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});
