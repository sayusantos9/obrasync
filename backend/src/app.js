import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { labelRoutes } from './routes/labelRoutes.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_request, response) => response.json({ status: 'ok', service: 'obrasync-api' }));
app.use('/api/labels', labelRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
