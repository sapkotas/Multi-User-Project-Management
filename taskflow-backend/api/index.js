import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Initialize DB connection explicitly in the serverless function if it hasn't connected
// Calling connectDB without awaiting is okay because mongoose buffers operations until it connects securely,
// but for better safety in serverless, you might want to handle it.
// The existing connectDB handles errors gracefully.
connectDB();

export default app;
