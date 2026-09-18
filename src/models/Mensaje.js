import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema(
  {
    autor: {
      type: String,
      enum: ['preguntona', 'respondona'],
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // agrega createdAt automático a cada mensaje
);

export default mensajeSchema;