import 'dotenv/config';
import app from './src/app.js';
import env from './src/config/env.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Rol de esta PC: ${env.ROL}`);
  console.log(`   PC vecina (PEER_URL): ${env.PEER_URL || '⚠️ no configurada'}`);
  console.log(`   POST /api/debate/iniciar   { "tema": "...", "maxRondas": 3 }`);
  console.log(`   GET  /api/debate/:id       para ver el historial`);
});