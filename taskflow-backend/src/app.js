import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { connectDB } from './config/db.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Ensure DB is connected before any route runs
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'TaskFlow API is running!' });
});

// Error handler must be last
app.use(errorHandler);

export default app;