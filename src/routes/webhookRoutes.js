import { Router } from 'express';
import * as webhookController from '../controllers/webhookController.js';
import validateWebhook from '../middlewares/validateWebhook.js';

const router = Router();

router.post('/turno', validateWebhook, webhookController.recibirTurno);

export default router;