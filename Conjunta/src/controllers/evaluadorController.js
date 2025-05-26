import PersonaNatural from '../models/PersonaNatural.js';
import PersonaJuridica from '../models/PersonaJuridica.js';
import EvaluadorAlto from '../models/EvaluadorRiesgoAlto.js';
import EvaluadorMedio from '../models/EvaluadorRiesgoMedio.js';
import EvaluadorBajo from '../models/EvaluadorRiesgoBajo.js';
import Cliente from '../models/Cliente.js';
import { pool } from '../config/database.js';

const evaluadores = [new EvaluadorBajo(), new EvaluadorMedio(), new EvaluadorAlto()];

// Evaluar solicitud de crédito
export const evaluar = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const data = req.body;
    
    // Validar datos de entrada
    if (!data.tipoCliente || !['NATURAL', 'JURIDICO'].includes(data.tipoCliente)) {
      return res.status(400).json({ error: 'Tipo de cliente no válido' });
    }

    // Crear instancia del cliente según el tipo
    let cliente;
    try {
      const ClienteClass = data.tipoCliente === 'NATURAL' ? PersonaNatural : PersonaJuridica;
      
      // Preparar datos para el cliente
      const clienteData = {
        nombre: data.nombre,
        puntajeCrediticio: data.puntajeCrediticio || 0,
        deudasActuales: data.deudasActuales || [],
        montoSolicitado: data.montoSolicitado,
        plazoEnMeses: data.plazoEnMeses,
        edad: data.edad,
        ingresoMensual: data.ingresoMensual,
        antiguedadAnios: data.antiguedadAnios,
        ingresoAnual: data.ingresoAnual,
        empleados: data.empleados
      };
      
      // Crear y guardar el cliente en la base de datos
      cliente = await ClienteClass.create(clienteData);
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      return res.status(400).json({ 
        error: 'Datos del cliente inválidos', 
        details: error.message 
      });
    }
    
    // Determinar el nivel de riesgo según el puntaje crediticio
    let evaluador;
    let nivelRiesgo;
    
    if (cliente.puntajeCrediticio >= 800) {
      evaluador = evaluadores[0]; // Bajo riesgo
      nivelRiesgo = 'BAJO';
    } else if (cliente.puntajeCrediticio >= 600) {
      evaluador = evaluadores[1]; // Riesgo medio
      nivelRiesgo = 'MEDIO';
    } else {
      evaluador = evaluadores[2]; // Alto riesgo
      nivelRiesgo = 'ALTO';
    }
    
    // Evaluar la solicitud
    const resultado = evaluador.evaluate(cliente);
    resultado.nivelRiesgo = resultado.nivelRiesgo || nivelRiesgo;
    
    // Guardar la evaluación en la base de datos
    const evaluacion = await Cliente.createEvaluation(cliente.id, {
      aprobado: resultado.aprobado,
      monto_aprobado: resultado.montoAprobado || 0,
      nivel_riesgo: resultado.nivelRiesgo,
      mensaje: resultado.motivo || resultado.mensaje || 'Evaluación completada'
    });
    
    // Enviar respuesta
    res.json({
      id: evaluacion.id,
      aprobado: resultado.aprobado,
      montoAprobado: resultado.montoAprobado || 0,
      mensaje: resultado.motivo || resultado.mensaje || 'Evaluación completada',
      nivelRiesgo: resultado.nivelRiesgo,
      fecha: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en evaluación:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud', 
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Obtener historial de evaluaciones
export const obtenerHistorial = async (req, res) => {
  try {
    const [evaluaciones] = await pool.query(`
      SELECT e.*, c.nombre as cliente_nombre, c.tipo as cliente_tipo
      FROM evaluaciones e
      JOIN clientes c ON e.cliente_id = c.id
      ORDER BY e.created_at DESC
    `);
    
    // Formatear la respuesta
    const historial = evaluaciones.map(evalItem => ({
      id: evalItem.id,
      fecha: evalItem.created_at,
      cliente: {
        id: evalItem.cliente_id,
        nombre: evalItem.cliente_nombre,
        tipo: evalItem.cliente_tipo
      },
      resultado: {
        aprobado: Boolean(evalItem.aprobado),
        montoAprobado: parseFloat(evalItem.monto_aprobado) || 0,
        nivelRiesgo: evalItem.nivel_riesgo,
        mensaje: evalItem.mensaje
      }
    }));
    
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener el historial', 
      details: error.message 
    });
  }
};
