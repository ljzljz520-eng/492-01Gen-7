import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import { generateMockData } from './mockData.js';
import styleRoutes from './routes/styles.js';
import processRoutes from './routes/processes.js';
import workerRoutes from './routes/workers.js';
import recordRoutes from './routes/records.js';
import subsidyRoutes from './routes/subsidies.js';
import authRoutes from './routes/auth.js';

initDatabase();
generateMockData();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Garment API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/subsidies', subsidyRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});
