export interface PasswordStrength {
  level: 0 | 1 | 2 | 3 | 4; // broj popunjenih segmenata indikatora
  message: string;
}

// jačina po 4 kriterijuma: dužina ≥ 8, mala+velika slova, cifra, simbol (samo savet korisniku; pravilo servera je min. 8 karaktera)
export function getPasswordStrength(password: string): PasswordStrength {
  if (password === "") return { level: 0, message: "Minimalno 8 karaktera" };
  const level = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length as PasswordStrength["level"];
  if (level === 4) return { level, message: "Lozinka je snažna (uključuje simbole i cifre)" };
  if (level === 3) return { level, message: "Lozinka je dobra" };
  return { level, message: "Lozinka je slaba — dodajte velika slova, cifre i simbole" };
}
