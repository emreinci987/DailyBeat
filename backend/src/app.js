import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import environment from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import moodRoutes from './routes/mood.js';
import musicRoutes from './routes/music.js';
import recommendationRoutes from './routes/recommendations.js';
import userRoutes from './routes/users.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();

// ── Global middleware ──
app.use(helmet());
app.use(compression());
app.use(cors({ origin: environment.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (environment.nodeEnv !== 'test') {
    app.use(morgan('short'));
}

// Rate limiter
const limiter = rateLimit({
    windowMs: environment.rateLimit.windowMs,
    max: environment.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyiniz' },
});
app.use('/api/', limiter);

// ── API routes ──
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'DailyBeat API is running', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

// Global error handler
app.use(errorHandler);

export default app;
