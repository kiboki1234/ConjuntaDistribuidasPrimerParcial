import ClienteDTO from './ClienteDTO.js';

class PersonaJuridicaDTO extends ClienteDTO {
  constructor(data = {}) {
    super(data);
    this.razonSocial = data.razonSocial || data.razon_social || '';
    this.nit = data.nit || '';
    this.fechaConstitucion = data.fechaConstitucion || data.fecha_constitucion || null;
    this.sector = data.sector || '';
    this.tamanoEmpresa = data.tamanoEmpresa || data.tamano_empresa || '';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      razonSocial: this.razonSocial,
      nit: this.nit,
      fechaConstitucion: this.fechaConstitucion,
      sector: this.sector,
      tamanoEmpresa: this.tamanoEmpresa
    };
  }

  static fromModel(model) {
    if (!model) return null;
    return new PersonaJuridicaDTO(model);
  }
}

export default PersonaJuridicaDTO;
