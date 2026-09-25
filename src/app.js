import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import env from './config/env.js';
import debateRoutes from './routes/debateRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API de debate funcionando', rol: env.ROL });
});

app.use(express.static('public'));

app.use('/api/debate', debateRoutes);
app.use('/webhook', webhookRoutes);

// El error handler siempre va al final, después de todas las rutas
app.use(errorHandler);

export default app;