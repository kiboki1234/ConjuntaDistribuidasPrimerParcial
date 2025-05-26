import BaseDTO from './BaseDTO.js';

class ResultadoEvaluacionDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    this.clienteId = data.clienteId || data.cliente_id || null;
    this.evaluadorId = data.evaluadorId || data.evaluador_id || null;
    this.puntaje = data.puntaje || 0;
    this.nivelRiesgo = data.nivelRiesgo || data.nivel_riesgo || '';
    this.aprobado = data.aprobado || false;
    this.montoAprobado = data.montoAprobado || data.monto_aprobado || 0;
    this.tasaInteres = data.tasaInteres || data.tasa_interes || 0;
    this.plazoAprobadoMeses = data.plazoAprobadoMeses || data.plazo_aprobado_meses || 0;
    this.observaciones = data.observaciones || '';
    this.fechaEvaluacion = data.fechaEvaluacion || data.fecha_evaluacion || new Date().toISOString();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      clienteId: this.clienteId,
      evaluadorId: this.evaluadorId,
      puntaje: this.puntaje,
      nivelRiesgo: this.nivelRiesgo,
      aprobado: this.aprobado,
      montoAprobado: this.montoAprobado,
      tasaInteres: this.tasaInteres,
      plazoAprobadoMeses: this.plazoAprobadoMeses,
      observaciones: this.observaciones,
      fechaEvaluacion: this.fechaEvaluacion
    };
  }

  static fromModel(model) {
    if (!model) return null;
    return new ResultadoEvaluacionDTO(model);
  }
}

export default ResultadoEvaluacionDTO;
