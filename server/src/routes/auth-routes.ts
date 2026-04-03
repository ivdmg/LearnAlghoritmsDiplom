import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { hashToken, signAccess, signRefreshOpaque } from '../lib/tokens.js';
import { normalizeEmail, validateEmail, validatePassword } from '../lib/validate.js';
import { requireAuth, type AuthedRequest } from '../auth/guard.js';

const SALT_ROUNDS = 10;

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post<{
    Body: { email?: string; password?: string; displayName?: string };
  }>('/auth/register', async (request, reply) => {
    const emailRaw = request.body?.email;
    const password = request.body?.password;
    const displayName = request.body?.displayName?.trim() || null;
    if (typeof emailRaw !== 'string' || typeof password !== 'string') {
      return reply.status(400).send({ error: 'Укажите email и пароль' });
    }
    const eErr = validateEmail(emailRaw);
    if (eErr) return reply.status(400).send({ error: eErr });
    const pErr = validatePassword(password);
    if (pErr) return reply.status(400).send({ error: pErr });

    const email = normalizeEmail(emailRaw);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.status(409).send({ error: 'Пользователь с таким email уже есть' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const accessToken = signAccess({ sub: user.id, email: user.email });
    const rawRefresh = signRefreshOpaque();
    const tokenHash = hashToken(rawRefresh);
    const expiresAt = new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
    await prisma.refreshSession.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    reply.setCookie(config.cookieName, rawRefresh, {
      path: '/',
      httpOnly: true,
      secure: config.isProd,
      sameSite: 'lax',
      maxAge: config.refreshTtlDays * 24 * 60 * 60,
    });

    return reply.send({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  });

  app.post<{
    Body: { email?: string; password?: string };
  }>('/auth/login', async (request, reply) => {
    const emailRaw = request.body?.email;
    const password = request.body?.password;
    if (typeof emailRaw !== 'string' || typeof password !== 'string') {
      return reply.status(400).send({ error: 'Укажите email и пароль' });
    }
    const email = normalizeEmail(emailRaw);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Неверный email или пароль' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.status(401).send({ error: 'Неверный email или пароль' });

    const accessToken = signAccess({ sub: user.id, email: user.email });
    const rawRefresh = signRefreshOpaque();
    const tokenHash = hashToken(rawRefresh);
    const expiresAt = new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
    await prisma.refreshSession.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    reply.setCookie(config.cookieName, rawRefresh, {
      path: '/',
      httpOnly: true,
      secure: config.isProd,
      sameSite: 'lax',
      maxAge: config.refreshTtlDays * 24 * 60 * 60,
    });

    return reply.send({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const raw = request.cookies[config.cookieName];
    if (!raw) {
      return reply.status(401).send({ error: 'Нет сессии' });
    }
    const tokenHash = hashToken(raw);
    const session = await prisma.refreshSession.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) {
      reply.clearCookie(config.cookieName, { path: '/' });
      return reply.status(401).send({ error: 'Сессия истекла' });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      reply.clearCookie(config.cookieName, { path: '/' });
      return reply.status(401).send({ error: 'Пользователь не найден' });
    }
    const accessToken = signAccess({ sub: user.id, email: user.email });
    return reply.send({
      accessToken,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  });

  app.post('/auth/logout', async (request, reply) => {
    const raw = request.cookies[config.cookieName];
    if (raw) {
      const tokenHash = hashToken(raw);
      await prisma.refreshSession.deleteMany({ where: { tokenHash } });
    }
    reply.clearCookie(config.cookieName, { path: '/' });
    return reply.send({ ok: true });
  });

  app.post<{
    Body: { currentPassword?: string; newPassword?: string };
  }>(
    '/auth/password',
    { preHandler: requireAuth },
    async (request, reply) => {
      const req = request as AuthedRequest;
      const current = request.body?.currentPassword;
      const next = request.body?.newPassword;
      if (typeof current !== 'string' || typeof next !== 'string') {
        return reply.status(400).send({ error: 'Укажите текущий и новый пароль' });
      }
      const pErr = validatePassword(next);
      if (pErr) return reply.status(400).send({ error: pErr });

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return reply.status(404).send({ error: 'Пользователь не найден' });
      const ok = await bcrypt.compare(current, user.passwordHash);
      if (!ok) return reply.status(400).send({ error: 'Неверный текущий пароль' });

      const passwordHash = await bcrypt.hash(next, SALT_ROUNDS);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      await prisma.refreshSession.deleteMany({ where: { userId: user.id } });
      reply.clearCookie(config.cookieName, { path: '/' });
      return reply.send({ ok: true, message: 'Пароль обновлён. Войдите снова.' });
    },
  );
}
