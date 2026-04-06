import 'dotenv/config';

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

/** Список разрешённых фронтенд-орижинов (через запятую в CORS_ORIGINS) */
const originRaw = process.env.CORS_ORIGINS ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const corsOrigins = originRaw
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 3000),
  frontendOrigin: corsOrigins[0],
  corsOrigins,
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'local_dev_access_secret_change_me_32chars_min'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'local_dev_refresh_secret_change_me_32chars_m'),
  accessTtlSec: 60 * 15,
  refreshTtlDays: 14,
  cookieName: 'refreshToken',
  isProd: process.env.NODE_ENV === 'production',
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};
