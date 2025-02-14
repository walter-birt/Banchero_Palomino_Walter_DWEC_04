class Evento {
    constructor(id, nombre, tipo, ciudad, imagen, descripcion, fechaInicio, fechaFin, hora, lugar, precio) {
      this.id = id;
      this.nombre = nombre;
      this.tipo = tipo;
      this.ciudad = ciudad;
      this.imagen = imagen;
      this.descripcion = descripcion;
      this.fechaInicio = fechaInicio;
      this.fechaFin = fechaFin;
      this.hora = hora;
      this.lugar = lugar;
      this.precio = precio;
    }
  
    // Método para convertir el objeto a JSON (opcional)
    convertToJSON() {
      return JSON.stringify({
        id: this.id,
        nombre: this.nombre,
        tipo: this.tipo,
        ciudad: this.ciudad,
        imagen: this.imagen,
        descripcion: this.descripcion,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        hora: this.hora,
        lugar: this.lugar,
        precio: this.precio
      });
    }
  
    // Método estático para crear un objeto Evento desde JSON
    static fromJSON(json) {
      return new Evento(
        json.id,
        json.nameEs || "Nombre no disponible",
        json.typeEs || "Tipo no especificado",
        json.municipalityEs || "Ciudad no especificada",
        json.images && json.images[0] ? json.images[0].imageUrl : "default_image.jpg",
        json.descriptionEs || "Descripción no disponible",
        json.startDate || "Fecha no disponible",
        json.endDate || "Fecha no disponible",
        json.openingHoursEs || "Hora no disponible",
        json.establishmentEs || "Lugar no disponible",
        json.priceEs || "Precio no disponible"
      );
    }
  }
  
  export default Evento;
  