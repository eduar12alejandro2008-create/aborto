import * as webhookService from '../services/webhookService.js';
import * as geminiService from '../services/ai/geminiService.js';

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

// La PC vecina llama esto para que ESTA pc cree la sesión de su propio rol
export async function iniciarSesionRemota(req, res) {
  const { debateId, tema } = req.body;

  if (!debateId || !tema) {
    return res.status(400).json({ error: 'Faltan debateId o tema' });
  }

  try {
    geminiService.iniciarSesion(debateId, tema);
    res.status(200).json({ mensaje: `Sesión creada para el rol "${geminiService.miRol()}"` });
  } catch (error) {
    console.error('Error iniciando sesión remota:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// La PC vecina llama esto para que ESTA pc cierre su sesión de ese debate
export async function detenerRemoto(req, res) {
  const { debateId } = req.body;

  if (!debateId) {
    return res.status(400).json({ error: 'Falta debateId' });
  }

  geminiService.cerrarSesion(debateId);
  res.status(200).json({ mensaje: 'Sesión cerrada' });
}
