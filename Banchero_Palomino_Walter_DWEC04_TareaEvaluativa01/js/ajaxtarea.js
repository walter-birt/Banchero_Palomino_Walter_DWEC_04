import Evento from "../models/Evento.js";
document.addEventListener('DOMContentLoaded', function () {
  recuperarFiltrosDeLocalStorage();
  actualizarNavegador();
  obtenerEventosPorFecha();
});

let fechaActual = new Date();
// Recuperar la fecha seleccionada del localStorage (si existe)
const fechaAlmacenada = localStorage.getItem('fechaSeleccionada');

if (fechaAlmacenada) {
  fechaActual = new Date(fechaAlmacenada); // Usar la fecha almacenada
} else {
  fechaActual = new Date(); // Usar la fecha actual si no hay una fecha almacenada
}

function guardarFiltrosEnLocalStorage() {
  localStorage.setItem('ciudadSeleccionada', ciudadSeleccionada);
  localStorage.setItem('tipoSeleccionado', tipoSeleccionado);
}
function recuperarFiltrosDeLocalStorage() {
  ciudadSeleccionada = localStorage.getItem('ciudadSeleccionada') || '';
  tipoSeleccionado = localStorage.getItem('tipoSeleccionado') || '';
}


const hoy = new Date();
let eventos = []; // Array para almacenar los eventos
let ciudadSeleccionada = '';
let tipoSeleccionado = '';
let provinciaSeleccionada = '';
let eventosMostrados = 20;

// Formatear la fecha como YYYY/MM/DD para la API
function formatearFecha(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
// Función para obtener el nombre del mes en español
function obtenerNombreMes(fecha) {
  const opciones = { month: 'long' };
  return fecha.toLocaleDateString('es-ES', opciones);
}
// Función para actualizar el navegador de fechas
function actualizarNavegador() {
  const diaTexto = `${fechaActual.getDate()} ${obtenerNombreMes(fechaActual)}`;
  document.getElementById("dia-actual").innerText = diaTexto;
}

// Función para obtener eventos de la API según la fecha 
function obtenerEventosPorFecha() {
  const fechaFormateada = formatearFecha(fechaActual);
  const apiUrl = `https://api.euskadi.eus/culture/events/v1.0/events/byDate/${fechaFormateada}?_elements=100`;
  // Hacer la petición AJAX con jquery
  $.ajax({
    url: apiUrl,
    method: "GET",
    dataType: "json",
    success: function (data) {
      console.log("Datos recibidos:", data);

      $("#event-list").empty(); // Limpiar la lista
      eventos = []; // Vaciar eventos antes de actualizar

      if (data && data.items && data.items.length) {
        eventos = data.items.map(item => Evento.fromJSON(item));
        aplicarFiltros();
        mostrarEventos(eventos);
        llenarFiltros(eventos);
      } else {
        $("#event-list").html("<p>No hay eventos para este día.</p>");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error al obtener eventos:", error);
    }
  });
}

// Función para aplicar los filtros a los eventos
function aplicarFiltros() {
  if (ciudadSeleccionada) {
    eventos = eventos.filter(evento => evento.ciudad === ciudadSeleccionada);
  }
  if (tipoSeleccionado) {
    eventos = eventos.filter(evento => evento.tipo === tipoSeleccionado);
  }
}

function cambiarDia(direccion) {
  fechaActual.setDate(fechaActual.getDate() + direccion); // Cambia el día
  eventosMostrados = 20; // Resetea la paginación al cambiar el día

  // Guardar la fecha seleccionada en el localStorage
  localStorage.setItem('fechaSeleccionada', fechaActual.toISOString());

  actualizarNavegador();

  // Verificar si hay filtros aplicados
  if (provinciaSeleccionada) {
    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const day = String(fechaActual.getDate()).padStart(2, '0');
    obtenerEventosPorFechaYProvincia(year, month, day, provinciaSeleccionada);
  } else {
    obtenerEventosPorFecha();
  }
}

// Event Listeners usando jQuery
$(document).ready(function () {
  $("#prev-dia").on("click", () => cambiarDia(-1));
  $("#next-dia").on("click", () => cambiarDia(1));
  $("#mostrar-mas").on("click", () => {
    eventosMostrados += 20; // Incrementar el número de eventos mostrados

    if (provinciaSeleccionada) {
      const year = fechaActual.getFullYear();
      const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const day = String(fechaActual.getDate()).padStart(2, '0');
      obtenerEventosPorFechaYProvincia(year, month, day, provinciaSeleccionada);
    } else {
      obtenerEventosPorFecha();
    }
  });

  // Inicializar la página con la fecha actual
  actualizarNavegador();
  obtenerEventosPorFecha();
});


// Función para mostrar los eventos en la página
function mostrarEventos(eventos) {
  const eventListContainer = document.getElementById('event-list');
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  eventListContainer.innerHTML = ''; // Limpiar la lista de eventos
  console.log("Eventos a mostrar:", eventos)
  // Mostrar solo los primeros "eventosMostrados" eventos
  const eventosAMostrar = eventos.slice(0, eventosMostrados);

  if (!eventos || eventos.length === 0) {
    eventListContainer.innerHTML = "<p>No hay eventos para esta fecha.</p>";
    return; // Salir de la función si no hay eventos
  }


  eventosAMostrar.forEach(evento => {
    // Crear los elementos de cada tarjeta de evento
    const contenedorEvento = document.createElement('div');
    contenedorEvento.classList.add('event-card');

    // Imagen del evento
    const imagen = document.createElement('img');
    imagen.src = evento.imagen;
    imagen.alt = evento.nombre || 'Evento';
    contenedorEvento.appendChild(imagen);

    // Nombre del evento
    const nombre = document.createElement('h3');
    nombre.innerText = evento.nombre;
    contenedorEvento.appendChild(nombre);

    // Tipo
    const tipo = document.createElement("h3");
    tipo.innerHTML = evento.tipo;
    contenedorEvento.appendChild(tipo);

    // Lugar del evento
    const lugar = document.createElement("h3");
    lugar.innerHTML = evento.ciudad;
    contenedorEvento.appendChild(lugar);

    // Botón para marcar como favorito
    const botonFavorito = document.createElement('button');
    botonFavorito.classList.add('favorito-btn');

    // Verificar si el evento ya es favorito
    if (favoritos.includes(evento.id)) {
      botonFavorito.innerText = '❤️';
    } else {
      botonFavorito.innerText = '♡';
    }

    botonFavorito.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleFavorito(evento.id, botonFavorito); // Función para gestión favoritos
    });
    contenedorEvento.appendChild(botonFavorito);
    eventListContainer.appendChild(contenedorEvento);

    // Redireccionar a detallesevento.html al hacer clic
    contenedorEvento.addEventListener('click', function () {
      guardarFiltrosEnLocalStorage();
      window.location.href = `../web/detallesevento.html?id=${evento.id}`;
    });
  });

  // Ocultar el botón "Mostrar más" si no hay más eventos por mostrar
  if (eventosMostrados >= eventos.length) {
    document.getElementById("mostrar-mas").style.display = "none";
  } else {
    document.getElementById("mostrar-mas").style.display = "block";
  }
}


