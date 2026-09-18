import genAI from '../../config/gemini.config.js';

const MODELO = 'gemini-flash-lite-latest';
const MAX_TOKENS_RESPUESTA = 200;
const INSTRUCCION_BREVEDAD =
  'Responde en máximo 2 frases cortas, directo al punto, sin rodeos ni introducciones.';

// Guarda las sesiones de chat activas por debate: { debateId: { preguntona, respondona } }
const sesiones = new Map();

function crearModelo(systemPrompt) {
  return genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: `${systemPrompt} ${INSTRUCCION_BREVEDAD}`,
  });
}

// Crea las dos sesiones de chat para un debate nuevo
export function iniciarSesiones(debateId, tema) {
  const promptPreguntona = `Eres el IA-Preguntón en un debate sobre "${tema}". Tu trabajo es hacer preguntas incisivas y cortas que reten al otro participante, basándote en lo dicho hasta ahora.`;
  const promptRespondona = `Eres el IA-Respondón en un debate sobre "${tema}". Responde de forma clara, precisa y breve a la última pregunta o argumento.`;

  const chatPreguntona = crearModelo(promptPreguntona).startChat({
    generationConfig: { maxOutputTokens: MAX_TOKENS_RESPUESTA, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
  });

  const chatRespondona = crearModelo(promptRespondona).startChat({
    generationConfig: { maxOutputTokens: MAX_TOKENS_RESPUESTA, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
  });

  sesiones.set(debateId, { preguntona: chatPreguntona, respondona: chatRespondona });
}

// Libera las sesiones cuando el debate termina
export function cerrarSesiones(debateId) {
  sesiones.delete(debateId);
}

async function enviarMensaje(chat, texto, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const result = await chat.sendMessage(texto);
      return result.response.text().trim() || '(sin respuesta)';
    } catch (error) {
      const esSobrecarga = error.message?.includes('503') || error.message?.includes('overloaded');
      if (esSobrecarga && i < intentos - 1) {
        console.warn(`⚠️ Gemini saturado, reintentando (${i + 1}/${intentos})...`);
        await new Promise((r) => setTimeout(r, 2000 * (i + 1))); // espera 2s, 4s, 6s...
        continue;
      }
      throw error;
    }
  }
}

// Le pide a la IA-Preguntón que genere la siguiente pregunta
export async function preguntarIA(debateId, mensajeEntrante) {
  const sesion = sesiones.get(debateId);
  if (!sesion) throw new Error(`No hay sesiones activas para el debate ${debateId}`);
  return enviarMensaje(sesion.preguntona, mensajeEntrante);
}

// Le pide a la IA-Respondón que responda
export async function responderIA(debateId, mensajeEntrante) {
  const sesion = sesiones.get(debateId);
  if (!sesion) throw new Error(`No hay sesiones activas para el debate ${debateId}`);
  return enviarMensaje(sesion.respondona, mensajeEntrante);
}