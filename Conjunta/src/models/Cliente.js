import BaseModel from './BaseModel.js';
import { pool } from '../config/database.js';

class Cliente extends BaseModel {
  static get tableName() {
    return 'clientes';
  }

  constructor(data = {}) {
    super();
    this.id = data.id;
    this.tipo = data.tipo;
    this.nombre = data.nombre;
    this.puntajeCrediticio = data.puntaje_crediticio || data.puntajeCrediticio || 0;
    this.montoSolicitado = data.monto_solicitado || data.montoSolicitado || 0;
    this.plazoEnMeses = data.plazo_meses || data.plazoEnMeses || 0;
    this.edad = data.edad || null;
    this.ingresoMensual = data.ingreso_mensual || data.ingresoMensual || 0;
    this.antiguedadAnios = data.antiguedad_anios || data.antiguedadAnios || 0;
    this.ingresoAnual = data.ingreso_anual || data.ingresoAnual || 0;
    this.empleados = data.empleados || 0;
    this.deudasActuales = data.deudasActuales || [];
  }

  static async findWithDeudas(id) {
    const [rows] = await pool.query(
      `SELECT c.*, 
              d.id as deuda_id, d.monto as deuda_monto, d.plazo_meses as deuda_plazo_meses, d.descripcion as deuda_descripcion
       FROM clientes c
       LEFT JOIN deudas d ON c.id = d.cliente_id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const clienteData = {
      ...rows[0],
      deudasActuales: []
    };

    // Add deudas if they exist
    rows.forEach(row => {
      if (row.deuda_id) {
        clienteData.deudasActuales.push({
          id: row.deuda_id,
          monto: parseFloat(row.deuda_monto),
          plazoMeses: row.deuda_plazo_meses,
          descripcion: row.deuda_descripcion
        });
      }
    });

    return new this(clienteData);
  }

  async saveWithDeudas() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      let cliente;
      const tableName = this.constructor.tableName; // Acceder al getter tableName
      
      if (this.id) {
        // Actualizar cliente existente
        await connection.query(
          `UPDATE ${tableName} 
          SET tipo = ?, nombre = ?, puntaje_crediticio = ?, monto_solicitado = ?, 
              plazo_meses = ?, edad = ?, ingreso_mensual = ?, 
              antiguedad_anios = ?, ingreso_anual = ?, empleados = ?
          WHERE id = ?`,
          [
            this.tipo,
            this.nombre,
            this.puntajeCrediticio,
            this.montoSolicitado,
            this.plazoEnMeses,
            this.edad,
            this.ingresoMensual,
            this.antiguedadAnios,
            this.ingresoAnual,
            this.empleados,
            this.id
          ]
        );
        cliente = { id: this.id };
      } else {
        // Crear nuevo cliente
        const [result] = await connection.query(
          `INSERT INTO ${tableName} 
          (tipo, nombre, puntaje_crediticio, monto_solicitado, plazo_meses, 
           edad, ingreso_mensual, antiguedad_anios, ingreso_anual, empleados)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            this.tipo,
            this.nombre,
            this.puntajeCrediticio,
            this.montoSolicitado,
            this.plazoEnMeses,
            this.edad,
            this.ingresoMensual,
            this.antiguedadAnios,
            this.ingresoAnual,
            this.empleados
          ]
        );
        this.id = result.insertId;
        cliente = { id: this.id };
      }
      
      // Guardar deudas
      if (this.deudasActuales && this.deudasActuales.length > 0) {
        // Eliminar deudas existentes
        await connection.query('DELETE FROM deudas WHERE cliente_id = ?', [this.id]);
        
        // Insertar nuevas deudas
        const deudaValues = this.deudasActuales.map(deuda => [
          this.id,
          deuda.monto,
          deuda.plazoMeses || 0,
          deuda.descripcion || null
        ]);
        
        if (deudaValues.length > 0) {
          await connection.query(
            'INSERT INTO deudas (cliente_id, monto, plazo_meses, descripcion) VALUES ?',
            [deudaValues]
          );
        }
      }

      await connection.commit();
      
      // Obtener el cliente con sus deudas actualizadas
      const clienteActualizado = await this.constructor.findWithDeudas(this.id);
      if (!clienteActualizado) {
        throw new Error('No se pudo recuperar el cliente después de guardar');
      }
      
      return clienteActualizado;
    } catch (error) {
      await connection.rollback();
      console.error('Error en saveWithDeudas:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  getMontoDeudas() {
    return this.deudasActuales.reduce((sum, d) => sum + parseFloat(d.monto), 0);
  }

  getIngresoReferencial() {
    throw new Error('Método abstracto');
  }

  esAptoParaCredito() {
    throw new Error('Método abstracto');
  }

  static async createEvaluation(clienteId, resultado) {
    if (!clienteId) {
      throw new Error('Se requiere el ID del cliente para crear una evaluación');
    }

    if (typeof resultado !== 'object' || resultado === null) {
      throw new Error('Se requiere un objeto de resultado válido');
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Verificar que el cliente existe
      const [clienteRows] = await connection.query(
        'SELECT id FROM clientes WHERE id = ?',
        [clienteId]
      );
      
      if (clienteRows.length === 0) {
        throw new Error(`No se encontró el cliente con ID: ${clienteId}`);
      }
      
      const [result] = await connection.query(
        'INSERT INTO evaluaciones (cliente_id, aprobado, monto_aprobado, nivel_riesgo, mensaje) VALUES (?, ?, ?, ?, ?)',
        [
          clienteId,
          Boolean(resultado.aprobado),
          parseFloat(resultado.monto_aprobado) || 0,
          resultado.nivel_riesgo || 'BAJO',
          resultado.mensaje || resultado.motivo || 'Evaluación completada'
        ]
      );
      
      await connection.commit();
      
      return {
        id: result.insertId,
        cliente_id: clienteId,
        aprobado: Boolean(resultado.aprobado),
        monto_aprobado: parseFloat(resultado.monto_aprobado) || 0,
        nivel_riesgo: resultado.nivel_riesgo || 'BAJO',
        mensaje: resultado.mensaje || resultado.motivo || 'Evaluación completada',
        fecha: new Date()
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error en createEvaluation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default Cliente;
