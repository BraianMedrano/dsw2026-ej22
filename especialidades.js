document.addEventListener("DOMContentLoaded", function () {
  const tabla = document.getElementById("tabla-especialidades");
  const buscador = document.getElementById("buscador");
  const mensajeVacio = document.getElementById("mensaje-vacio");
  const mensajeExito = document.getElementById("mensaje-exito");

  const especialidades = obtenerEspecialidades();

  // Dibuja las filas de la tabla con la lista recibida
  function mostrarEspecialidades(lista) {
    tabla.innerHTML = "";

    // Estado vacío: no hay especialidades o la búsqueda no encontró nada
    if (lista.length === 0) {
      if (especialidades.length === 0) {
        mensajeVacio.textContent = "Todavía no hay especialidades cargadas.";
      } else {
        mensajeVacio.textContent = "No se encontraron especialidades con ese nombre.";
      }
      mensajeVacio.classList.remove("hidden");
      return;
    }

    mensajeVacio.classList.add("hidden");

    lista.forEach(function (especialidad) {
      const fila = document.createElement("tr");

      // Usamos textContent para no interpretar HTML escrito por el usuario
      const celdaNombre = document.createElement("td");
      const nombre = document.createElement("span");
      nombre.textContent = especialidad.name;
      nombre.classList.add("fw-bold");
      celdaNombre.innerHTML = '<span class="spec-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg></span>';
      celdaNombre.appendChild(nombre);

      const celdaDescripcion = document.createElement("td");
      celdaDescripcion.textContent = especialidad.description;

      const celdaEstado = document.createElement("td");
      const badge = document.createElement("span");
      badge.classList.add("badge");
      // El mockup muestra el estado en inglés
      if (especialidad.status === "Activa") {
        badge.textContent = "Active";
        badge.classList.add("badge-active");
      } else {
        badge.textContent = "Inactive";
        badge.classList.add("badge-inactive");
      }
      celdaEstado.appendChild(badge);

      // Acciones solo visuales en esta etapa
      const celdaAcciones = document.createElement("td");
      celdaAcciones.classList.add("text-right");
      celdaAcciones.innerHTML =
        '<svg class="icon icon-action" viewBox="0 0 24 24"><title>Editar</title><path d="M17 3l4 4L8 20H4v-4z"/></svg>' +
        '<svg class="icon icon-action" viewBox="0 0 24 24"><title>Eliminar</title><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg>';

      fila.appendChild(celdaNombre);
      fila.appendChild(celdaDescripcion);
      fila.appendChild(celdaEstado);
      fila.appendChild(celdaAcciones);
      tabla.appendChild(fila);
    });
  }

  // Actualiza las tarjetas de resumen
  function mostrarResumen() {
    // Las especialidades nuevas usan Date.now() como id,
    // así que las creadas este mes tienen un id mayor al inicio del mes
    const hoy = new Date();
    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).getTime();

    const nuevas = especialidades.filter(function (e) {
      return e.id >= inicioDelMes;
    });

    const nombresNuevas = nuevas.map(function (e) {
      return e.name;
    });

    document.getElementById("total-especialidades").textContent = especialidades.length;
    document.getElementById("total-extra").textContent = "↗ +" + nuevas.length + " este mes";

    // padStart agrega un cero adelante: 3 -> "03"
    document.getElementById("nuevas-cantidad").textContent = String(nuevas.length).padStart(2, "0");
    if (nuevas.length > 0) {
      document.getElementById("nuevas-nombres").textContent = nombresNuevas.join(", ");
    } else {
      document.getElementById("nuevas-nombres").textContent = "Sin altas este mes";
    }
  }

  // Búsqueda por nombre mientras se escribe
  buscador.addEventListener("input", function () {
    const texto = buscador.value.toLowerCase().trim();

    const filtradas = especialidades.filter(function (e) {
      return e.name.toLowerCase().includes(texto);
    });

    mostrarEspecialidades(filtradas);
  });

  // Si venimos del formulario con ?guardado=1 mostramos el mensaje de éxito
  if (window.location.search.includes("guardado=1")) {
    mensajeExito.classList.remove("hidden");
  }

  // Menú lateral en celulares
  const botonMenu = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  botonMenu.addEventListener("click", function () {
    const abierto = sidebar.classList.toggle("open");
    botonMenu.setAttribute("aria-expanded", abierto);
  });

  mostrarEspecialidades(especialidades);
  mostrarResumen();
});
