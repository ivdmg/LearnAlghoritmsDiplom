import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireAuth, type AuthedRequest } from '../auth/guard.js';

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

export async function registerMeRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    if (!user) return reply.status(404).send({ error: 'Не найдено' });
    return reply.send({ user });
  });

  app.get('/me/stats', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;
    const rows = await prisma.userTaskProgress.findMany({
      where: { userId: req.userId },
      orderBy: { solvedAt: 'desc' },
    });

    const byDifficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const r of rows) {
      const d = r.difficulty.toLowerCase();
      if (DIFFICULTIES.includes(d as (typeof DIFFICULTIES)[number])) {
        byDifficulty[d] = (byDifficulty[d] ?? 0) + 1;
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
    const firstSolvedAt =
      rows.length > 0 ? rows.reduce((a, b) => (a.solvedAt < b.solvedAt ? a : b)).solvedAt : null;

    return reply.send({
      solvedTotal: rows.length,
      byDifficulty,
      lastSolved,
      streakDays,
      firstSolvedAt: firstSolvedAt?.toISOString() ?? null,
    });
  });

  app.post<{
    Body: { taskId?: string; difficulty?: string };
  }>('/me/progress/solved', { preHandler: requireAuth }, async (request, reply) => {
    const req = request as AuthedRequest;
    const taskId = request.body?.taskId;
    const difficulty = request.body?.difficulty?.toLowerCase();
    if (typeof taskId !== 'string' || taskId.length === 0 || taskId.length > 128) {
      return reply.status(400).send({ error: 'Некорректный taskId' });
    }
    if (!difficulty || !DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
      return reply.status(400).send({ error: 'Некорректная сложность' });
    }

    const now = new Date();
    await prisma.userTaskProgress.upsert({
      where: { userId_taskId: { userId: req.userId, taskId } },
      create: {
        userId: req.userId,
        taskId,
        difficulty,
        solvedAt: now,
        attemptsCount: 1,
        lastRunAt: now,
      },
      update: {
        difficulty,
        solvedAt: now,
        lastRunAt: now,
        attemptsCount: { increment: 1 },
      },
    });

    return reply.send({ ok: true });
  });
}
