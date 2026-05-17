import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';





import { connectDB } from './config/database';

import userRoutes from './routes/user.routes';


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));






// Routes

app.use('/api/users', userRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: 'ryzha', timestamp: new Date() });
});



// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});



// Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🧭 ryzha server running on port ${PORT}`);
    
    
  });
};

startServer();

export default app;
