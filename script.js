/* ---------------- FETCH E INIZIALIZZAZIONE ---------------- */
fetch("treatments.json")
  .then(res => res.json())
  .then(data => {
    initFilters(data.categories);
    initTreatments(data.categories);
    filterCategories("all");
  });

/* ---------------- FILTRI ---------------- */
function initFilters(categories) {
  const filtersContainer = document.getElementById("filters");
  filtersContainer.innerHTML = "";

  filtersContainer.appendChild(createFilterButton("Tutti", "all", true));

  categories.forEach(cat => {
    filtersContainer.appendChild(createFilterButton(cat.label, cat.id));
  });
}

function createFilterButton(label, id, isActive = false) {
  const btn = document.createElement("button");
  btn.className = "filter-btn";
  if (isActive) btn.classList.add("active");

  btn.innerHTML = `<span>${label}</span>`;
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterCategories(id);
    trackUmamiEvent("Filtro cliccato", { filtro: label });
  });

  return btn;
}

/* ---------------- TRATTAMENTI ---------------- */
function initTreatments(categories) {
  const container = document.getElementById("treatments");
  container.innerHTML = "";

  categories.forEach(cat => {
    cat.sections.forEach(section => {
      const categorySection = createCategorySection(cat, section);
      container.appendChild(categorySection);
    });
  });
}

function createCategorySection(cat, section) {
  const card = document.createElement("section");
  card.className = "category";
  card.dataset.category = cat.id;

  card.appendChild(createCategoryHeader(section, card));
  card.appendChild(createCategoryContent(cat, section));

  return card;
}

function createCategoryHeader(section, card) {
  const header = document.createElement("button");
  header.className = "category-header";
  header.innerHTML = `
    <div class="left">
      <span>${section.title}</span>
      ${section.fromPrice ? `<span class="section-price">(da ${section.fromPrice}€)</span>` : ""}
    </div>
    <span class="toggle">+</span>
  `;

  header.addEventListener("click", () => {
    const wasOpen = card.classList.contains("open");
    document.querySelectorAll(".category.open").forEach(open => {
      if (open !== card) open.classList.remove("open");
    });
    card.classList.toggle("open");

    trackUmamiEvent("Categoria toggle", {
      sezione: section.title,
      aperta: !wasOpen
    });
  });

  return header;
}

function createCategoryContent(cat, section) {
  const content = document.createElement("div");
  content.className = "category-content";

  section.treatments.forEach(t => {
    const div = document.createElement("div");
    div.className = "treatment";
    div.addEventListener("click", () => openTreatmentModal(t, cat.label, section.title));

    div.innerHTML = `
      <div class="treatment-header">
        <span class="treatment-name">
          ${t.name}
          <span class="open-icon">›</span>
        </span>
        <span class="price">${t.price}€</span>
      </div>
    `;

    content.appendChild(div);
  });

  if (section.notes) {
    const notesWrap = document.createElement("div");
    notesWrap.className = "section-note";
    Object.entries(section.notes).forEach(([key, text]) => {
      const p = document.createElement("div");
      p.textContent = `${key} ${text}`;
      notesWrap.appendChild(p);
    });
    content.appendChild(notesWrap);
  }

  return content;
}

/* ---------------- FILTRI ---------------- */
function filterCategories(id) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("open");
    cat.style.display = id === "all" || cat.dataset.category === id ? "block" : "none";
  });
}

/* ---------------- MODAL TRATTAMENTO ---------------- */
const modal = document.getElementById("treatmentModal");
const closeModal = document.getElementById("closeModal");
let modalOpenTime = null;

function openTreatmentModal(t, categoria, sezione) {
  document.getElementById("modalTitle").textContent = t.name;
  document.getElementById("modalMeta").textContent = `${t.price}€ · ${t.duration}`;
  document.getElementById("modalDescription").textContent = t.description;
  document.getElementById("modalImage").src = t.image;
  modal.classList.add("open");

  modalOpenTime = Date.now();

  trackUmamiEvent("Trattamento aperto", {
    nome: t.name,
    categoria: categoria,
    sezione: sezione,
    prezzo: t.price
  });
}

function closeTreatmentModal() {
  if (modalOpenTime) {
    const durationSec = Math.round((Date.now() - modalOpenTime) / 1000);
    const treatmentName = document.getElementById("modalTitle").textContent;

    trackUmamiEvent("Durata trattamento", {
      nome: treatmentName,
      durata_secondi: durationSec
    });

    modalOpenTime = null;
  }
  modal.classList.remove("open");
}

closeModal.addEventListener("click", closeTreatmentModal);
modal.addEventListener("click", e => {
  if (e.target === modal) closeTreatmentModal();
});

/* ---------------- TRACKING ---------------- */
function trackUmamiEvent(eventName, props) {
  if (window.umami && typeof umami.track === "function") {
    umami.track(eventName, props);
  } else {
    setTimeout(() => trackUmamiEvent(eventName, props), 50);
  }
}
