//EXAMPLE .env Configuration
//PORT=5000
//MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
//CORS_ORIGINS=http://localhost:3000,https://your-production-site.com
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import paletteRoutes from './routes/palettes.js';
import projectRoutes from './routes/projects.js';
import connectDB, { disconnectDB } from './utils/database.js';

// Rate Limiting
require('dotenv').config();

const app = express();

// ===== MongoDB Connection =====
connectDB();

// ===== Middleware =====
// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
app.use(cors({ origin: allowedOrigins }));

// Logging HTTP Requests
app.use(morgan('combined'));

// JSON Parsing Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for large payloads
app.use(express.urlencoded({ extended: true }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// ===== Routes =====
app.use('/projects', projectRoutes);
app.use('/palettes', paletteRoutes);

// ===== Health Check Endpoint =====
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error(`❌ Server Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

// ===== Graceful Shutdown =====
const gracefulShutdown = async signal => {
  console.log(`🚦 ${signal} received. Closing server...`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

export default server;
