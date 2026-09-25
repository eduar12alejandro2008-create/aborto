import Debate from '../models/Debate.js';
import * as geminiService from './ai/geminiService.js';
import * as webhookService from './webhookService.js';

export async function iniciarDebate(tema, maxRondas) {
  if (geminiService.miRol() !== 'preguntona') {
    throw new Error('Esta PC está configurada como "respondona". Inicia el debate desde la PC "preguntona".');
  }

  const debate = new Debate({ tema, maxRondas });
  await debate.save();

  const debateId = debate._id.toString();

  geminiService.iniciarSesion(debateId, tema);
  await webhookService.iniciarSesionEnPeer(debateId, tema);

  const pregunta = await geminiService.generarIntervencion(debateId, `Inicia el debate sobre: ${tema}`);
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

export async function obtenerDebateActivo() {
  let debate = await Debate.findOne({ estado: 'en_curso' }).sort({ createdAt: -1 });
  if (!debate) {
    debate = await Debate.findOne().sort({ createdAt: -1 });
  }
  return debate;
}

export async function detenerDebate(id) {
  const debate = await Debate.findById(id);
  if (!debate) return null;

  if (debate.estado === 'en_curso') {
    debate.estado = 'finalizado';
    await debate.save();
    geminiService.cerrarSesion(id);
    webhookService.notificarDetenerAPeer(id);
  }

  return debate;
}
