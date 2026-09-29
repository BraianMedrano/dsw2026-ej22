// Clave compartida con el panel de administración
const STORAGE_KEY = "medportal_specialties";

// Datos de ejemplo para cuando el LocalStorage está vacío
const especialidadesIniciales = [
  { id: 1, name: "Cardiología", description: "Estudio y tratamiento de trastornos del corazón y del sistema circulatorio.", status: "Activa" },
  { id: 2, name: "Neurología", description: "Diagnóstico y tratamiento de enfermedades del sistema nervioso.", status: "Activa" },
  { id: 3, name: "Dermatología", description: "Atención integral de enfermedades de la piel, uñas y cabello.", status: "Inactiva" },
  { id: 4, name: "Pediatría", description: "Cuidado médico de lactantes, niños y adolescentes.", status: "Activa" }
];

// Devuelve el array de especialidades guardado
function obtenerEspecialidades() {
  const datos = localStorage.getItem(STORAGE_KEY);

  if (!datos) {
    guardarEspecialidades(especialidadesIniciales);
    return especialidadesIniciales;
  }

  const lista = JSON.parse(datos);

  // El panel puede haber guardado solo nombres (texto), los convertimos a objetos
  return lista.map(function (item, indice) {
    if (typeof item === "string") {
      return { id: indice + 1, name: item, description: "Sin descripción.", status: "Activa" };
    }
    return item;
  });
}

// Guarda el array completo en el LocalStorage
function guardarEspecialidades(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}
