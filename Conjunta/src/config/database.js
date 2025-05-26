import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'MYSQL_ADDON_HOST',
  'MYSQL_ADDON_DB',
  'MYSQL_ADDON_USER',
  'MYSQL_ADDON_PASSWORD',
  'MYSQL_ADDON_PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Error: Faltan las siguientes variables de entorno requeridas:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Configuración de la conexión a la base de datos
const connectionString = process.env.MYSQL_ADDON_URI;

if (!connectionString) {
  console.error('❌ Error: La variable de entorno MYSQL_ADDON_URI no está definida');
  process.exit(1);
}

// Crear el pool de conexiones usando la URI de conexión
const pool = mysql.createPool(connectionString);

// Mantener dbConfig para compatibilidad con el código existente
const dbConfig = {
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: parseInt(process.env.MYSQL_ADDON_PORT, 10)
};

// Probar la conexión
const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Verificar la versión de MySQL
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`📊 Versión de MySQL: ${rows[0].version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    throw error;
  } finally {
    if (connection) await connection.release();
  }
};

// Manejador para cerrar el pool de conexiones
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 Conexión a la base de datos cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión a la base de datos:', error.message);
    throw error;
  }
};

// Manejador de eventos para el pool
pool.on('acquire', (connection) => {
  console.debug(`🔌 Conexión ${connection.threadId} adquirida`);
});

pool.on('release', (connection) => {
  console.debug(`🔌 Conexión ${connection.threadId} liberada`);
});

pool.on('enqueue', () => {
  console.debug('⏳ Esperando conexión disponible...');
});

export { pool, testConnection, closePool, dbConfig };
