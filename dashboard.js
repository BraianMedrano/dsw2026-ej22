// Claves asignadas para el LocalStorage
const STORAGE_SPECIALTIES_KEY = "medportal_specialties";
const STORAGE_DOCTORS_KEY = "medportal_doctors";

// Conjuntos iniciales por defecto (si LocalStorage no contiene registros aún)
const defaultSpecialties = [
  "Cardiología",
  "Neurología",
  "Pediatría",
  "Dermatología",
  "Traumatología"
];

const defaultDoctors = [
  { id: 1, name: "Dr. James Wilson", specialty: "Cardiología", status: "Activo", initials: "JW", license: "MN-45210" },
  { id: 2, name: "Dr. Elena Rodriguez", specialty: "Neurología", status: "Activo", initials: "ER", license: "MN-89231" },
  { id: 3, name: "Dr. Robert Chen", specialty: "Pediatría", status: "De Licencia", initials: "RC", license: "MN-12093" },
  { id: 4, name: "Dra. Sofía Albarracín", specialty: "Dermatología", status: "Activo", initials: "SA", license: "MN-65239" },
  { id: 5, name: "Dr. Carlos Méndez", specialty: "Traumatología", status: "Activo", initials: "CM", license: "MN-78120" }
];

// Métodos de acceso y persistencia con LocalStorage
function getStoredSpecialties() {
  const data = localStorage.getItem(STORAGE_SPECIALTIES_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_SPECIALTIES_KEY, JSON.stringify(defaultSpecialties));
    return defaultSpecialties;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultSpecialties;
  }
}

function saveSpecialtyToStorage(newSpecialty) {
  const specs = getStoredSpecialties();
  if (!specs.includes(newSpecialty)) {
    specs.push(newSpecialty);
    localStorage.setItem(STORAGE_SPECIALTIES_KEY, JSON.stringify(specs));
  }
}

function getStoredDoctors() {
  const data = localStorage.getItem(STORAGE_DOCTORS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_DOCTORS_KEY, JSON.stringify(defaultDoctors));
    return defaultDoctors;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultDoctors;
  }
}

function saveDoctorsToStorage(doctors) {
  localStorage.setItem(STORAGE_DOCTORS_KEY, JSON.stringify(doctors));
}

