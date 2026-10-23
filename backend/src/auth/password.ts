import bcrypt from "bcrypt";

// broj rundi hesiranja — vise rundi = sporije brute-force, ali i sporiji login; 10 je standardni default
const SALT_ROUNDS = 10;

export function hashPassword(lozinkaUCistomTekstu: string): Promise<string> {
  return bcrypt.hash(lozinkaUCistomTekstu, SALT_ROUNDS);
}

export function verifyPassword(lozinkaUCistomTekstu: string, hash: string): Promise<boolean> {
  return bcrypt.compare(lozinkaUCistomTekstu, hash);
}
