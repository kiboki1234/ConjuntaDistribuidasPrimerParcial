import express from 'express';
const router = express.Router();
import * as evaluadorController from '../controllers/evaluadorController.js';
import { pool } from '../config/database.js';

// Middleware para manejar errores de base de datos
const handleDatabaseErrors = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Error de base de datos', 
      details: error.message 
    });
  }
};

// Ruta para evaluar una solicitud de crédito
router.post('/evaluar', handleDatabaseErrors(evaluadorController.evaluar));

// Ruta para obtener el historial de evaluaciones
router.get('/historial', handleDatabaseErrors(evaluadorController.obtenerHistorial));

// Ruta para obtener los detalles de un cliente específico
router.get('/cliente/:id', handleDatabaseErrors(async (req, res) => {
  const { id } = req.params;
  
  // Obtener información del cliente
  const [clientes] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  if (clientes.length === 0) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  const cliente = clientes[0];
  
  // Obtener deudas del cliente
  const [deudas] = await pool.query(
    'SELECT * FROM deudas WHERE cliente_id = ?', 
    [id]
  );
  
  // Obtener historial de evaluaciones del cliente
  const [evaluaciones] = await pool.query(
    'SELECT * FROM evaluaciones WHERE cliente_id = ? ORDER BY created_at DESC',
    [id]
  );
  
  // Formatear la respuesta
  const respuesta = {
    id: cliente.id,
    tipo: cliente.tipo,
    nombre: cliente.nombre,
    puntajeCrediticio: cliente.puntaje_crediticio,
    montoSolicitado: parseFloat(cliente.monto_solicitado),
    plazoMeses: cliente.plazo_meses,
    edad: cliente.edad,
    ingresoMensual: parseFloat(cliente.ingreso_mensual) || 0,
    antiguedadAnios: cliente.antiguedad_anios || 0,
    ingresoAnual: parseFloat(cliente.ingreso_anual) || 0,
    empleados: cliente.empleados || 0,
    deudas: deudas.map(d => ({
      id: d.id,
      monto: parseFloat(d.monto),
      plazoMeses: d.plazo_meses,
      descripcion: d.descripcion,
      fecha: d.created_at
    })),
    evaluaciones: evaluaciones.map(e => ({
      id: e.id,
      aprobado: Boolean(e.aprobado),
      montoAprobado: parseFloat(e.monto_aprobado) || 0,
      nivelRiesgo: e.nivel_riesgo,
      mensaje: e.mensaje,
      fecha: e.created_at
    })),
    fechaCreacion: cliente.created_at,
    fechaActualizacion: cliente.updated_at
  };
  
  res.json(respuesta);
}));

// Ruta para obtener la lista de clientes con resumen
router.get('/clientes', handleDatabaseErrors(async (req, res) => {
  const [clientes] = await pool.query(`
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM evaluaciones e WHERE e.cliente_id = c.id) as total_evaluaciones,
      (SELECT MAX(created_at) FROM evaluaciones e WHERE e.cliente_id = c.id) as ultima_evaluacion
    FROM clientes c
    ORDER BY c.created_at DESC
  `);
  
  const respuesta = clientes.map(cliente => ({
    id: cliente.id,
    tipo: cliente.tipo,
    nombre: cliente.nombre,
    puntajeCrediticio: cliente.puntaje_crediticio,
    montoSolicitado: parseFloat(cliente.monto_solicitado) || 0,
    totalDeudas: 0, // Se puede calcular con una subconsulta si es necesario
    totalEvaluaciones: cliente.total_evaluaciones,
    ultimaEvaluacion: cliente.ultima_evaluacion,
    fechaCreacion: cliente.created_at
  }));
  
  res.json(respuesta);
}));

export default router;
