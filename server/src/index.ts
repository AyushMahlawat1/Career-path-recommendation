import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure middlewares
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  credentials: true,
}));
app.use(express.json());

// Bind API routing table
app.use('/api', router);

// Default test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Career Recommendation Platform API' });
});

// Bind global error handler middleware
app.use(errorMiddleware);

// Boot server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
