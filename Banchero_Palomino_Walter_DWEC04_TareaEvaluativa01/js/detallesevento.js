import Evento from "../models/Evento.js";
$(document).ready(function () {
  // Obtener el parámetro 'id' de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (!eventId) {
      $('#evento-detalles').html('<p>Error: No se proporcionó un ID válido del evento.</p>');
      return;
  }

  // Hacer la petición AJAX con jquery
  $.ajax({
      url: `https://api.euskadi.eus/culture/events/v1.0/events/${eventId}`,
      method: "GET",
      dataType: "json",
      success: function (eventoData) {
          const evento = Evento.fromJSON(eventoData); 
          const fechaInicioFormateada = new Date(evento.fechaInicio).toLocaleDateString("es-ES");
          const fechaFinFormateada = new Date(evento.fechaFin).toLocaleDateString("es-ES");

          // Construir el HTML de los detalles del evento
          let detallesHTML = `
          <div class="evento-imagen">
              <img src="${evento.imagen || 'default_image.jpg'}" alt="${evento.nombre}">
          </div>
          <div class="evento-info">
              <p><span class="label">Fecha de inicio:</span> ${fechaInicioFormateada || 'No disponible'}</p>
              <p><span class="label">Fecha de fin:</span> ${fechaFinFormateada || 'No disponible'}</p>
              <p><span class="label">Hora:</span> ${evento.hora || 'No disponible'}</p>
              <p><span class="label">Ciudad:</span> ${evento.ciudad || 'No disponible'}</p>
              <p><span class="label">Lugar:</span> ${evento.lugar || 'No disponible'}</p>
              <p><span class="label">Precio:</span> ${evento.precio || 'No disponible'}</p>
          </div>
          <h2 class="evento-titulo">${evento.nombre || 'Nombre no disponible'}</h2>
          <div class="evento-descripcion">
              <p>${evento.descripcion || 'Descripción no disponible'}</p>
          </div>
      `;
      
      $('#evento-detalles').html(detallesHTML);
      
        
      },
      error: function (xhr, status, error) {
          console.error('Error al obtener los detalles del evento:', error);
          $('#evento-detalles').html('<p>Error al cargar los detalles del evento.</p>');
      }
  });

  // Volver al index.html
  $('#volver-index').on('click', function () {
      window.location.href = '../index.html';
  });
});
