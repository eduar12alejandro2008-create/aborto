import env from '../config/env.js';
import Debate from '../models/Debate.js';
import * as geminiService from './ai/geminiService.js';

const MI_ROL = env.ROL;
const URL_LOCAL = `http://localhost:${env.PORT}`;
const URL_PEER = env.PEER_URL;
const RETRASO_ENTRE_TURNOS_MS = 5000; // pausa antes de disparar el siguiente turno, para no exceder cuota de Gemini (15 req/min en free tier)

function urlParaRol(rol) {
  return rol === MI_ROL ? URL_LOCAL : URL_PEER;
}

export function dispararWebhook(debateId, siguienteTurno) {
  const base = urlParaRol(siguienteTurno);
  fetch(`${base}/webhook/turno`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debateId, siguienteTurno }),
  }).catch((err) => console.error(`Error disparando webhook a ${base}:`, err.message));
}

// Le pide a la PC vecina que cree su propia sesión (del otro rol) para este debate
export async function iniciarSesionEnPeer(debateId, tema) {
  if (!URL_PEER) throw new Error('Falta configurar PEER_URL en el .env de esta PC');

  const res = await fetch(`${URL_PEER}/webhook/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debateId, tema }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `No se pudo iniciar sesión en la PC vecina (${URL_PEER})`);
  }
}

// Avisa a la PC vecina que cierre su sesión de este debate (al detenerlo manualmente)
export function notificarDetenerAPeer(debateId) {
  if (!URL_PEER) return;
  fetch(`${URL_PEER}/webhook/detener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debateId }),
  }).catch((err) => console.error('Error notificando detener a la PC vecina:', err.message));
}

export async function procesarTurno(debateId, siguienteTurno) {
  if (siguienteTurno !== MI_ROL) {
    console.error(`Esta PC corre el rol "${MI_ROL}" pero recibió un turno de "${siguienteTurno}". Revisa PEER_URL en ambas PCs.`);
    return;
  }

  const debate = await Debate.findById(debateId);
  if (!debate) return console.error(`Debate ${debateId} no encontrado`);
  if (debate.estado === 'finalizado') return console.log(`Debate ${debateId} ya finalizado`);

  const ultimoMensaje = debate.mensajes[debate.mensajes.length - 1].texto;

  let texto;
  try {
    texto = await geminiService.generarIntervencion(debateId, ultimoMensaje);
  } catch (error) {
    console.error(`❌ Gemini falló definitivamente en el debate ${debateId} (rol ${MI_ROL}): ${error.message}`);
    debate.estado = 'finalizado';
    await debate.save();
    geminiService.cerrarSesion(debateId);
    notificarDetenerAPeer(debateId);
    return;
  }

  debate.mensajes.push({ autor: MI_ROL, texto });
  if (MI_ROL === 'respondona') debate.rondaActual += 1;
  await debate.save();

  const siguienteTurnoAhora = MI_ROL === 'preguntona' ? 'respondona' : 'preguntona';
  setTimeout(() => dispararWebhook(debateId, siguienteTurnoAhora), RETRASO_ENTRE_TURNOS_MS);
}
