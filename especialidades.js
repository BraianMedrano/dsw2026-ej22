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
      celdaNombre.textContent = especialidad.name;
      celdaNombre.classList.add("fw-bold");

      const celdaDescripcion = document.createElement("td");
      celdaDescripcion.textContent = especialidad.description;

      const celdaEstado = document.createElement("td");
      const badge = document.createElement("span");
      badge.textContent = especialidad.status;
      badge.classList.add("badge");
      if (especialidad.status === "Activa") {
        badge.classList.add("badge-active");
      } else {
        badge.classList.add("badge-inactive");
      }
      celdaEstado.appendChild(badge);

      // Acciones solo visuales en esta etapa
      const celdaAcciones = document.createElement("td");
      celdaAcciones.classList.add("text-right");
      celdaAcciones.innerHTML = '<span class="icon-action" title="Editar">✎</span><span class="icon-action" title="Eliminar">🗑</span>';

      fila.appendChild(celdaNombre);
      fila.appendChild(celdaDescripcion);
      fila.appendChild(celdaEstado);
      fila.appendChild(celdaAcciones);
      tabla.appendChild(fila);
    });
  }

  // Actualiza las tarjetas de resumen
  function mostrarResumen() {
    const activas = especialidades.filter(function (e) {
      return e.status === "Activa";
    });

    document.getElementById("total-especialidades").textContent = especialidades.length;
    document.getElementById("total-activas").textContent = activas.length;
    document.getElementById("total-inactivas").textContent = especialidades.length - activas.length;
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
