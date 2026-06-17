const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const swaggerUi  = require('swagger-ui-express');
const YAML       = require('yamljs');
const path       = require('path');
require('dotenv').config();

const app = express();

// ── Security & parsing middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use(limiter);

// ── Swagger UI ────────────────────────────────────────────────────────────
const swaggerDoc = YAML.load(path.join(__dirname, 'swagger/swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',    require('./routes/authRoutes'));
app.use('/api/v1/workers', require('./routes/workerRoutes'));
app.use('/api/v1',         require('./routes/wasteRoutes'));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});

module.exports = app;
