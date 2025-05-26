import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import evaluadorRoutes from './routes/evaluadorRoutes.js';
import { pool } from './config/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(' Conexión a la base de datos establecida correctamente');
    connection.release();
  } catch (error) {
    console.error(' Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

// Rutas
app.use('/api', evaluadorRoutes);

// Ruta de verificación de estado
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(' Error no manejado:', err);
  
  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message
    });
  }
  
  // Errores de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Entrada duplicada',
      details: 'El registro ya existe en la base de datos'
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error inesperado' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Manejo de señales de terminación
const shutdown = async () => {
  console.log('\n Recibida señal de apagado. Cerrando conexiones...');
  
  try {
    await pool.end();
    console.log(' Conexiones de la base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error(' Error al cerrar las conexiones:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Inicializar la conexión a la base de datos
testDatabaseConnection();

export default app;
