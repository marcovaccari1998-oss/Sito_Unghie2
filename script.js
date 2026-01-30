fetch("treatments.json")
  .then(res => res.json())
  .then(data => {
    buildFilters(data.categories);
    buildTreatments(data.categories);
    filterCategories("all");
  });

function buildFilters(categories) {
  const filters = document.getElementById("filters");
  filters.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.innerHTML = "<span>Tutti</span>";
  allBtn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    allBtn.classList.add("active");
    filterCategories("all");
  };
  filters.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.innerHTML = `
      <span>${cat.label}</span>
      ${cat.icon ? `<img src="${cat.icon}" alt="">` : ""}
    `;
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterCategories(cat.id);
    };
    filters.appendChild(btn);
  });
}

function buildTreatments(categories) {
  const container = document.getElementById("treatments");
  container.innerHTML = "";

  categories.forEach(cat => {
    cat.sections.forEach(section => {
      const card = document.createElement("section");
      card.className = "category";
      card.dataset.category = cat.id;

      const header = document.createElement("button");
      header.className = "category-header";
      header.innerHTML = `
        <div class="left">
          <span>${section.title}</span>
          ${section.fromPrice ? `<span class="section-price">(da ${section.fromPrice}€)</span>` : ""}
        </div>
        <span class="toggle">+</span>
      `;

      header.onclick = () => {
        document.querySelectorAll(".category.open").forEach(open => {
          if (open !== card) open.classList.remove("open");
        });
        card.classList.toggle("open");
      };

      const content = document.createElement("div");
      content.className = "category-content";

      section.treatments.forEach(t => {
        const div = document.createElement("div");
        div.className = "treatment";
        div.onclick = () => openTreatmentModal(t);

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

      card.appendChild(header);
      card.appendChild(content);
      container.appendChild(card);
    });
  });
}

function filterCategories(id) {
  document.querySelectorAll(".category").forEach(cat => {
    cat.classList.remove("open");
    cat.style.display = id === "all" || cat.dataset.category === id ? "block" : "none";
  });
}

/* MODAL */
const modal = document.getElementById("treatmentModal");
const closeModal = document.getElementById("closeModal");

function openTreatmentModal(t) {
  document.getElementById("modalTitle").textContent = t.name;
  document.getElementById("modalMeta").textContent = `${t.price}€ · ${t.duration}`;
  document.getElementById("modalDescription").textContent = t.description;
  document.getElementById("modalImage").src = t.image;
  modal.classList.add("open");
}

closeModal.onclick = () => modal.classList.remove("open");
modal.onclick = e => {
  if (e.target === modal) modal.classList.remove("open");
};