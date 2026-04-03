import 'dotenv/config';

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'local_dev_access_secret_change_me_32chars_min'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'local_dev_refresh_secret_change_me_32chars_m'),
  accessTtlSec: 60 * 15,
  refreshTtlDays: 14,
  cookieName: 'refreshToken',
  isProd: process.env.NODE_ENV === 'production',
};
