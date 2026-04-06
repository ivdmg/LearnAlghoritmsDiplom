const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
// Усиленный: минимум 8 символов, хотя бы 1 буква + 1 цифра
const PASSWORD_LETTER_RE = /[a-zA-Zа-яА-ЯёЁ]/;
const PASSWORD_DIGIT_RE = /\d/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const n = normalizeEmail(email);
  if (!EMAIL_RE.test(n)) return 'Некорректный email';
  return null;
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return 'Имя пользователя: 3–24 символа, только латиница, цифры и _';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Пароль не короче 8 символов';
  if (password.length > 128) return 'Пароль слишком длинный';
  if (!PASSWORD_LETTER_RE.test(password)) return 'Пароль должен содержать хотя бы одну букву';
  if (!PASSWORD_DIGIT_RE.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
  return null;
}

/**
 * Превращает Prisma-ошибку unique-constraint (P2002) в человеко-читаемое сообщение.
 */
export function uniqueConstraintError(err: unknown): { status: number; error: string } | null {
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  ) {
    const target = (err as { meta?: { target?: string | string[] } }).meta?.target;
    if (Array.isArray(target) && target.includes('username')) {
      return { status: 409, error: 'Это имя пользователя уже занято' };
    }
    if (Array.isArray(target) && target.includes('email')) {
      return { status: 409, error: 'Этот email уже зарегистрирован' };
    }
    return { status: 409, error: 'Дублирующиеся данные. Попробуйте другие значения.' };
  }
  return null;
}
