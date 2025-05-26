import { pool } from './database.js';

const resetDatabase = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('⚠️  Eliminando tablas existentes...');
    
    // Deshabilitar verificación de claves foráneas temporalmente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Eliminar tablas si existen
    await connection.query('DROP TABLE IF EXISTS evaluaciones');
    await connection.query('DROP TABLE IF EXISTS deudas');
    await connection.query('DROP TABLE IF EXISTS clientes');
    
    // Volver a habilitar verificación de claves foráneas
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Tablas eliminadas correctamente');
    
    // Volver a crear las tablas
    console.log('🔄 Creando tablas...');
    
    // Crear tabla de clientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo ENUM('NATURAL', 'JURIDICO') NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        puntaje_crediticio INT NOT NULL,
        monto_solicitado DECIMAL(15, 2) NOT NULL,
        plazo_meses INT NOT NULL,
        edad INT,
        ingreso_mensual DECIMAL(15, 2),
        antiguedad_anios INT,
        ingreso_anual DECIMAL(15, 2),
        empleados INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla de deudas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deudas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        monto DECIMAL(15, 2) NOT NULL,
        plazo_meses INT NOT NULL,
        descripcion VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla de evaluaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS evaluaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        aprobado BOOLEAN NOT NULL,
        monto_aprobado DECIMAL(15, 2),
        nivel_riesgo ENUM('BAJO', 'MEDIO', 'ALTO') NOT NULL,
        mensaje TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);
    
    await connection.commit();
    console.log('✅ Base de datos reiniciada correctamente');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al reiniciar la base de datos:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
};

// Ejecutar el script
resetDatabase().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
