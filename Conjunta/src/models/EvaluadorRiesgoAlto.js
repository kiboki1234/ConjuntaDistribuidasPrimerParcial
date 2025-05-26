import EvaluadorRiesgo from './EvaluadorRiesgo.js';

class EvaluadorRiesgoAlto extends EvaluadorRiesgo {
  evaluate(cliente) {
    // Para clientes de alto riesgo, aplicamos restricciones más estrictas
    const montoMaximo = (cliente.ingresoMensual || 0) * 0.2 * 12; // Solo 20% del ingreso anual
    const montoTotalDeuda = (cliente.deudasActuales || []).reduce((total, deuda) => total + (deuda.monto || 0), 0) + (cliente.montoSolicitado || 0);
    
    // Si el cliente tiene un puntaje muy bajo, rechazar automáticamente
    if ((cliente.puntajeCrediticio || 0) < 400) {
      return {
        nivelRiesgo: 'ALTO',
        aprobado: false,
        mensaje: 'Puntaje crediticio demasiado bajo para aprobación',
        montoAprobado: 0,
        tasaInteres: 0,
        plazoAprobado: 0
      };
    }
    
    // Si la deuda total supera el 20% del ingreso anual, rechazar
    if (montoTotalDeuda > montoMaximo) {
      return {
        nivelRiesgo: 'ALTO',
        aprobado: false,
        mensaje: 'Relación deuda-ingreso demasiado alta',
        montoAprobado: 0,
        tasaInteres: 0,
        plazoAprobado: 0
      };
    }
    
    // Para clientes de alto riesgo, aprobamos hasta el 50% del monto solicitado
    const montoAprobado = Math.min(cliente.montoSolicitado * 0.5, montoMaximo);
    
    return {
      nivelRiesgo: 'ALTO',
      aprobado: true,
      montoAprobado: montoAprobado,
      mensaje: 'Préstamo aprobado con condiciones especiales',
      tasaInteres: 0.25, // Tasa de interés alta por alto riesgo
      plazoAprobado: Math.min(cliente.plazoEnMeses || 6, 12), // Plazo máximo de 12 meses
      condiciones: [
        'Se requiere aval con propiedades',
        'Seguro de desempleo obligatorio',
        'Pago inicial del 30%'
      ]
    };
  }
}

export default EvaluadorRiesgoAlto;
