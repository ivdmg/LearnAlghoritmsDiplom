const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const n = normalizeEmail(email);
  if (!EMAIL_RE.test(n)) return 'Некорректный email';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Пароль не короче 8 символов';
  if (password.length > 128) return 'Пароль слишком длинный';
  return null;
}
