import { VirtualRepo } from "../dist/index.js";

async function main() {
  // Use a small public repo with a known default branch.
  const repo = new VirtualRepo("Noisemaker111/BetterRepo", { branch: "master" });

  const root = await repo.listdir("");
  console.log("root entries (first 25):", root.slice(0, 25));

  const readme = await repo.readFile("README.md");
  console.log("README.md first 100 chars:", readme.slice(0, 100));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
