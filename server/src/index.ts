import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth-routes.js';
import { registerMeRoutes } from './routes/me-routes.js';

const app = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
  },
});

// CORS: поддержка нескольких origins (dev, preview, prod)
await app.register(cookie, { secret: config.jwtRefreshSecret });
await app.register(cors, {
  origin: config.corsOrigins,
  credentials: true,
});
await app.register(rateLimit, {
  max: 300,
  timeWindow: '1 minute',
});

// Логирование каждого запроса
app.addHook('onRequest', async (request, _reply) => {
  request.log.info({ method: request.method, url: request.url }, 'incoming request');
});

app.addHook('onResponse', async (request, reply) => {
  request.log.info({ statusCode: reply.statusCode }, 'request completed');
});

app.addHook('onError', async (request, _reply, error) => {
  request.log.error({ err: error, url: request.url }, 'request error');
});

await registerAuthRoutes(app);
await registerMeRoutes(app);

app.get('/health', async () => ({ ok: true }));

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info({
    msg: 'AlgoLearn API started',
    port: config.port,
    cors: config.corsOrigins.join(', '),
    env: config.isProd ? 'production' : 'development',
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