// Función para llenar los filtros de ciudad y tipo
function llenarFiltros(eventos) {
  const filtroCiudad = document.getElementById('filtro-ciudad');
  const filtroTipo = document.getElementById('filtro-tipo');

  filtroCiudad.innerHTML = '';
  filtroTipo.innerHTML = '';

  // Agregar opción "Todos" al inicio de cada filtro
  const opcionDefectoCiudad = document.createElement('option');
  opcionDefectoCiudad.value = '';
  opcionDefectoCiudad.innerText = 'Todos';
  filtroCiudad.appendChild(opcionDefectoCiudad);

  const opcionDefectoTipo = document.createElement('option');
  opcionDefectoTipo.value = '';
  opcionDefectoTipo.innerText = 'Todos';
  filtroTipo.appendChild(opcionDefectoTipo);

  // Objetos para almacenar las ciudades y tipos sin repeticiones
  let ciudades = {};
  let tipos = {};

  eventos.forEach(evento => {
    if (evento.ciudad && !ciudades[evento.ciudad]) {
      ciudades[evento.ciudad] = true; // Guardo la ciudad
    }
    if (evento.tipo && !tipos[evento.tipo]) {
      tipos[evento.tipo] = true; // Guardo el tipo
    }
  });

  // Agregar ciudades al filtro
  Object.keys(ciudades).forEach(ciudad => {
    const option = document.createElement('option');
    option.value = ciudad;
    option.innerText = ciudad;
    filtroCiudad.appendChild(option);
  });

  // Agregar los tipos al filtro
  Object.keys(tipos).forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.innerText = tipo;
    filtroTipo.appendChild(option);
  });


  // Marcar la opción seleccionada en los filtros
  filtroCiudad.value = ciudadSeleccionada;
  filtroTipo.value = tipoSeleccionado;

  // Agregar los eventos filtrados cuando se cambie un filtro
  filtroCiudad.addEventListener('change', function () {
    ciudadSeleccionada = filtroCiudad.value;
    guardarFiltrosEnLocalStorage();
    eventosMostrados = 20;
    obtenerEventosPorFecha();
  });

  filtroTipo.addEventListener('change', function () {
    tipoSeleccionado = filtroTipo.value;
    guardarFiltrosEnLocalStorage();
    eventosMostrados = 20;
    obtenerEventosPorFecha();
  });

}

