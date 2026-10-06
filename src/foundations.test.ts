import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const root = dirname(fileURLToPath(import.meta.url));
const files = ["slip.module.css", "index.css", "PublicAgencyEntry.module.css"];

function withoutMedia(css: string): string {
  return css
    .split("\n")
    .filter((line) => !line.includes("@media"))
    .join("\n");
}

describe("frontend foundations", () => {
  it("uses kit tokens for type, space, and color", () => {
    for (const file of files) {
      const css = readFileSync(join(root, file), "utf8");
      expect(css, file).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(withoutMedia(css), file).not.toMatch(/\d+px/);
      expect(css, file).not.toContain("--mute");
      expect(css, file).not.toMatch(/font-size:\s*(11|12|13|15|18|22|30)px/);
    }
    const slip = readFileSync(join(root, "slip.module.css"), "utf8");
    expect(slip).toContain("var(--text-xl)");
    expect(slip).toContain("var(--signal-wash)");
    expect(slip).toContain("var(--space-6)");
    expect(slip).toContain("var(--space-5)");
    expect(slip).not.toContain("--text-body");
    const page = readFileSync(join(root, "index.css"), "utf8");
    expect(page).not.toMatch(/font-size/);
  });
});
