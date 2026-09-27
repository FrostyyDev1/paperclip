import { mkdir, copyFile } from "node:fs/promises";

await mkdir("dist/cliplab", { recursive: true });

for (const file of ["LICENSE", "PROVENANCE.md"]) {
  await copyFile(
    `src/cliplab/${file}`,
    `dist/cliplab/${file}`
  );
}
