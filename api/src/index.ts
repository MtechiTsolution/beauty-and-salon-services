import cors from 'cors';
import express from 'express';
import http from 'node:http';
import dotenv from 'dotenv';
import { getPool } from './db.js';
import { authRouter } from './routes/auth.js';
import { branchesRouter } from './routes/branches.js';
import { servicesRouter } from './routes/services.js';
import { employeesRouter } from './routes/employees.js';
import { bookingsRouter } from './routes/bookings.js';
import { categoriesRouter, couponsRouter, customersRouter } from './routes/generic.js';
import { notificationsRouter } from './routes/notifications.js';
import { reviewsRouter } from './routes/reviews.js';
import { packagesRouter } from './routes/packages.js';
import { payoutsRouter } from './routes/payouts.js';
import { reportsRouter } from './routes/reports.js';
import { chatsRouter } from './routes/chats.js';
import { errorHandler } from './middleware/errorHandler.js';
import { catalogChangeNotifyMiddleware } from './middleware/catalogChangeNotify.js';
import { syncRouter } from './routes/sync.js';
import { initChatWebSocket } from './lib/chatWebSocket.js';
import { ensureSchema } from './lib/ensureSchema.js';
import { getUploadsRoot, uploadsRouter } from './routes/uploads.js';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT ?? 3001);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(catalogChangeNotifyMiddleware);

app.use('/api/sync', syncRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e instanceof Error ? e.message : 'DB error' });
  }
});

app.use('/api/uploads/files', express.static(getUploadsRoot()));
app.use('/api/uploads', uploadsRouter);
app.use('/api/auth', authRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/chats', chatsRouter);

app.use(errorHandler);

const host = process.env.API_HOST ?? '0.0.0.0';

const server = http.createServer(app);
initChatWebSocket(server);

void ensureSchema().catch((err) => {
  console.warn('Schema check:', err instanceof Error ? err.message : err);
});

server.listen(port, host, () => {
  console.log(`MIT Salon API running at http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Chat WebSocket: ws://localhost:${port}/api/chats/ws`);
  if (host === '0.0.0.0') {
    console.log(`LAN access: bind on all interfaces (port ${port})`);
  }
});
