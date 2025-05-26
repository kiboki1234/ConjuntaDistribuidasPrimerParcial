import Cliente from './Cliente.js';

class PersonaJuridica extends Cliente {
  constructor(data = {}) {
    super({
      ...data,
      tipo: 'JURIDICO'
    });
    this.antiguedadAnios = data.antiguedadAnios || 0;
    this.ingresoAnual = data.ingresoAnual || 0;
    this.empleados = data.empleados || 0;
  }

  static async create(data) {
    const cliente = new this(data);
    return await cliente.saveWithDeudas();
  }

  getIngresoReferencial() {
    return parseFloat(this.ingresoAnual || 0) / 12; // Convertir ingreso anual a mensual
  }

  esAptoParaCredito() {
    return this.antiguedadAnios >= 2 && this.empleados >= 5;
  }
}

export default PersonaJuridica;