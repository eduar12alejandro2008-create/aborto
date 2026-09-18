function errorHandler(err, req, res, next) {
  console.error('❌ Error no manejado:', err.stack || err.message);

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
}

export default errorHandler;