class EvaluadorRiesgo {
  constructor() {
    if (this.constructor === EvaluadorRiesgo) {
      throw new Error('No se puede instanciar la clase abstracta EvaluadorRiesgo');
    }
  }

  evaluate(cliente) {
    throw new Error('El método evaluate debe ser implementado por las clases hijas');
  }
}

export default EvaluadorRiesgo;