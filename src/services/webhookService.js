import env from '../config/env.js';
import Debate from '../models/Debate.js';
import * as geminiService from './ai/geminiService.js';

const WEBHOOK_URL = `http://localhost:${env.PORT}/webhook/turno`;

export function dispararWebhook(debateId, siguienteTurno) {
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debateId, siguienteTurno }),
  }).catch((err) => console.error('Error disparando webhook:', err.message));
}

export async function procesarTurno(debateId, siguienteTurno) {
  const debate = await Debate.findById(debateId);

  if (!debate) return console.error(`Debate ${debateId} no encontrado`);
  if (debate.estado === 'finalizado') return console.log(`Debate ${debateId} ya finalizado`);

  const ultimoMensaje = debate.mensajes[debate.mensajes.length - 1].texto;

  if (siguienteTurno === 'respondona') {
    const respuesta = await geminiService.responderIA(debateId, ultimoMensaje);
    debate.mensajes.push({ autor: 'respondona', texto: respuesta });
    debate.rondaActual += 1;

    if (debate.rondaActual >= debate.maxRondas) {
      debate.estado = 'finalizado';
      await debate.save();
      geminiService.cerrarSesiones(debateId);
      console.log(`✅ Debate ${debateId} finalizado`);
      return;
    }

    await debate.save();
    dispararWebhook(debateId, 'preguntona');
  }

  if (siguienteTurno === 'preguntona') {
    const pregunta = await geminiService.preguntarIA(debateId, ultimoMensaje);
    debate.mensajes.push({ autor: 'preguntona', texto: pregunta });
    await debate.save();

    dispararWebhook(debateId, 'respondona');
  }
}