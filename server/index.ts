import express from 'express';
import cors from 'cors';
import { loadEnv } from 'vite';
import { analyzeUrl, translateStream, getModels } from './routes/api.js';

// Load environment variables using Vite's loadEnv
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const app = express();
const PORT = env.PORT || 3001; // Use env.PORT from Vite's loadEnv

// Make env available globally for other modules
globalThis.process.env = { ...process.env, ...env }; // Keep process.env for backward compatibility in translator.ts
process.env = { ...process.env, ...env }; // Ensure process.env is merged with loaded env
process.env.PORT = env.PORT || '3001'; // Set PORT explicitly
process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || ''; // Set OPENROUTER_API_KEY explicitly

// Also set up import.meta.env style access (for client-side pattern)
const importMetaEnv = { ...env };
(globalThis as any).importMetaEnv = importMetaEnv; // Provide as global importMetaEnv for consistency

// Log environment info in development
if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Environment loaded via Vite loadEnv');
    console.log('[Server] PORT:', PORT);
    console.log('[Server] OPENROUTER_API_KEY:', env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/api/models', getModels);
app.post('/api/analyze-url', analyzeUrl);
app.post('/api/translate-stream', translateStream);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 API Endpoints:`);
    console.log(`   POST /api/analyze-url - Analyze and extract content from URL`);
    console.log(`   POST /api/translate-stream - Translate text with streaming`);
});

export default app;
