function validateWebhook(req, res, next) {
  const { debateId, siguienteTurno } = req.body;

  if (!debateId) {
    return res.status(400).json({ error: "Falta 'debateId' en el webhook" });
  }

  if (!siguienteTurno || !['preguntona', 'respondona'].includes(siguienteTurno)) {
    return res.status(400).json({
      error: "'siguienteTurno' debe ser 'preguntona' o 'respondona'",
    });
  }

  next();
}

export default validateWebhook;