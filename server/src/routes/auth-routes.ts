import type { FastifyInstance, FastifyReply } from 'fastify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { hashToken, signAccess, signRefreshOpaque } from '../lib/tokens.js';
import {
  normalizeEmail,
  validateEmail,
  validateUsername,
  validatePassword,
} from '../lib/validate.js';
import { requireAuth, type AuthedRequest } from '../auth/guard.js';

const SALT_ROUNDS = 10;

/** Отправка с проверкой на unique-violation, fallback на 500 */
function sendWithUniqueFallback(reply: FastifyReply, err: unknown) {
  const meta = (err as { meta?: { target?: string[] } })?.meta;
  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    if (meta?.target?.includes('username'))
      return reply.status(409).send({ error: 'Это имя пользователя уже занято' });
    if (meta?.target?.includes('email'))
      return reply.status(409).send({ error: 'Этот email уже зарегистрирован' });
  }
  return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
}

/** Выдать пару токенов и установить httpOnly cookie refresh-токена */
async function issueTokens(userId: string, email: string, reply: FastifyReply) {
  const accessToken = signAccess({ sub: userId, email });
  const rawRefresh = signRefreshOpaque();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
  await prisma.refreshSession.create({ data: { userId, tokenHash, expiresAt } });

  reply.setCookie(config.cookieName, rawRefresh, {
    path: '/',
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: config.refreshTtlDays * 24 * 60 * 60,
  });

  return accessToken;
}

/** Базовая форма ответа с токеном и данными юзера */
function authResponse(accessToken: string, user: { id: string; email: string; displayName: string | null; username: string }) {
  return { accessToken, user: { id: user.id, email: user.email, displayName: user.displayName, username: user.username } };
}

export async function registerAuthRoutes(app: FastifyInstance) {
  // ===== POST /auth/register =====
  app.post<{ Body: { email?: string; password?: string; username?: string; displayName?: string } }>(
    '/auth/register',
    async (request, reply) => {
      const { email: emailRaw, password, username, displayName } = request.body ?? {};

      // -- Типы --
      if (typeof emailRaw !== 'string' || typeof password !== 'string') {
        return reply.status(422).send({ error: 'Укажите email и пароль' });
      }

      // -- Валидация --
      const eErr = validateEmail(emailRaw);
      if (eErr) return reply.status(422).send({ error: eErr });

      const uErr = validateUsername(username ?? '');
      if (uErr) return reply.status(422).send({ error: uErr });

      const pErr = validatePassword(password);
      if (pErr) return reply.status(422).send({ error: pErr });

      const email = normalizeEmail(emailRaw);
      const dn = displayName?.trim() || null;

      // -- Создание --
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      try {
        const user = await prisma.user.create({
          data: { email, username: username!.trim().toLowerCase(), passwordHash, displayName: dn },
        });

        const accessToken = await issueTokens(user.id, user.email, reply);
        return reply.send(authResponse(accessToken, user));
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
          const meta = err.meta as { target?: string[] } | undefined;
          if (meta?.target?.includes('username'))
            return reply.status(409).send({ error: 'Это имя пользователя уже занято' });
          if (meta?.target?.includes('email'))
            return reply.status(409).send({ error: 'Этот email уже зарегистрирован' });
        }
        app.log.error(err);
        return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
      }
    },
  );

  // ===== POST /auth/login =====
  app.post<{ Body: { identifier?: string; password?: string } }>(
    '/auth/login',
    async (request, reply) => {
      const { identifier, password } = request.body ?? {};

      if (typeof identifier !== 'string' || typeof password !== 'string') {
        return reply.status(422).send({ error: 'Укажите логин/email и пароль' });
      }

      // Определяем тип: email или username
      const isEmail = identifier.includes('@');
      const user = await prisma.user.findUnique({
        where: isEmail ? { email: normalizeEmail(identifier) } : { username: identifier.toLowerCase() },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Неверный логин/email или пароль' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return reply.status(401).send({ error: 'Неверный логин/email или пароль' });
      }

      const accessToken = await issueTokens(user.id, user.email, reply);
      return reply.send(authResponse(accessToken, user));
    },
  );

  // ===== POST /auth/refresh =====
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
      user: { id: user.id, email: user.email, displayName: user.displayName, username: user.username },
    });
  });

  // ===== POST /auth/logout =====
  app.post('/auth/logout', async (request, reply) => {
    const raw = request.cookies[config.cookieName];
    if (raw) {
      const tokenHash = hashToken(raw);
      await prisma.refreshSession.deleteMany({ where: { tokenHash } });
    }
    reply.clearCookie(config.cookieName, { path: '/' });
    return reply.send({ ok: true });
  });

  // ===== POST /auth/password =====
  app.post<{ Body: { currentPassword?: string; newPassword?: string } }>(
    '/auth/password',
    { preHandler: requireAuth },
    async (request, reply) => {
      const req = request as AuthedRequest;
      const current = request.body?.currentPassword;
      const next = request.body?.newPassword;

      if (typeof current !== 'string' || typeof next !== 'string') {
        return reply.status(422).send({ error: 'Укажите текущий и новый пароль' });
      }

      const pErr = validatePassword(next);
      if (pErr) return reply.status(422).send({ error: pErr });

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return reply.status(404).send({ error: 'Пользователь не найден' });

      const ok = await bcrypt.compare(current, user.passwordHash);
      if (!ok) return reply.status(401).send({ error: 'Неверный текущий пароль' });

      const passwordHash = await bcrypt.hash(next, SALT_ROUNDS);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      await prisma.refreshSession.deleteMany({ where: { userId: user.id } });
      reply.clearCookie(config.cookieName, { path: '/' });
      return reply.send({ ok: true, message: 'Пароль обновлён. Войдите снова.' });
    },
  );
}
