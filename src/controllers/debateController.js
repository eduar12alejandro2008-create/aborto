import * as debateService from '../services/debateService.js';
export async function iniciarDebate(req, res) {
  try {
    const { tema, maxRondas = 3 } = req.body;

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