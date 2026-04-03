import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth-routes.js';
import { registerMeRoutes } from './routes/me-routes.js';

const app = Fastify({ logger: true });

await app.register(cookie, { secret: config.jwtRefreshSecret });
await app.register(cors, {
  origin: config.frontendOrigin,
  credentials: true,
});
await app.register(rateLimit, {
  max: 300,
  timeWindow: '1 minute',
});

await registerAuthRoutes(app);
await registerMeRoutes(app);

app.get('/health', async () => ({ ok: true }));

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(`API http://localhost:${config.port}  CORS ${config.frontendOrigin}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
