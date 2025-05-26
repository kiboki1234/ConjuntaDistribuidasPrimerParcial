import Cliente from './Cliente.js';

class PersonaNatural extends Cliente {
  // Hereda el getter tableName de Cliente
  
  constructor(data = {}) {
    super({
      ...data,
      tipo: 'NATURAL'
    });
    this.edad = data.edad || 0;
    this.ingresoMensual = data.ingresoMensual || 0;
  }


  static async create(data) {
    const cliente = new this(data);
    return await cliente.saveWithDeudas();
  }

  getIngresoReferencial() {
    return parseFloat(this.ingresoMensual) || 0;
  }

  esAptoParaCredito() {
    return this.edad >= 18;
  }
}

export default PersonaNatural;
