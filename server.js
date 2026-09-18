import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   POST /api/debate/iniciar   { "tema": "...", "maxRondas": 3 }`);
  console.log(`   GET  /api/debate/:id       para ver el historial`);
});