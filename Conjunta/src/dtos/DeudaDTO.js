import BaseDTO from './BaseDTO.js';
import { Transform } from 'stream';

class DeudaDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    this.clienteId = data.clienteId || data.cliente_id || null;
    this.monto = data.monto ? parseFloat(data.monto) : 0;
    this.plazoMeses = data.plazoMeses || data.plazo_meses || 0;
    this.descripcion = data.descripcion || '';
    this.fechaInicio = data.fechaInicio || data.fecha_inicio || null;
    this.tasaInteres = data.tasaInteres || data.tasa_interes || 0;
  }

  // Método para calcular el pago mensual usando función flecha
  calcularPagoMensual = () => {
    if (this.tasaInteres === 0) {
      return this.monto / this.plazoMeses;
    }
    const tasaMensual = this.tasaInteres / 100 / 12;
    return (this.monto * tasaMensual * Math.pow(1 + tasaMensual, this.plazoMeses)) / 
           (Math.pow(1 + tasaMensual, this.plazoMeses) - 1);
  }

  // Método para validar la deuda
  validate() {
    const validations = [
      { check: () => this.monto <= 0, message: 'El monto debe ser mayor a 0' },
      { check: () => this.plazoMeses <= 0, message: 'El plazo debe ser mayor a 0 meses' },
      { check: () => this.tasaInteres < 0, message: 'La tasa de interés no puede ser negativa' }
    ];

    return validations
      .filter(({ check }) => check())
      .map(({ message }) => message);
  }

  // Stream para filtrar deudas por monto mínimo
  static createFilterByAmountStream(minAmount = 0) {
    return new Transform({
      objectMode: true,
      transform: (deuda, _, callback) => {
        try {
          const deudaDTO = this.fromModel(deuda);
          if (deudaDTO.monto >= minAmount) {
            callback(null, deudaDTO);
          } else {
            callback();
          }
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  // Método estático para procesar múltiples deudas usando streams
  static async processDeudasStream(readableStream, writableStream, options = {}) {
    const { minAmount = 0 } = options;
    
    const filterStream = this.createFilterByAmountStream(minAmount);
    const transformStream = this.createTransformStream();
    
    try {
      await pipeline(
        readableStream,
        filterStream,
        transformStream,
        writableStream
      );
    } catch (error) {
      console.error('Error procesando stream de deudas:', error);
      throw error;
    }
  }

  static fromModel(model) {
    if (!model) return null;
    return new DeudaDTO({
      ...model,
      // Asegurarse de que los campos numéricos sean números
      monto: parseFloat(model.monto || 0),
      plazoMeses: parseInt(model.plazoMeses || model.plazo_meses || 0, 10),
      tasaInteres: parseFloat(model.tasaInteres || model.tasa_interes || 0)
    });
  }
}

export default DeudaDTO;
