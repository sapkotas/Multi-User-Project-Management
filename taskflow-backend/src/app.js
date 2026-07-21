import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'TaskFlow API is running!' });
});

// Error handling middleware
app.use(errorHandler);

export default app;

