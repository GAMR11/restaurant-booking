import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reservationRoutes from './routes/reservationRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'front-restaurant-booking-production.up.railway.app', // Agrega tu dominio de Railway
    /\.up\.railway\.app$/  // Permite cualquier subdominio de Railway
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', reservationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});