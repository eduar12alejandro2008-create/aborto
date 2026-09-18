import * as webhookService from '../services/webhookService.js';
export async function recibirTurno(req, res) {
  const { debateId, siguienteTurno } = req.body;

  if (!debateId || !siguienteTurno) {
    return res.status(400).json({ error: 'Faltan debateId o siguienteTurno' });
  }
  
  res.status(202).json({ mensaje: `Turno recibido, procesando: ${siguienteTurno}` });
  
  try {
    await webhookService.procesarTurno(debateId, siguienteTurno);
  } catch (error) {
    console.error('Error procesando turno:', error.message);
  }
}