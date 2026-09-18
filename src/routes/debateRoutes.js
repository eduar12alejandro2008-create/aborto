import { Router } from 'express';
import * as debateController from '../controllers/debateController.js';

const router = Router();

router.post('/iniciar', debateController.iniciarDebate);
router.get('/:id', debateController.obtenerDebate);

export default router;