// Variables de estado
let doctorsData = getStoredDoctors();
let currentPage = 1;
const itemsPerPage = 3;
let currentSearchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("doctors-table-body");
  const searchInput = document.getElementById("doctor-search");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const liveAnnouncer = document.getElementById("live-announcer");
  const paginationInfo = document.getElementById("pagination-info");
  const paginationControls = document.getElementById("pagination-controls");
  const modalContainer = document.getElementById("modal-container");
  const toastNotification = document.getElementById("toast-notification");
  
  const kpiDoctors = document.getElementById("kpi-doctors");
  const kpiSpecialties = document.getElementById("kpi-specialties");

  // Mostrar mensaje flotante tipo Toast
  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.remove("hidden");
    if (liveAnnouncer) liveAnnouncer.textContent = message;

    setTimeout(() => {
      toastNotification.classList.add("hidden");
    }, 3200);
  }

  // Sincronizar valores de las tarjetas KPI desde el estado y LocalStorage
  function updateKPIs() {
    if (kpiDoctors) {
      kpiDoctors.textContent = String(doctorsData.length);
    }
    if (kpiSpecialties) {
      const storedSpecs = getStoredSpecialties();
      kpiSpecialties.textContent = String(storedSpecs.length);
    }
  }

  // Creador nativo de iconos vectoriales SVG con DOM Namespace
  function createSvgIcon(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "action-svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("aria-hidden", "true");

    if (type === "eye") {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z");
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", "12");
      c.setAttribute("cy", "12");
      c.setAttribute("r", "3");
      svg.appendChild(p);
      svg.appendChild(c);
    } else if (type === "trash") {
      const p1 = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      p1.setAttribute("points", "3 6 5 6 21 6");
      const p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p2.setAttribute("d", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2");
      svg.appendChild(p1);
      svg.appendChild(p2);
    }

    return svg;
  }

  // Renderizado dinámico de la tabla utilizando métodos nativos de DOM
  function renderTable() {
    if (!tableBody) return;

    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

    const filtered = doctorsData.filter(d => 
      d.name.toLowerCase().includes(currentSearchTerm) || 
      d.specialty.toLowerCase().includes(currentSearchTerm)
    );

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage);

    if (paginatedItems.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No se encontraron profesionales médicos.";
      td.style.textAlign = "center";
      td.style.padding = "2rem";
      td.style.color = "#64748b";
      tr.appendChild(td);
      tableBody.appendChild(tr);
    } else {
      paginatedItems.forEach(doc => {
        const tr = document.createElement("tr");

        // Columna Doctor (Avatar + Nombre)
        const tdDoc = document.createElement("td");
        const wrapper = document.createElement("div");
        wrapper.classList.add("doctor-cell");

        const avatar = document.createElement("div");
        avatar.classList.add("doctor-avatar");
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = doc.initials;

        const nameSpan = document.createElement("span");
        nameSpan.classList.add("doctor-name-text");
        nameSpan.textContent = doc.name;

        wrapper.appendChild(avatar);
        wrapper.appendChild(nameSpan);
        tdDoc.appendChild(wrapper);

        // Columna Especialidad
        const tdSpec = document.createElement("td");
        tdSpec.textContent = doc.specialty;

        // Columna Estado
        const tdStatus = document.createElement("td");
        const badge = document.createElement("span");
        badge.classList.add("status-badge");
        const isLeave = doc.status.toLowerCase().includes("licencia");
        badge.classList.add(isLeave ? "leave" : "active");

        const dot = document.createElement("span");
        dot.classList.add("status-dot");
        dot.setAttribute("aria-hidden", "true");

        badge.appendChild(dot);
        badge.appendChild(document.createTextNode(doc.status));
        tdStatus.appendChild(badge);

        // Columna Acciones
        const tdActions = document.createElement("td");
        tdActions.classList.add("text-right");
        const actWrapper = document.createElement("div");
        actWrapper.classList.add("action-buttons");

        // Botón Ver Ficha
        const btnView = document.createElement("button");
        btnView.type = "button";
        btnView.classList.add("btn-icon-action");
        btnView.setAttribute("aria-label", `Ver detalles de ${doc.name}`);
        btnView.appendChild(createSvgIcon("eye"));
        btnView.addEventListener("click", () => openDetailModal(doc));

        // Botón Eliminar / Dar de Baja
        const btnDelete = document.createElement("button");
        btnDelete.type = "button";
        btnDelete.classList.add("btn-icon-action", "btn-delete");
        btnDelete.setAttribute("aria-label", `Dar de baja a ${doc.name}`);
        btnDelete.appendChild(createSvgIcon("trash"));
        btnDelete.addEventListener("click", () => openDeleteModal(doc));

        actWrapper.appendChild(btnView);
        actWrapper.appendChild(btnDelete);
        tdActions.appendChild(actWrapper);

        tr.appendChild(tdDoc);
        tr.appendChild(tdSpec);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);

        tableBody.appendChild(tr);
      });
    }

    renderPagination(totalItems, totalPages);
  }

  // Paginador generado con DOM nativo
  function renderPagination(totalItems, totalPages) {
    if (!paginationInfo || !paginationControls) return;

    const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    paginationInfo.textContent = `Mostrando ${start} a ${end} de ${totalItems} resultados`;

    while (paginationControls.firstChild) {
      paginationControls.removeChild(paginationControls.firstChild);
    }

    // Botón Anterior
    const btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.classList.add("btn-page");
    btnPrev.textContent = "<";
    btnPrev.setAttribute("aria-label", "Página anterior");
    btnPrev.disabled = currentPage === 1;
    btnPrev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    paginationControls.appendChild(btnPrev);

    // Botones con Números de Página
    for (let i = 1; i <= totalPages; i++) {
      const btnNum = document.createElement("button");
      btnNum.type = "button";
      btnNum.classList.add("btn-page");
      if (i === currentPage) {
        btnNum.classList.add("active");
        btnNum.setAttribute("aria-current", "page");
      }
      btnNum.textContent = String(i);
      btnNum.addEventListener("click", () => {
        currentPage = i;
        renderTable();
      });
      paginationControls.appendChild(btnNum);
    }

    // Botón Siguiente
    const btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.classList.add("btn-page");
    btnNext.textContent = ">";
    btnNext.setAttribute("aria-label", "Página siguiente");
    btnNext.disabled = currentPage === totalPages || totalPages === 0;
    btnNext.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
    paginationControls.appendChild(btnNext);
  }

  // Cerrar cualquier modal abierto
  function closeModal() {
    if (!modalContainer) return;
    while (modalContainer.firstChild) {
      modalContainer.removeChild(modalContainer.firstChild);
    }
    modalContainer.classList.add("hidden");
    modalContainer.setAttribute("aria-hidden", "true");
  }

  // Modal: Agregar Doctor
  function openAddDoctorModal() {
    if (!modalContainer) return;
    closeModal();

    const card = document.createElement("div");
    card.classList.add("modal-card");

    // Header del modal
    const header = document.createElement("div");
    header.classList.add("modal-header");
    const title = document.createElement("h3");
    title.textContent = "Registrar Nuevo Doctor";
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.classList.add("btn-close-modal");
    btnClose.setAttribute("aria-label", "Cerrar ventana");
    btnClose.textContent = "×";
    btnClose.addEventListener("click", closeModal);
    header.appendChild(title);
    header.appendChild(btnClose);

    // Formulario
    const form = document.createElement("form");
    form.classList.add("modal-body");

    // Campo: Nombre Completo
    const groupName = document.createElement("div");
    groupName.classList.add("form-group");
    const labelName = document.createElement("label");
    labelName.setAttribute("for", "input-doc-name");
    labelName.textContent = "Nombre Completo (ej: Dr. Juan Pérez):";
    const inputName = document.createElement("input");
    inputName.type = "text";
    inputName.id = "input-doc-name";
    inputName.required = true;
    inputName.classList.add("form-control");
    groupName.appendChild(labelName);
    groupName.appendChild(inputName);

    // Campo: Especialidad (Alimentado desde LocalStorage)
    const groupSpec = document.createElement("div");
    groupSpec.classList.add("form-group");
    const labelSpec = document.createElement("label");
    labelSpec.setAttribute("for", "input-doc-spec");
    labelSpec.textContent = "Especialidad Médica:";
    const selectSpec = document.createElement("select");
    selectSpec.id = "input-doc-spec";
    selectSpec.classList.add("form-control");

    const availableSpecs = getStoredSpecialties();
    availableSpecs.forEach(sp => {
      const opt = document.createElement("option");
      opt.value = sp;
      opt.textContent = sp;
      selectSpec.appendChild(opt);
    });
    groupSpec.appendChild(labelSpec);
    groupSpec.appendChild(selectSpec);

    // Campo: Número de Licencia
    const groupLicense = document.createElement("div");
    groupLicense.classList.add("form-group");
    const labelLicense = document.createElement("label");
    labelLicense.setAttribute("for", "input-doc-lic");
    labelLicense.textContent = "Número de Licencia / Matrícula:";
    const inputLicense = document.createElement("input");
    inputLicense.type = "text";
    inputLicense.id = "input-doc-lic";
    inputLicense.placeholder = "MN-12345";
    inputLicense.required = true;
    inputLicense.classList.add("form-control");
    groupLicense.appendChild(labelLicense);
    groupLicense.appendChild(inputLicense);

    form.appendChild(groupName);
    form.appendChild(groupSpec);
    form.appendChild(groupLicense);

    // Botones del pie del modal
    const footer = document.createElement("div");
    footer.classList.add("modal-footer");

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.classList.add("btn", "btn-outline");
    btnCancel.textContent = "Cancelar";
    btnCancel.addEventListener("click", closeModal);

    const btnSubmit = document.createElement("button");
    btnSubmit.type = "submit";
    btnSubmit.classList.add("btn", "btn-primary");
    btnSubmit.textContent = "Guardar Doctor";

    footer.appendChild(btnCancel);
    footer.appendChild(btnSubmit);

    // Envío del formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = inputName.value.trim();
      const specVal = selectSpec.value;
      const licVal = inputLicense.value.trim();

      if (!nameVal || !licVal) return;

      const initials = nameVal.replace(/^(Dr\.|Dra\.)\s*/i, "").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "MD";

      const newDoc = {
        id: Date.now(),
        name: nameVal,
        specialty: specVal,
        status: "Activo",
        initials: initials,
        license: licVal
      };

      doctorsData.unshift(newDoc);
      saveDoctorsToStorage(doctorsData);
      updateKPIs();
      currentPage = 1;
      renderTable();
      closeModal();
      showToast(`Doctor "${nameVal}" registrado exitosamente.`);
    });

    card.appendChild(header);
    card.appendChild(form);
    form.appendChild(footer);

    modalContainer.appendChild(card);
    modalContainer.classList.remove("hidden");
    modalContainer.setAttribute("aria-hidden", "false");
    inputName.focus();
  }

  // Modal: Ficha Detallada
  function openDetailModal(doc) {
    if (!modalContainer) return;
    closeModal();

    const card = document.createElement("div");
    card.classList.add("modal-card");

    const header = document.createElement("div");
    header.classList.add("modal-header");
    const title = document.createElement("h3");
    title.textContent = "Ficha del Profesional";
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.classList.add("btn-close-modal");
    btnClose.textContent = "×";
    btnClose.addEventListener("click", closeModal);
    header.appendChild(title);
    header.appendChild(btnClose);

    const body = document.createElement("div");
    body.classList.add("modal-body");

    const createDetailLine = (label, val) => {
      const p = document.createElement("p");
      p.style.marginBottom = "0.5rem";
      const strong = document.createElement("strong");
      strong.textContent = label + ": ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(val));
      return p;
    };

    body.appendChild(createDetailLine("Nombre", doc.name));
    body.appendChild(createDetailLine("Especialidad", doc.specialty));
    body.appendChild(createDetailLine("Licencia Médica", doc.license || "No registrada"));
    body.appendChild(createDetailLine("Estado Actual", doc.status));

    const footer = document.createElement("div");
    footer.classList.add("modal-footer");
    const btnOk = document.createElement("button");
    btnOk.type = "button";
    btnOk.classList.add("btn", "btn-primary");
    btnOk.textContent = "Cerrar Ficha";
    btnOk.addEventListener("click", closeModal);
    footer.appendChild(btnOk);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    modalContainer.appendChild(card);
    modalContainer.classList.remove("hidden");
    modalContainer.setAttribute("aria-hidden", "false");
  }

  // Modal: Confirmación de Baja
  function openDeleteModal(doc) {
    if (!modalContainer) return;
    closeModal();

    const card = document.createElement("div");
    card.classList.add("modal-card");

    const header = document.createElement("div");
    header.classList.add("modal-header");
    const title = document.createElement("h3");
    title.textContent = "Confirmar Baja";
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.classList.add("btn-close-modal");
    btnClose.textContent = "×";
    btnClose.addEventListener("click", closeModal);
    header.appendChild(title);
    header.appendChild(btnClose);

    const body = document.createElement("div");
    body.classList.add("modal-body");
    const text = document.createElement("p");
    text.textContent = `¿Está seguro de que desea remover del directorio a ${doc.name}?`;
    body.appendChild(text);

    const footer = document.createElement("div");
    footer.classList.add("modal-footer");

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.classList.add("btn", "btn-outline");
    btnCancel.textContent = "Cancelar";
    btnCancel.addEventListener("click", closeModal);

    const btnConfirm = document.createElement("button");
    btnConfirm.type = "button";
    btnConfirm.classList.add("btn", "btn-primary");
    btnConfirm.style.backgroundColor = "#dc2626";
    btnConfirm.textContent = "Sí, eliminar";
    btnConfirm.addEventListener("click", () => {
      doctorsData = doctorsData.filter(d => d.id !== doc.id);
      saveDoctorsToStorage(doctorsData);
      updateKPIs();
      renderTable();
      closeModal();
      showToast(`El profesional ${doc.name} fue removido.`);
    });

    footer.appendChild(btnCancel);
    footer.appendChild(btnConfirm);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    modalContainer.appendChild(card);
    modalContainer.classList.remove("hidden");
    modalContainer.setAttribute("aria-hidden", "false");
  }

  // Modal: Agregar Nueva Especialidad (Guarda directamente en LocalStorage)
  function openAddSpecialtyModal() {
    if (!modalContainer) return;
    closeModal();

    const card = document.createElement("div");
    card.classList.add("modal-card");

    const header = document.createElement("div");
    header.classList.add("modal-header");
    const title = document.createElement("h3");
    title.textContent = "Agregar Nueva Especialidad";
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.classList.add("btn-close-modal");
    btnClose.textContent = "×";
    btnClose.addEventListener("click", closeModal);
    header.appendChild(title);
    header.appendChild(btnClose);

    const form = document.createElement("form");
    form.classList.add("modal-body");

    const group = document.createElement("div");
    group.classList.add("form-group");
    const label = document.createElement("label");
    label.setAttribute("for", "input-new-spec");
    label.textContent = "Nombre de la Especialidad:";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "input-new-spec";
    input.required = true;
    input.placeholder = "Ej: Oftalmología";
    input.classList.add("form-control");
    group.appendChild(label);
    group.appendChild(input);
    form.appendChild(group);

    const footer = document.createElement("div");
    footer.classList.add("modal-footer");

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.classList.add("btn", "btn-outline");
    btnCancel.textContent = "Cancelar";
    btnCancel.addEventListener("click", closeModal);

    const btnSubmit = document.createElement("button");
    btnSubmit.type = "submit";
    btnSubmit.classList.add("btn", "btn-primary");
    btnSubmit.textContent = "Guardar en LocalStorage";

    footer.appendChild(btnCancel);
    footer.appendChild(btnSubmit);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;

      saveSpecialtyToStorage(val);
      updateKPIs();
      closeModal();
      showToast(`Especialidad "${val}" guardada en LocalStorage.`);
    });

    card.appendChild(header);
    card.appendChild(form);
    form.appendChild(footer);

    modalContainer.appendChild(card);
    modalContainer.classList.remove("hidden");
    modalContainer.setAttribute("aria-hidden", "false");
    input.focus();
  }

  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      currentPage = 1;
      renderTable();
    });
  }

  // Toggle Menú lateral en Mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    });
  }

  // Botones de acción del encabezado
  const btnAddDoc = document.getElementById("btn-add-doctor");
  if (btnAddDoc) btnAddDoc.addEventListener("click", openAddDoctorModal);

  const btnAddSpec = document.getElementById("btn-add-specialty");
  if (btnAddSpec) btnAddSpec.addEventListener("click", openAddSpecialtyModal);

  // Enlaces de navegación con feedback accesible
  ["nav-doctors", "nav-specialties", "nav-search", "nav-settings"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(`Sección "${el.textContent.trim()}" en desarrollo.`);
      });
    }
  });

  // Cerrar modales con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalContainer && !modalContainer.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Inicialización de la vista
  updateKPIs();
  renderTable();
});