import { pool } from './database.js';

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Create Clientes table
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
    
    // Create Deudas table
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
    
    // Create Evaluaciones table
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
    console.log('✅ Database tables created successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating database tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Run the initialization
const init = async () => {
  try {
    await createTables();
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
};

init();
