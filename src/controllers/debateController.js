import * as debateService from '../services/debateService.js';
export async function iniciarDebate(req, res) {
  try {
    const { tema, maxRondas = 5 } = req.body;

    if (!tema) {
      return res.status(400).json({ error: "Falta el campo 'tema'" });
    }

    const resultado = await debateService.iniciarDebate(tema, maxRondas);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error en iniciarDebate:', error.message);
    res.status(500).json({ error: error.message });
  }
}
export async function obtenerDebate(req, res) {
  try {
    const debate = await debateService.obtenerDebatePorId(req.params.id);

    if (!debate) {
      return res.status(404).json({ error: 'Debate no encontrado' });
    }

    res.json(debate);
  } catch (error) {
    console.error('Error en obtenerDebate:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerDebateActivo(req, res) {
  try {
    const debate = await debateService.obtenerDebateActivo();

    if (!debate) {
      return res.status(404).json({ error: 'Todavía no hay ningún debate' });
    }

    res.json(debate);
  } catch (error) {
    console.error('Error en obtenerDebateActivo:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function detenerDebate(req, res) {
  try {
    const debate = await debateService.detenerDebate(req.params.id);

    if (!debate) {
      return res.status(404).json({ error: 'Debate no encontrado' });
    }

    res.json({ mensaje: 'Debate detenido', debate });
  } catch (error) {
    console.error('Error en detenerDebate:', error.message);
    res.status(500).json({ error: error.message });
  }
}