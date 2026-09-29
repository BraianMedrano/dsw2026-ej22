document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-especialidad");
  const inputNombre = document.getElementById("nombre");
  const inputDescripcion = document.getElementById("descripcion");
  const selectEstado = document.getElementById("estado");
  const errorNombre = document.getElementById("error-nombre");
  const errorDescripcion = document.getElementById("error-descripcion");

  form.addEventListener("submit", function (event) {
    // Evita que el formulario recargue la página
    event.preventDefault();

    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    let esValido = true;

    // Limpiamos los errores anteriores
    errorNombre.textContent = "";
    errorDescripcion.textContent = "";
    inputNombre.classList.remove("input-error");
    inputDescripcion.classList.remove("input-error");

    // Validaciones pedidas en el TPI
    if (nombre === "") {
      errorNombre.textContent = "El nombre es obligatorio.";
      esValido = false;
    } else if (nombre.length < 3 || nombre.length > 100) {
      errorNombre.textContent = "El nombre debe tener entre 3 y 100 caracteres.";
      esValido = false;
    }

    if (descripcion === "") {
      errorDescripcion.textContent = "La descripción es obligatoria.";
      esValido = false;
    } else if (descripcion.length < 10 || descripcion.length > 100) {
      errorDescripcion.textContent = "La descripción debe tener entre 10 y 100 caracteres.";
      esValido = false;
    }

    if (errorNombre.textContent !== "") {
      inputNombre.classList.add("input-error");
    }
    if (errorDescripcion.textContent !== "") {
      inputDescripcion.classList.add("input-error");
    }

    if (!esValido) {
      return;
    }

    // Agregamos la nueva especialidad al array y lo guardamos
    const especialidades = obtenerEspecialidades();
    especialidades.push({
      id: Date.now(),
      name: nombre,
      description: descripcion,
      status: selectEstado.value
    });
    guardarEspecialidades(especialidades);

    // Volvemos al listado mostrando el mensaje de guardado exitoso
    window.location.href = "especialidades.html?guardado=1";
  });

  // Menú lateral en celulares
  const botonMenu = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  botonMenu.addEventListener("click", function () {
    const abierto = sidebar.classList.toggle("open");
    botonMenu.setAttribute("aria-expanded", abierto);
  });
});
