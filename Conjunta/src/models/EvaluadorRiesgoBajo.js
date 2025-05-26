import EvaluadorRiesgo from './EvaluadorRiesgo.js';

class EvaluadorRiesgoBajo extends EvaluadorRiesgo {
  evaluate(cliente) {
    const montoMaximo = (cliente.ingresoMensual || 0) * 0.3 * 12; // 30% del ingreso mensual anualizado
    const montoTotalDeuda = (cliente.deudasActuales || []).reduce((total, deuda) => total + (deuda.monto || 0), 0) + (cliente.montoSolicitado || 0);
    
    if (montoTotalDeuda > montoMaximo) {
      return { 
        aprobado: false, 
        mensaje: 'Deuda total excede el 30% de su capacidad de pago',
        nivelRiesgo: 'BAJO',
        montoAprobado: 0
      };
    }
    
    // Verificación básica de elegibilidad
    if ((cliente.puntajeCrediticio || 0) < 300) {
      return { 
        aprobado: false, 
        mensaje: 'Puntaje crediticio insuficiente',
        nivelRiesgo: 'BAJO',
        montoAprobado: 0
      };
    }
    
    return { 
      aprobado: true, 
      montoAprobado: cliente.montoSolicitado,
      nivelRiesgo: 'BAJO',
      mensaje: 'Préstamo aprobado',
      tasaInteres: 0.1, // 10% de interés
      plazoAprobado: cliente.plazoEnMeses || 12
    };
  }
}

export default EvaluadorRiesgoBajo;