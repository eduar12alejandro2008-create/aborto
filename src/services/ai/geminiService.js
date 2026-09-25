import genAI from '../../config/gemini.config.js';
import env from '../../config/env.js';

const MODELO = 'gemini-3.5-flash-lite';
const MAX_TOKENS_RESPUESTA = 200;
const INSTRUCCION_BREVEDAD =
  'Responde en máximo 2 frases cortas, directo al punto, sin rodeos ni introducciones.';

const MI_ROL = env.ROL; // 'preguntona' o 'respondona': el rol que corre esta PC

// Guarda las sesiones de chat activas por debate, SOLO del rol de esta PC: { debateId: chat }
const sesiones = new Map();

function crearModelo(systemPrompt) {
  return genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: `${systemPrompt} ${INSTRUCCION_BREVEDAD}`,
  });
}

function promptParaRol(rol, tema) {
  if (rol === 'preguntona') {
    return `Eres el IA-Preguntón en un debate sobre "${tema}". Tu trabajo es hacer preguntas incisivas y cortas que reten al otro participante, basándote en lo dicho hasta ahora.`;
  }
  return `Eres el IA-Respondón en un debate sobre "${tema}". Responde de forma clara, precisa y breve a la última pregunta o argumento.`;
}

// Devuelve el rol que corre esta PC ('preguntona' o 'respondona')
export function miRol() {
  return MI_ROL;
}

// Crea la sesión de chat del rol de ESTA pc para un debate nuevo
export function iniciarSesion(debateId, tema) {
  const prompt = promptParaRol(MI_ROL, tema);
  const chat = crearModelo(prompt).startChat({
    generationConfig: { maxOutputTokens: MAX_TOKENS_RESPUESTA, temperature: 0.7 },
  });
  sesiones.set(debateId, chat);
}

// Libera la sesión cuando el debate termina
export function cerrarSesion(debateId) {
  sesiones.delete(debateId);
}

function extraerRetryDelayMs(mensaje) {
  const match = mensaje.match(/"retryDelay":"(\d+(?:\.\d+)?)s"/);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 2000; // +2s de margen
  return 60000; // si no viene el dato, espera 1 minuto por defecto
}

async function enviarMensaje(chat, texto, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const result = await chat.sendMessage(texto);
      return result.response.text().trim() || '(sin respuesta)';
    } catch (error) {
      const mensaje = error.message || '';
      const esSobrecarga = mensaje.includes('503') || mensaje.includes('overloaded');
      const esLimiteCuota = mensaje.includes('429') || mensaje.includes('Too Many Requests') || mensaje.includes('RESOURCE_EXHAUSTED');

      if ((esSobrecarga || esLimiteCuota) && i < intentos - 1) {
        const espera = esLimiteCuota ? extraerRetryDelayMs(mensaje) : 2000 * (i + 1);
        console.warn(`⚠️ Gemini ${esLimiteCuota ? 'alcanzó el límite de cuota' : 'saturado'}, reintentando en ${Math.round(espera / 1000)}s (${i + 1}/${intentos})...`);
        await new Promise((r) => setTimeout(r, espera));
        continue;
      }
      throw error;
    }
  }
}

// Genera la siguiente intervención del rol de ESTA pc para el debate dado
export async function generarIntervencion(debateId, mensajeEntrante) {
  const chat = sesiones.get(debateId);
  if (!chat) throw new Error(`No hay sesión activa para el debate ${debateId} en el rol "${MI_ROL}"`);
  return enviarMensaje(chat, mensajeEntrante);
}
