class BaseDTO {
  constructor(data = {}) {
    this.id = data.id || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Método para transformar un objeto a JSON usando programación funcional
  toJSON() {
    return Object.entries(this)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value?.toJSON?.() ?? value
      }), {});
  }

  // Método estático para crear un stream de transformación de modelos a DTOs
  static createTransformStream() {
    return new Transform({
      objectMode: true,
      transform: (chunk, _, callback) => {
        try {
          const dto = this.fromModel(chunk);
          callback(null, dto.toJSON());
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  // Método estático para procesar un stream de modelos a DTOs
  static async processStream(readableStream, writableStream) {
    const transformStream = this.createTransformStream();
    
    try {
      await pipeline(
        readableStream,
        transformStream,
        writableStream
      );
    } catch (error) {
      console.error('Error processing stream:', error);
      throw error;
    }
  }

  // Método estático para crear un DTO desde un modelo
  static fromModel(model) {
    if (!model) return null;
    return new this(model);
  }
}

export default BaseDTO;
