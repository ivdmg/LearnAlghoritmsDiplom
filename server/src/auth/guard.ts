import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccess } from '../lib/tokens.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Требуется авторизация' });
  }
  const token = auth.slice(7);
  try {
    const payload = verifyAccess(token);
    (request as FastifyRequest & { userId: string; userEmail: string }).userId = payload.sub;
    (request as FastifyRequest & { userId: string; userEmail: string }).userEmail = payload.email;
  } catch {
    return reply.status(401).send({ error: 'Сессия истекла или недействительна' });
  }
}

export type AuthedRequest = FastifyRequest & { userId: string; userEmail: string };
