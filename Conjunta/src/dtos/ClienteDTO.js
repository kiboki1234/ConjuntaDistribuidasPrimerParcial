import BaseDTO from './BaseDTO.js';
import DeudaDTO from './DeudaDTO.js';
import { Transform } from 'stream';

class ClienteDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
    this.tipo = data.tipo || '';
    this.nombre = data.nombre || '';
    this.puntajeCrediticio = data.puntajeCrediticio || data.puntaje_crediticio || 0;
    this.montoSolicitado = data.montoSolicitado || data.monto_solicitado || 0;
    this.plazoEnMeses = data.plazoEnMeses || data.plazo_meses || 0;
    this.edad = data.edad || null;
    this.ingresoMensual = data.ingresoMensual || data.ingreso_mensual || 0;
    this.antiguedadAnios = data.antiguedadAnios || data.antiguedad_anios || 0;
    this.ingresoAnual = data.ingresoAnual || data.ingreso_anual || 0;
    this.empleados = data.empleados || 0;
    
    // Usando función flecha para mapear las deudas
    this.deudasActuales = (data.deudasActuales || [])
      .map(deuda => deuda instanceof DeudaDTO ? deuda : new DeudaDTO(deuda));
  }

  // Método para validar los datos del cliente usando funciones flecha
  validate() {
    const validations = [
      { check: () => !this.nombre, message: 'El nombre es requerido' },
      { check: () => this.puntajeCrediticio < 0, message: 'El puntaje crediticio no puede ser negativo' },
      // Agregar más validaciones según sea necesario
    ];

    return validations
      .filter(({ check }) => check())
      .map(({ message }) => message);
  }

  // Método para crear un stream de transformación que filtre clientes por puntaje mínimo
  static createFilterByScoreStream(minScore = 0) {
    return new Transform({
      objectMode: true,
      transform: (cliente, _, callback) => {
        try {
          const clienteDTO = this.fromModel(cliente);
          if (clienteDTO.puntajeCrediticio >= minScore) {
            callback(null, clienteDTO);
          } else {
            callback(); // Saltar este cliente
          }
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  // Método estático para procesar múltiples clientes usando streams
  static async processClientesStream(readableStream, writableStream, options = {}) {
    const { minScore = 0 } = options;
    
    const filterStream = this.createFilterByScoreStream(minScore);
    const transformStream = this.createTransformStream();
    
    try {
      await pipeline(
        readableStream,
        filterStream,
        transformStream,
        writableStream
      );
    } catch (error) {
      console.error('Error procesando stream de clientes:', error);
      throw error;
    }
  }

  static fromModel(model) {
    if (!model) return null;
    
    // Usando programación funcional para transformar el modelo
    const transformModel = (model) => ({
      ...model,
      deudasActuales: (model.deudasActuales || [])
        .map(deuda => DeudaDTO.fromModel(deuda))
    });
    
    return new ClienteDTO(transformModel(model));
  }
}

export default ClienteDTO;
