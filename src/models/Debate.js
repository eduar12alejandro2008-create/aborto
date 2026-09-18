import mongoose from 'mongoose';
import mensajeSchema from './Mensaje.js';

const debateSchema = new mongoose.Schema(
  {
    tema: {
      type: String,
      required: true,
    },
    maxRondas: {
      type: Number,
      default: 3,
    },
    rondaActual: {
      type: Number,
      default: 0,
    },
    estado: {
      type: String,
      enum: ['en_curso', 'finalizado'],
      default: 'en_curso',
    },
    mensajes: [mensajeSchema],
  },
  { timestamps: true } // createdAt y updatedAt del debate completo
);

const Debate = mongoose.model('Debate', debateSchema);

export default Debate;