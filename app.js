if (process.env.NODE_ENV !== 'test') require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();

// CORS: izinkan localhost + ngrok (dan optional ALLOWED_ORIGINS dari .env)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true); // same-origin / Postman
  if (allowedOrigins.includes(origin)) return callback(null, true);
  if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) return callback(null, true);
  if (/\.ngrok\.(io|free\.app)/i.test(origin) || origin.includes('ngrok')) return callback(null, true);
  callback(null, true); // fallback: izinkan semua (untuk dev/ngrok)
}
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/contact', contactRoutes);

module.exports = app;
