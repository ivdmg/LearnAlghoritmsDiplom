import type { FastifyInstance } from 'fastify';
import type { Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { validateUsername, validateEmail, normalizeEmail } from '../lib/validate.js';
import { requireAuth, type AuthedRequest } from '../auth/guard.js';

const SALT_ROUNDS = 10;

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const dayKeys = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dayKeys[0] !== today && dayKeys[0] !== yesterday) return 0;
  let streak = 0;
  let expected = dayKeys[0] === today ? today : yesterday;
  const set = new Set(dayKeys);
  for (;;) {
    if (!set.has(expected)) break;
    streak += 1;
    const prev = new Date(expected + 'T12:00:00Z');
    prev.setUTCDate(prev.getUTCDate() - 1);
    expected = prev.toISOString().slice(0, 10);
  }
  return streak;
}

/** Вычисляет максимальную серию дней за всё время */
function computeLongestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const dayKeys = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < dayKeys.length; i++) {
    const prev = new Date(dayKeys[i - 1] + 'T12:00:00Z');
    const curr = new Date(dayKeys[i] + 'T12:00:00Z');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
}

export async function registerMeRoutes(app: FastifyInstance) {
  // ===== GET /me =====
  app.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, displayName: true, createdAt: true },
    });
    if (!user) return reply.status(404).send({ error: 'Не найдено' });
    return reply.send({ user });
  });

  // ===== PUT /me/profile =====
  app.put<{ Body: { displayName?: string; username?: string; email?: string; currentPassword?: string } }>(
    '/me/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const req = request as AuthedRequest;
      const { displayName, username, email, currentPassword } = request.body ?? {};

      const isSensitive = username !== undefined || email !== undefined;
      // displayName можно менять без пароля
      if (isSensitive && typeof currentPassword !== 'string') {
        return reply.status(422).send({ error: 'Введите текущий пароль для подтверждения' });
      }

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return reply.status(404).send({ error: 'Пользователь не найден' });

      if (isSensitive) {
        const ok = await bcrypt.compare(currentPassword!, user.passwordHash);
        if (!ok) return reply.status(401).send({ error: 'Неверный текущий пароль' });
      }

      const updateData: { displayName?: string | null; username?: string; email?: string } = {};

      if (displayName !== undefined) {
        updateData.displayName = displayName.trim() === '' ? null : displayName.trim().slice(0, 50);
      }

      if (username !== undefined) {
        const trimmed = username.trim().toLowerCase();
        const err = validateUsername(trimmed);
        if (err) return reply.status(422).send({ error: err });
        updateData.username = trimmed;
      }

      if (email !== undefined) {
        const eErr = validateEmail(email);
        if (eErr) return reply.status(422).send({ error: eErr });
        updateData.email = normalizeEmail(email);
      }

      if (Object.keys(updateData).length === 0) {
        return reply.send({ user: { id: user.id, email: user.email, username: user.username, displayName: user.displayName, createdAt: user.createdAt } });
      }

      try {
        const updated = await prisma.user.update({
          where: { id: req.userId },
          data: updateData,
          select: { id: true, email: true, username: true, displayName: true, createdAt: true },
        });
        return reply.send({ user: updated });
      } catch (e) {
        if (typeof e === 'object' && e !== null && 'code' in e) {
          const code = (e as { code: string }).code;
          if (code === 'P2002') {
            const meta = (e as { meta?: { target?: string[] } }).meta;
            if (meta?.target?.includes('username'))
              return reply.status(409).send({ error: 'Это имя пользователя уже занято' });
            if (meta?.target?.includes('email'))
              return reply.status(409).send({ error: 'Этот email уже зарегистрирован' });
          }
        }
        app.log.error(e);
        return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
      }
    },
  );

  // ===== DELETE /me/account =====
  app.delete('/me/account', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;
    const { currentPassword } = (request.body ?? {}) as { currentPassword?: string };

    if (typeof currentPassword !== 'string') {
      return reply.status(422).send({ error: 'Введите текущий пароль для подтверждения' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return reply.status(404).send({ error: 'Пользователь не найден' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return reply.status(401).send({ error: 'Неверный текущий пароль' });

    // Cascade удалит прогресс и сессии
    await prisma.user.delete({ where: { id: user.id } });
    reply.clearCookie('refreshToken', { path: '/' });

    return reply.send({ ok: true });
  });

  // ===== GET /me/stats =====
  app.get('/me/stats', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;

    const rows = await prisma.userTaskProgress.findMany({
      where: { userId: req.userId },
      orderBy: { solvedAt: 'desc' },
    });

    const byDifficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const byTopic: Record<string, number> = {};
    let totalAttempts = 0;
    let firstAttemptCount = 0;

    for (const r of rows) {
      const d = r.difficulty.toLowerCase();
      if (DIFFICULTIES.includes(d as (typeof DIFFICULTIES)[number])) {
        byDifficulty[d] = (byDifficulty[d] ?? 0) + 1;
      }
      totalAttempts += r.attemptsCount;
      if (r.attemptsCount <= 1) firstAttemptCount++;
      if (r.topicId) {
        byTopic[r.topicId] = (byTopic[r.topicId] ?? 0) + 1;
      }
    }

    const lastSolved = rows.slice(0, 12).map((r) => ({
      taskId: r.taskId,
      difficulty: r.difficulty,
      solvedAt: r.solvedAt.toISOString(),
      attemptsCount: r.attemptsCount,
    }));

    const dates = rows.map((r) => r.solvedAt);
    const streakDays = computeStreak(dates);
    const longestStreak = computeLongestStreak(dates);
    const firstSolvedAt =
      rows.length > 0 ? rows.reduce((a, b) => (a.solvedAt < b.solvedAt ? a : b)).solvedAt : null;

    // Последние 7 и 30 дней
    const now = Date.now();
    const solvedLast7 = rows.filter((r) => now - r.solvedAt.getTime() < 7 * 86400000).length;
    const solvedLast30 = rows.filter((r) => now - r.solvedAt.getTime() < 30 * 86400000).length;

    // Последние 12 месяцев — активность
    const calendarData: { date: string; count: number }[] = [];
    const endDate = new Date(now);
    const startDate = new Date(now - 365 * 86400000);
    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const count = rows.filter((r) => r.solvedAt.toISOString().slice(0, 10) === key).length;
      calendarData.push({ date: key, count });
    }

    return reply.send({
      solvedTotal: rows.length,
      solvedTaskIds: rows.map((r) => r.taskId),
      byDifficulty,
      byTopic,
      lastSolved,
      streakDays,
      longestStreak,
      firstSolvedAt: firstSolvedAt?.toISOString() ?? null,
      totalAttempts,
      firstAttemptRate: rows.length > 0 ? Math.round((firstAttemptCount / rows.length) * 100) : 0,
      solvedLast7,
      solvedLast30,
      calendarData,
    });
  });

  // ===== POST /me/progress/solved =====
  app.post<{
    Body: { taskId?: string; difficulty?: string; topicId?: string };
  }>(
    '/me/progress/solved',
    { preHandler: requireAuth },
    async (request, reply) => {
      const req = request as AuthedRequest;
      const { taskId, difficulty, topicId } = request.body ?? {};

      if (typeof taskId !== 'string' || taskId.length === 0 || taskId.length > 128) {
        return reply.status(422).send({ error: 'Некорректный taskId' });
      }
      const diff = difficulty?.toLowerCase();
      if (!diff || !DIFFICULTIES.includes(diff as (typeof DIFFICULTIES)[number])) {
        return reply.status(422).send({ error: 'Некорректная сложность' });
      }

      const now = new Date();
      const typedDiff = diff as Difficulty;
      await prisma.userTaskProgress.upsert({
        where: { userId_taskId: { userId: req.userId, taskId } },
        create: {
          userId: req.userId,
          taskId,
          topicId: topicId ?? null,
          difficulty: typedDiff,
          solvedAt: now,
          updatedAt: now,
          attemptsCount: 1,
          lastRunAt: now,
        },
        update: {
          difficulty: typedDiff,
          topicId: topicId ?? undefined,
          solvedAt: now,
          updatedAt: now,
          lastRunAt: now,
          attemptsCount: { increment: 1 },
        },
      });

      return reply.send({ ok: true });
    },
  );
}
