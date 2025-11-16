import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import subscriptionRoutes from './routes/subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/configs', configRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Worker endpoint (for manual triggers or cron)
app.post('/api/worker/run', async (_req, res) => {
  try {
    // Import and run worker
    const { runWorker } = await import('../src/worker.js');
    // Run in background
    runWorker().catch(console.error);
    res.json({ message: 'Worker started', timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Worker error:', error);
    res.status(500).json({ error: 'Failed to start worker' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (web UI)
const webPath = path.join(__dirname, '../web/dist');
console.log('Web path:', webPath);

// Check if web dist exists
import { existsSync } from 'fs';
if (existsSync(webPath)) {
  app.use(express.static(webPath));
  
  // Catch-all handler: send back React app for any non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webPath, 'index.html'));
  });
} else {
  // Fallback if web dist doesn't exist yet
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Sprint Sync Dashboard API',
      status: 'running',
      web: 'Web UI not built yet. Run: npm run build:web',
      api: '/api/health'
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Web UI: http://localhost:${PORT}`);
  }
});

export default app;

