import dotenv from 'dotenv';
import app from './app.js';
import { testConnection, closePool } from './config/database.js';
import { createLogger, format, transports } from 'winston';

// Cargar variables de entorno
dotenv.config();

// Configurar logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'evaluacion-crediticia' },
  transports: [
    // - Escribir todos los logs con nivel `error` o menor a `error.log`
    // - Escribir todos los logs con nivel `info` o menor a `combined.log`
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Si no estamos en producción, también mostramos los logs en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

const PORT = process.env.PORT || 3000;

// Iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    const server = app.listen(PORT, () => {
      logger.info(` Servidor en ejecución en el puerto ${PORT}`);
      logger.info(` Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(' Rutas disponibles:');
      logger.info(`   POST   /api/evaluar`);
      logger.info(`   GET    /api/historial`);
      logger.info(`   GET    /api/clientes`);
      logger.info(`   GET    /api/cliente/:id`);
      logger.info(`   GET    /status`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`El puerto ${PORT} ya está en uso`);
      } else {
        logger.error('Error en el servidor:', error);
      }
      process.exit(1);
    });

    // Manejo de señales de terminación
    const shutdown = async (signal) => {
      logger.info(`\n${signal} recibida. Cerrando servidor...`);
      
      try {
        // Cerrar el servidor
        await new Promise((resolve, reject) => {
          server.close(err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        // Cerrar la conexión a la base de datos
        await closePool();
        
        logger.info(' Servidor cerrado correctamente');
        process.exit(0);
      } catch (error) {
        logger.error(' Error durante el cierre del servidor:', error);
        process.exit(1);
      }
    };

    // Manejadores de señales
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Manejador de excepciones no capturadas
    process.on('uncaughtException', (error) => {
      logger.error('Excepción no capturada:', error);
      // No salir inmediatamente, dar tiempo a que se registre el error
    });

    // Manejador de promesas rechazadas no manejadas
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promesa rechazada no manejada:');
      logger.error('Promesa:', promise);
      logger.error('Razón:', reason);
    });
    
  } catch (error) {
    logger.error(' No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();
