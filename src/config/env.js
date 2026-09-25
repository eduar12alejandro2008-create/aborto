import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  ROL: process.env.ROL || 'preguntona', // 'preguntona' o 'respondona': qué IA corre ESTA pc
  PEER_URL: process.env.PEER_URL, // ej: http://192.168.1.50:3000 — la otra pc
};

export default env;