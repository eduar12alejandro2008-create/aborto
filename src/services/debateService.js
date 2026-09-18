import Debate from '../models/Debate.js';
import * as geminiService from './ai/geminiService.js';
import * as webhookService from './webhookService.js';

export async function iniciarDebate(tema, maxRondas) {
  const debate = new Debate({ tema, maxRondas });
  await debate.save();

  const debateId = debate._id.toString();
  geminiService.iniciarSesiones(debateId, tema);

  const pregunta = await geminiService.preguntarIA(debateId, `Inicia el debate sobre: ${tema}`);
  debate.mensajes.push({ autor: 'preguntona', texto: pregunta });
  await debate.save();

  webhookService.dispararWebhook(debateId, 'respondona');

  return {
    mensaje: 'Debate iniciado',
    debateId: debate._id,
    primeraPregunta: pregunta,
  };
}

export async function obtenerDebatePorId(id) {
  return Debate.findById(id);
}