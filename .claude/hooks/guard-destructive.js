// PreToolUse hook: blokira komande koje brisu migracije ili bazu. Exit 2 = blokiraj, stderr ide Claude-u.
// Push / reset --hard / migrate:down nisu ovde nego u permissions.ask (settings.json) — korisnik potvrdjuje.
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    cmd = JSON.parse(raw).tool_input?.command ?? "";
  } catch {
    process.exit(0);
  }

  const pravila = [
    [/(rm|del|rmdir|Remove-Item)\b[^\n]*migrations/i, "Brisanje migracija je zabranjeno — primenjena migracija se ne menja ni brise, dodaje se nova (ARHITEKTURA.md §4)."],
    [/drop\s+(database|schema)/i, "DROP DATABASE/SCHEMA je blokiran — uradi to rucno ako zaista treba."],
    [/truncate\s+table/i, "Rucni TRUNCATE je blokiran (testovi ga rade kroz tests/helpers/db.ts nad _test bazom)."],
  ];

  for (const [re, poruka] of pravila) {
    if (re.test(cmd)) {
      process.stderr.write(poruka + "\n");
      process.exit(2);
    }
  }
  process.exit(0);
});
