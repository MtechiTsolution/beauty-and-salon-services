import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { getPool } from './db.js';
import { authRouter } from './routes/auth.js';
import { branchesRouter } from './routes/branches.js';
import { servicesRouter } from './routes/services.js';
import { employeesRouter } from './routes/employees.js';
import { bookingsRouter } from './routes/bookings.js';
import { categoriesRouter, couponsRouter, notificationsRouter, customersRouter } from './routes/generic.js';
import { reviewsRouter } from './routes/reviews.js';
import { packagesRouter } from './routes/packages.js';
import { payoutsRouter } from './routes/payouts.js';
import { reportsRouter } from './routes/reports.js';
import { errorHandler } from './middleware/errorHandler.js';
import { catalogChangeNotifyMiddleware } from './middleware/catalogChangeNotify.js';
import { syncRouter } from './routes/sync.js';

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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`MIT Salon API running at http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
