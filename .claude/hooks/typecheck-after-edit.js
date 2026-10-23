// PostToolUse hook: posle izmene .ts fajla u backend/ pokrece typecheck. Exit 2 + stderr = Claude vidi gresku odmah.
const { spawnSync } = require("node:child_process");
const path = require("node:path");

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let file = "";
  try {
    file = JSON.parse(raw).tool_input?.file_path ?? "";
  } catch {
    process.exit(0);
  }

  const norm = file.split(path.sep).join("/").replace(/\\/g, "/");
  if (!/\/backend\/(src|tests)\/.+\.ts$/.test(norm)) process.exit(0);

  const backend = path.resolve(__dirname, "../../backend");
  const r = spawnSync("npm run typecheck --silent", { cwd: backend, shell: true, encoding: "utf8" });
  if (r.status !== 0) {
    process.stderr.write("Typecheck pao posle izmene " + file + ":\n" + (r.stdout || "") + (r.stderr || ""));
    process.exit(2);
  }
  process.exit(0);
});
