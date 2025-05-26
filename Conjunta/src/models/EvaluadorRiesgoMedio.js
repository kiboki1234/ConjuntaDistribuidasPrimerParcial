import EvaluadorRiesgo from './EvaluadorRiesgo.js';

class EvaluadorRiesgoMedio extends EvaluadorRiesgo {
  evaluate(cliente) {
    const montoMaximo = (cliente.ingresoMensual || 0) * 0.4 * 12; // 40% del ingreso mensual anualizado
    const montoTotalDeuda = (cliente.deudasActuales || []).reduce((total, deuda) => total + (deuda.monto || 0), 0) + (cliente.montoSolicitado || 0);
    const montoAprobado = Math.min(cliente.montoSolicitado * 0.8, montoMaximo); // Máximo 80% del monto solicitado
    
    if (montoTotalDeuda > montoMaximo) {
      return { 
        aprobado: false, 
        mensaje: 'Deuda total excede el 40% de su capacidad de pago',
        nivelRiesgo: 'MEDIO',
        montoAprobado: 0
      };
    }
    
    // Verificación básica de elegibilidad
    if ((cliente.puntajeCrediticio || 0) < 500) {
      return { 
        aprobado: false, 
        mensaje: 'Puntaje crediticio insuficiente para nivel de riesgo medio',
        nivelRiesgo: 'MEDIO',
        montoAprobado: 0
      };
    }
    
    return { 
      aprobado: true, 
      montoAprobado: montoAprobado,
      nivelRiesgo: 'MEDIO',
      mensaje: 'Préstamo aprobado con condiciones',
      tasaInteres: 0.15, // 15% de interés
      plazoAprobado: cliente.plazoEnMeses || 12,
      condiciones: ['Se requiere aval', 'Seguro de desempleo obligatorio']
    };
  }
}

export default EvaluadorRiesgoMedio;