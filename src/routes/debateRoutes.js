import { Router } from 'express';
import * as debateController from '../controllers/debateController.js';

const router = Router();

router.post('/iniciar', debateController.iniciarDebate);
router.get('/activo/actual', debateController.obtenerDebateActivo);
router.get('/:id', debateController.obtenerDebate);
router.patch('/:id/detener', debateController.detenerDebate);

export default router;