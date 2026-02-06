import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';

import { initializeDatabase } from './utils/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { collaborationService } from './services/collaborationService.js';
import authRoutes from './routes/auth.js';
import spreadsheetsRoutes from './routes/spreadsheets.js';
import cellsRoutes from './routes/cells.js';
import importExportRoutes from './routes/importExport.js';
import templatesRoutes from './routes/templates.js';
import bordersRoutes from './routes/borders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Configure allowed origins - PRODUCTION READY
const defaultOrigins = [
  'http://localhost:3001',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3000',
  'http://localhost:5173',
];

// Add production origins from environment
const envOrigin = process.env.FRONTEND_URL;
const additionalOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const allowedOrigins = Array.from(new Set([
  ...defaultOrigins, 
  ...(envOrigin ? [envOrigin] : []),
  ...additionalOrigins
]));

// Production: Enable wildcard for Vercel/Netlify preview deployments
const isProduction = process.env.NODE_ENV === 'production';
const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // In production with CORS_ALLOW_ALL, check for trusted domains
    if (allowAllOrigins || isProduction) {
      // Allow Vercel/Netlify preview URLs
      const trustedDomains = [
        'vercel.app',
        'netlify.app',
        'herokuapp.com',
        'railway.app',
        'render.com',
        'onrender.com'
      ];
      
      const isTrusted = trustedDomains.some(domain => origin.includes(domain));
      if (isTrusted || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Check exact match for configured origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      console.warn('💡 Add to ALLOWED_ORIGINS env or use CORS_ALLOW_ALL=true');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/spreadsheets', spreadsheetsRoutes);
app.use('/api/cells', cellsRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/sheets', bordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true,
    status: 'ok', 
    pid: process.pid,
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    pid: process.pid, 
    uptime: process.uptime() 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const httpServer = createServer(app);

// Initialize WebSocket collaboration service
collaborationService.initialize(httpServer);

// Cleanup old documents every hour
setInterval(() => {
  collaborationService.cleanup();
}, 60 * 60 * 1000);

try {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EtherX Excel Backend running on http://localhost:${PORT}`);
    console.log(`📡 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
    console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
    console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/ws/collaboration`);
  });
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use`);
    console.error('Please try a different port or stop the process using this port.');
  } else if (error.code === 'EACCES') {
    console.error(`❌ Error: Permission denied to bind to port ${PORT}`);
    console.error('Please use a port number above 1024 or run with appropriate permissions.');
  } else {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
  }
  process.exit(1);
}

export default app;
