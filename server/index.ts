import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import subscriptionRoutes from './routes/subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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
// __dirname is dist/server, so we need to go up two levels to reach web/dist
const webPath = path.join(__dirname, '../../web/dist');
console.log('Web path:', webPath);
console.log('Web path exists:', existsSync(webPath));

// Check if web dist exists and serve static files
if (existsSync(webPath)) {
  console.log('✅ Serving web UI from:', webPath);
  app.use(express.static(webPath));
  
  // Catch-all handler: send back React app for any non-API routes
  // This must be LAST, after all API routes
  app.get('*', (_req, res) => {
    const indexPath = path.join(webPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Web UI not found' });
    }
  });
} else {
  console.warn('⚠️  Web UI not found at:', webPath);
  console.warn('⚠️  Serving API-only mode');
  
  // Fallback: API-only mode
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Sprint Sync Dashboard API',
      status: 'running',
      web: 'Web UI not built. Check build logs.',
      api: '/api/health',
      webPath: webPath,
      webPathExists: false
    });
  });
}

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Web UI: http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
}).on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

export default app;