/*----------------FUNCION FAVORITOS -------------------------------*/
function mostrarFavoritos() {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  if (favoritos.length === 0) {
    document.getElementById('event-list').innerHTML = '<p>No tienes eventos marcados como favoritos.</p>';
    return;
  }

  const eventListContainer = document.getElementById('event-list');
  eventListContainer.innerHTML = '';

  document.getElementById('titulo-eventos').innerText = 'Favoritos';


  const eventosFavoritos = [];
  const fetchPromises = favoritos.map(eventoId => {
    const apiUrl = `https://api.euskadi.eus/culture/events/v1.0/events/${eventoId}`;
    return fetch(apiUrl)
      .then(response => response.json())
      .then(evento => {
        eventosFavoritos.push(Evento.fromJSON(evento));
      })
      .catch(error => console.error("Error al obtener evento favorito:", error));
  });

  let resolvedPromises = 0;
  fetchPromises.forEach(promise => {
    promise.then(() => {
      resolvedPromises++;
      if (resolvedPromises === fetchPromises.length) {
        if (eventosFavoritos.length === 0) {
          eventListContainer.innerHTML = '<p>No tienes eventos marcados como favoritos.</p>';
        } else {
          mostrarEventos(eventosFavoritos);
        }
      }
    });
  });
}

function toggleFavorito(eventoId, botonFavorito) {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const eventoIdStr = eventoId.toString(); // Convertir el ID a cadena

  const index = favoritos.indexOf(eventoIdStr);

  if (index === -1) {
    favoritos.push(eventoIdStr);
    botonFavorito.textContent = '❤️';
  } else {
    favoritos.splice(index, 1);
    botonFavorito.textContent = '♡';
  }
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

document.getElementById('mostrar-favoritos').addEventListener('click', function () {
  const botonMostrarFavoritos = document.getElementById('mostrar-favoritos');
  const iconoCorazon = document.getElementById('corazon-icono');
  const filtrosElemento = document.getElementById('filtros-ct');
  const navegadorFechasElemento = document.getElementById('navegador-fechas');
  const botonVolver = document.getElementById('volver-inicio'); // Botón de volver

  botonMostrarFavoritos.classList.toggle('activo');

  if (botonMostrarFavoritos.classList.contains('activo')) {
    mostrarFavoritos();
    iconoCorazon.src = 'img/home.png';
    filtrosElemento.classList.add('hidden');
    navegadorFechasElemento.classList.add('hidden');
    botonVolver.style.display = 'block';
  } else {
    document.getElementById('titulo-eventos').innerText = 'Eventos del día';
    obtenerEventosPorFecha();
    iconoCorazon.src = 'img/corazon.png';
    filtrosElemento.classList.remove('hidden');
    navegadorFechasElemento.classList.remove('hidden');
    botonVolver.style.display = 'none';
  }
});

// Evento para el botón de volver
document.getElementById('volver-inicio').addEventListener('click', function () {
  const filtrosElemento = document.getElementById('filtros-ct');
  const navegadorFechasElemento = document.getElementById('navegador-fechas');
  const botonVolver = document.getElementById('volver-inicio');
  const botonMostrarFavoritos = document.getElementById('mostrar-favoritos');
  const iconoCorazon = document.getElementById('corazon-icono');

  // Restaurar vista normal de eventos
  document.getElementById('titulo-eventos').innerText = 'Eventos del día';
  obtenerEventosPorFecha();

  filtrosElemento.classList.remove('hidden');
  navegadorFechasElemento.classList.remove('hidden');
  botonVolver.style.display = 'none';
  botonMostrarFavoritos.classList.remove('activo');
  iconoCorazon.src = 'img/corazon.png';
});

/*---------------- BUSCAR POR FECHA Y PROVINCIA --------------------------*/
function obtenerEventosPorFechaYProvincia(year, month, day, provincia) {
  const apiUrl = `https://api.euskadi.eus/culture/events/v1.0/events/byDate/${year}/${month}/${day}/byProvince/${provincia}?_elements=100`;
  // Hacer la petición AJAX con jquery
  $.ajax({
    url: apiUrl,
    method: "GET",
    dataType: "json",
    success: function (data) {
      console.log("Eventos obtenidos:", data);

      if (data && data.items && data.items.length) {
        eventos = data.items.map(item => Evento.fromJSON(item)); // Actualizar la variable global `eventos`
        mostrarEventos(eventos);
      } else {
        $("#event-list").html("<p>No hay eventos para esta fecha y provincia.</p>");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error al obtener eventos:", error);
    }
  });
}

$("#aplicar-filtros").on("click", function () {
  const fechaInput = $("#filtro-fecha").val();
  provinciaSeleccionada = $("#filtro-provincia").val(); // Actualizar la provincia seleccionada

  if (!fechaInput || !provinciaSeleccionada) {
    alert('Por favor, selecciona tanto la fecha como la provincia.');
    return;
  }

  // Actualizar la fechaActual con la fecha seleccionada
  const [year, month, day] = fechaInput.split('-');
  fechaActual = new Date(year, month - 1, day); // month - 1 porque los meses en JavaScript van de 0 a 11

  // Guardar la fecha seleccionada en el localStorage
  localStorage.setItem('fechaSeleccionada', fechaActual.toISOString());
  actualizarNavegador();
  obtenerEventosPorFechaYProvincia(year, month, day, provinciaSeleccionada);
});
