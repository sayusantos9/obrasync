import { Router } from 'express';
import { labelController } from '../controllers/labelController.js';

export const labelRoutes = Router();

labelRoutes.post('/', labelController.create);
labelRoutes.get('/', labelController.list);
labelRoutes.get('/:id', labelController.getById);
labelRoutes.get('/:id/qrcode.png', labelController.getPng);
