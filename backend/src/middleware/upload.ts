import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import multer from "multer";

// backend/uploads/otisci, bez obzira odakle je proces pokrenut (racunato od ovog fajla, ne od cwd)
const UPLOADS_ROOT = path.join(__dirname, "..", "..", "uploads", "otisci");
fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

// izlazi 3D skenera (digitalni otisak) + skenirani/fotografisani analogni dokumenti
const DOZVOLJENE_EKSTENZIJE = [".stl", ".ply", ".obj", ".pdf", ".jpg", ".jpeg", ".png", ".zip"];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOADS_ROOT),
  filename: (_req, file, callback) => {
    // nasumicno ime na disku (ne original) — sprecava path traversal i koliziju imena
    const ekstenzija = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${ekstenzija}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB — 3D skener fajlovi mogu biti veliki
  fileFilter: (_req, file, callback) => {
    const ekstenzija = path.extname(file.originalname).toLowerCase();
    if (!DOZVOLJENE_EKSTENZIJE.includes(ekstenzija)) {
      callback(new Error(`Nedozvoljen tip fajla: ${ekstenzija}`));
      return;
    }
    callback(null, true);
  },
});

// putanja koja se upisuje u otisci.fajl_path — relativna na uploads/otisci, ne apsolutna sa diska.
// namerno path.posix (ne path.join) da vrednost u bazi bude ista na Windows-u i na Linux-u (Docker, Faza 16)
export function otisakFajlPath(fileName: string): string {
  return path.posix.join("otisci", fileName);
}
