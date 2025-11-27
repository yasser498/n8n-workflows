document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const complexityFilter = document.getElementById("complexityFilter");
  const resetBtn = document.getElementById("resetBtn");
  const emptyResetBtn = document.getElementById("emptyResetBtn");
  const workflowsContainer = document.getElementById("workflowsContainer");
  const emptyState = document.getElementById("emptyState");
  const resultCount = document.getElementById("resultCount");
  const totalWorkflows = document.getElementById("totalWorkflows");
  const totalCategories = document.getElementById("totalCategories");
  const totalTriggers = document.getElementById("totalTriggers");

  let allWorkflows = [];

  fetch("data/workflows.json")
    .then((res) => res.json())
    .then((data) => {
      allWorkflows = data;
      initFilters(allWorkflows);
      updateStats(allWorkflows);
      renderWorkflows(allWorkflows);
    })
    .catch((err) => {
      console.error("خطأ في قراءة البيانات:", err);
      workflowsContainer.innerHTML =
        '<div class="col-12"><div class="alert alert-danger">حدث خطأ أثناء تحميل البيانات. تأكد من وجود الملف data/workflows.json.</div></div>';
    });

  function initFilters(data) {
    const categories = Array.from(new Set(data.map((w) => w.category).filter(Boolean)));
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  function updateStats(data) {
    totalWorkflows.textContent = data.length;
    const catSet = new Set(data.map((w) => w.category).filter(Boolean));
    totalCategories.textContent = catSet.size;

    const triggerSet = new Set(data.map((w) => w.trigger).filter(Boolean));
    totalTriggers.textContent = triggerSet.size;
  }

  function applyFilters() {
    const searchTerm = (searchInput.value || "").toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedComplexity = complexityFilter.value;

    let filtered = [...allWorkflows];

    if (searchTerm) {
      filtered = filtered.filter((w) => {
        const text = (
          (w.title || "") +
          " " +
          (w.description || "") +
          " " +
          (w.tags || []).join(" ")
        ).toLowerCase();
        return text.includes(searchTerm);
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }

    if (selectedComplexity) {
      filtered = filtered.filter((w) => w.complexity === selectedComplexity);
    }

    renderWorkflows(filtered);
  }

  function renderWorkflows(list) {
    workflowsContainer.innerHTML = "";
    resultCount.textContent = list.length + " مسار";

    if (!list.length) {
      emptyState.classList.remove("d-none");
      return;
    }

    emptyState.classList.add("d-none");

    list.forEach((w) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";

      const card = document.createElement("div");
      card.className = "card workflow-card h-100";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body d-flex flex-column";

      const headerRow = document.createElement("div");
      headerRow.className = "d-flex justify-content-between align-items-start mb-2";

      const title = document.createElement("h5");
      title.className = "card-title fw-bold";
      title.textContent = w.title;

      const complexity = document.createElement("span");
      complexity.className = "workflow-badge bg-light text-dark border";
      complexity.textContent = complexityLabel(w.complexity);

      headerRow.appendChild(title);
      headerRow.appendChild(complexity);

      const cat = document.createElement("div");
      cat.className = "mb-1 small text-primary fw-semibold";
      cat.textContent = w.category || "غير مصنف";

      const desc = document.createElement("p");
      desc.className = "card-description mb-2";
      desc.textContent = w.description || "";

      const trigger = document.createElement("div");
      trigger.className = "trigger-label mb-2";
      trigger.textContent = "Trigger: " + (w.trigger || "غير محدد");

      const tagsContainer = document.createElement("div");
      tagsContainer.className = "mb-2";
      (w.tags || []).forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tag-pill";
        tag.textContent = "#" + t;
        tagsContainer.appendChild(tag);
      });

      const footerRow = document.createElement("div");
      footerRow.className = "mt-auto d-flex justify-content-between align-items-center pt-2 border-top";

      const idSpan = document.createElement("span");
      idSpan.className = "small text-muted";
      idSpan.textContent = "ID: " + w.id;

      footerRow.appendChild(idSpan);

      if (w.link) {
        const linkBtn = document.createElement("a");
        linkBtn.href = w.link;
        linkBtn.target = "_blank";
        linkBtn.rel = "noopener";
        linkBtn.className = "btn btn-sm btn-outline-primary";
        linkBtn.textContent = "عرض التفاصيل";
        footerRow.appendChild(linkBtn);
      }

      cardBody.appendChild(headerRow);
      cardBody.appendChild(cat);
      cardBody.appendChild(desc);
      cardBody.appendChild(trigger);
      cardBody.appendChild(tagsContainer);
      cardBody.appendChild(footerRow);

      card.appendChild(cardBody);
      col.appendChild(card);
      workflowsContainer.appendChild(col);
    });
  }

  function complexityLabel(level) {
    switch (level) {
      case "Low":
        return "منخفض";
      case "Medium":
        return "متوسط";
      case "High":
        return "مرتفع";
      default:
        return "غير محدد";
    }
  }

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  complexityFilter.addEventListener("change", applyFilters);
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    complexityFilter.value = "";
    applyFilters();
  });
  emptyResetBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    complexityFilter.value = "";
    applyFilters();
  });
});
