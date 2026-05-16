const API = "/api/inventory";
let inventory = [];

// Category 
const CATEGORY_LABEL = { Book: "Books", Magazine: "Magazines", Stationery: "Stationery" };

const LOW_STOCK_THRESHOLDS = {
  Book:       10,
  Magazine:   10,
  Stationery: 30,
};

function isLowStock(item) {
  const threshold = LOW_STOCK_THRESHOLDS[item.category] ?? 10;
  return item.quantity <= threshold;
}
// UI REFERENCES
const tableBody = document.querySelector(".table-body");
const dateLine     = document.getElementById("dateLine");
const timeLine     = document.getElementById("timeLine");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle   = document.getElementById("modalTitle");
const filterSelect = document.querySelector(".filter");
const searchInput  = document.querySelector(".search input");

// SIDEBAR TOGGLES
function toggleSidebar() {
  const app = document.getElementById("app");
  if (app) app.classList.toggle("collapsed");
}

// LIVE CLOCK
function updateClock() {
  const now = new Date();
  if (dateLine) {
    const date    = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
    dateLine.textContent = `${date} | ${weekday}`;
  }
  if (timeLine) {
    timeLine.textContent = now
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase()
      .replace(" ", "");
  }
}

// LOAD INVENTORY FROM API
async function loadInventory() {
  try {
    const res = await fetch(API);

    // Guard: check HTTP status before parsing
    if (!res.ok) {
      console.error(`Server error: ${res.status} ${res.statusText}`);
      inventory = [];   // keep inventory a valid array
      renderTable();
      return;
    }

    const data = await res.json();

    // Guard: ensure the response is actually an array
    inventory = Array.isArray(data) ? data : [];

    renderTable();
  } catch (err) {
    console.error("Failed to load inventory:", err);
    inventory = [];   // prevent inventory from being undefined/non-array
    renderTable();
  }
}

// TABLE
function renderTable() {
  if (!tableBody) return;

    tableBody.innerHTML = "";
  
  const filterVal = filterSelect ? filterSelect.value : "All";
  const searchVal = searchInput  ? searchInput.value.toLowerCase().trim() : "";

  const filtered = inventory.filter(item => {
    const matchesFilter =
      filterVal === "All" ||
      CATEGORY_LABEL[item.category] === filterVal ||
      item.category === filterVal;
    const matchesSearch =
      !searchVal || item.name.toLowerCase().includes(searchVal);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "table-row";
    empty.innerHTML = `<div class="muted" style="grid-column:1/-1;text-align:center;padding:12px 0;">No products found.</div>`;
    tableBody.appendChild(empty);
  } else {
    filtered.forEach(item => {
      const globalIdx = inventory.indexOf(item);
      const low       = isLowStock(item);
      const row       = document.createElement("div");
      row.className   = low ? "table-row low-stock-row" : "table-row";
      row.innerHTML   = `
        <div>${item.name}</div>
        <div>&#8369;${parseFloat(item.price).toFixed(2)}</div>
        <div class="${low ? "low-stock-qty" : ""}">
          ${item.quantity}${low ? " &#9888;" : ""}
        </div>
        <div><button class="pill view-btn" data-idx="${globalIdx}">View</button></div>
        <div>${CATEGORY_LABEL[item.category] || item.category}</div>
      `;
      tableBody.appendChild(row);
    });

    tableBody.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => openViewModal(inventory[parseInt(btn.dataset.idx)]));
    });
  }

  updateCategoryCounts();
}

//CATEGORY COUNT UPDATESS
function updateCategoryCounts() {
  const counts = { Books: 0, Magazines: 0, Stationery: 0 };
  inventory.forEach(item => {
    const label = CATEGORY_LABEL[item.category] || item.category;
    if (counts.hasOwnProperty(label)) counts[label] += item.quantity;
  });
  document.querySelectorAll(".card").forEach(card => {
    const labelEl = card.querySelector(".label");
    if (!labelEl) return;
    const label = labelEl.textContent.trim();
    if (counts[label] !== undefined) {
      card.querySelector(".count").textContent = counts[label];
    }
  });
}


//  MODAL UTILITIES
function getFreshConfirmBtn() {
  const old   = document.getElementById("modalConfirmBtn");
  const fresh = old.cloneNode(true);
  old.parentNode.replaceChild(fresh, old);
  return fresh;
}

function setModalBody(html) {
  const body = modalOverlay.querySelector(".modal-body");
  if (body) body.innerHTML = html;
}

function closeModal() {
  modalOverlay.style.display = "none";
}

//  SPECIFIC FIELDS
function toggleSpecificFields() {
  const type      = document.getElementById("pType")?.value;
  const container = document.getElementById("specificFields");
  if (!container || !type) return;
  container.innerHTML = "";

  if (type === "Book") {
    container.innerHTML = `
      <div class="input-row">
        <div class="input-group">
          <label>Author</label>
          <input type="text" id="pAuthor" placeholder="e.g. J.K. Rowling">
        </div>
        <div class="input-group">
          <label>ISBN</label>
          <input type="text" id="pISBN" placeholder="978-0-306-40615-7">
        </div>
      </div>
      <div class="input-group">
        <label>Genre</label>
        <input type="text" id="pGenre" placeholder="e.g. Fantasy">
      </div>`;
  } else if (type === "Magazine") {
    container.innerHTML = `
      <div class="input-row">
        <div class="input-group">
          <label>Issue Number</label>
          <input type="number" id="pIssue" placeholder="42">
        </div>
        <div class="input-group">
          <label>Publication Date</label>
          <input type="date" id="pPubDate">
        </div>
      </div>`;
  } else if (type === "Stationery") {
    container.innerHTML = `
      <div class="input-row">
        <div class="input-group">
          <label>Brand</label>
          <input type="text" id="pBrand" placeholder="e.g. Faber-Castell">
        </div>
        <div class="input-group">
          <label>Size</label>
          <input type="text" id="pSize" placeholder="e.g. A4 or 0.7mm">
        </div>
      </div>`;
  }
}

function readSpecificFields(type) {
  if (type === "Book") {
    return {
      author: document.getElementById("pAuthor")?.value.trim() || "",
      isbn:   document.getElementById("pISBN")?.value.trim()   || "",
      genre:  document.getElementById("pGenre")?.value.trim()  || "",
    };
  }
  if (type === "Magazine") {
    return {
      issue:  document.getElementById("pIssue")?.value   || null,
      pubDate: document.getElementById("pPubDate")?.value || null,
    };
  }
  if (type === "Stationery") {
    return {
      brand: document.getElementById("pBrand")?.value.trim() || "",
      size:  document.getElementById("pSize")?.value.trim()  || "",
    };
  }
  return {};
}


//  ADD PRODUCT
async function openAddModal() {
  modalTitle.textContent = "Add Product";
  setModalBody(`
    <div class="input-group">
      <label>Product Name</label>
      <input type="text" id="pName" placeholder="e.g. C# Programming">
    </div>
    <div class="input-row">
      <div class="input-group">
        <label>Price (PHP)</label>
        <input type="number" id="pPrice" step="0.01" placeholder="0.00" min="0">
      </div>
      <div class="input-group">
        <label>Quantity</label>
        <input type="number" id="pQty" placeholder="0" min="0">
      </div>
    </div>
    <div class="input-group">
      <label>Category Type</label>
      <select id="pType" onchange="toggleSpecificFields()">
        <option value="Book">Book</option>
        <option value="Magazine">Magazine</option>
        <option value="Stationery">Stationery</option>
      </select>
    </div>
    <div id="specificFields" class="specific-fields-area"></div>
  `);

  toggleSpecificFields();
  modalOverlay.style.display = "flex";

  // getFreshConfirmBtn() must be called AFTER setModalBody() AND display = "flex"
  const btn = getFreshConfirmBtn();
  btn.onclick = async () => {
    const name  = document.getElementById("pName")?.value.trim();
    const price = parseFloat(document.getElementById("pPrice")?.value) || 0;
    const qty   = parseInt(document.getElementById("pQty")?.value)     || 0;
    const type  = document.getElementById("pType")?.value;

    if (!name) { alert("Product Name is required!"); return; }

    const product = {
      name,
      price,
      quantity: qty,
      category: type,
      ...readSpecificFields(type)
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to add product: ${err.error ?? res.statusText}`);
        return;
      }

      await loadInventory();
      closeModal();
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };
}

//  UPDATE PRODUCT
function openUpdateModal() {
  modalTitle.textContent = "Update Product";
  setModalBody(`
    <div class="input-group">
      <label>Product to Update</label>
      <input type="text" id="updateSearch" placeholder="Enter exact product name...">
    </div>
    <div class="input-group">
      <label>New Quantity</label>
      <input type="number" id="newQty" placeholder="0" min="0">
    </div>
    <div class="input-group">
      <label>New Price (PHP) <span style="font-weight:400;color:#b9a08a">(optional)</span></label>
      <input type="number" id="newPrice" step="0.01" placeholder="Leave blank to keep current" min="0">
    </div>
  `);
  modalOverlay.style.display = "flex";

  const btn = getFreshConfirmBtn();
  btn.onclick = async () => {
    const target   = document.getElementById("updateSearch")?.value.trim().toLowerCase();
    const newQty   = document.getElementById("newQty")?.value;
    const newPrice = document.getElementById("newPrice")?.value;

    const item = inventory.find(i => i.name.toLowerCase() === target);
    if (!item) { alert("Product not found!"); return; }

    try {
      const res = await fetch(`${API}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: newQty   !== "" ? parseInt(newQty)     : item.quantity,
          price:    newPrice !== "" ? parseFloat(newPrice) : parseFloat(item.price)
        })
      });
      if (!res.ok) { const e = await res.json(); alert(`Update failed: ${e.error ?? res.statusText}`); return; }
      await loadInventory();
      closeModal();
    } catch (err) { alert(`Network error: ${err.message}`); }
  };
}

function openDeleteModal() {
  modalTitle.textContent = "Delete Product";
  setModalBody(`
    <div class="input-group">
      <label>Product to Delete</label>
      <input type="text" id="delName" placeholder="Enter exact product name...">
    </div>
    <p style="color:#c0392b;font-size:0.85rem;margin:0;">This action cannot be undone.</p>
  `);
  modalOverlay.style.display = "flex";

  const btn = getFreshConfirmBtn();
  btn.onclick = async () => {
    const target = document.getElementById("delName")?.value.trim().toLowerCase();
    const item   = inventory.find(i => i.name.toLowerCase() === target);
    if (!item) { alert("Product not found!"); return; }

    try {
      const res = await fetch(`${API}/${item.id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); alert(`Delete failed: ${e.error ?? res.statusText}`); return; }
      await loadInventory();
      closeModal();
    } catch (err) { alert(`Network error: ${err.message}`); }
  };
}

//CHECK ALERTS
async function openAlertsModal() {
  modalTitle.textContent = "Stock Alerts";
  setModalBody(`<p style="text-align:center;color:#6a4b37;padding:12px 0;">Loading alerts...</p>`);
  modalOverlay.style.display = "flex";

  try {
    const res = await fetch(`${API}/alerts`);
    if (!res.ok) {
      setModalBody(`<p style="color:#c0392b;">Failed to load alerts: ${res.statusText}</p>`);
      return;
    }

    const lowItems = await res.json();

    let bodyHtml = "";
    if (lowItems.length === 0) {
      bodyHtml = `<p style="text-align:center;color:#6a4b37;padding:12px 0;">&#10003; All products are sufficiently stocked.</p>`;
    } else {
      const grouped = {};
      lowItems.forEach(i => {
        const label = CATEGORY_LABEL[i.category] || i.category;
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(i);
      });

      bodyHtml = `
        <div style="background:#fff3cd;border:1px solid #e6c97a;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:0.82rem;color:#7a5c00;">
          &#9432;&nbsp; Thresholds: <strong>Books</strong> ≤ 10 &nbsp;|&nbsp; <strong>Magazines</strong> ≤ 10 &nbsp;|&nbsp; <strong>Stationery</strong> ≤ 30
        </div>
        <p style="color:#c0392b;font-size:0.85rem;margin:0 0 12px;font-weight:600;">
          &#9888; ${lowItems.length} product(s) need restocking:
        </p>`;

      Object.entries(grouped).forEach(([label, items]) => {
        bodyHtml += `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.78rem;font-weight:700;color:#7a583f;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
              ${label}
            </div>
            ${items.map(i => {
              const threshold = LOW_STOCK_THRESHOLDS[i.category] ?? 10;
              const pct = Math.round((i.quantity / threshold) * 100);
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e5ccb2;">
                  <div>
                    <div style="font-weight:600;">${i.name}</div>
                    <div style="margin-top:4px;height:4px;width:120px;background:#e5ccb2;border-radius:4px;overflow:hidden;">
                      <div style="height:100%;width:${Math.min(pct,100)}%;background:#c0392b;border-radius:4px;"></div>
                    </div>
                  </div>
                  <span style="color:#c0392b;font-weight:700;">${i.quantity} left</span>
                </div>`;
            }).join("")}
          </div>`;
      });
    }

    setModalBody(bodyHtml);

  } catch (err) {
    setModalBody(`<p style="color:#c0392b;">Network error: ${err.message}</p>`);
  }

  const btn = getFreshConfirmBtn();
  btn.textContent = "Confirm";
  btn.onclick = closeModal;
}

//  VIEW PRODUCT
function openViewModal(item) {
  console.log("Item data:", item);
  modalTitle.textContent = "Product Details";

  let specificHtml = "";
  if (item.category === "Book") {
    const discounted = (item.price * 0.90).toFixed(2);
    specificHtml = `
      <div class="input-row">
        <div class="input-group"><label>Author</label><input type="text" value="${item.author || "—"}" readonly></div>
        <div class="input-group"><label>ISBN</label><input type="text" value="${item.isbn || "—"}" readonly></div>
      </div>
      <div class="input-group"><label>Genre</label><input type="text" value="${item.genre || "—"}" readonly></div>
      <div class="input-group"><label>Discounted Price (10% student discount)</label><input type="text" value="₱${discounted}" readonly style="color:#2e7d32;font-weight:600;"></div>`;
  }else if (item.category === "Magazine") {
    specificHtml = `
      <div class="input-row">
        <div class="input-group"><label>Issue</label><input type="text" value="${item.issue || "—"}" readonly></div>
        <div class="input-group"><label>Pub. Date</label><input type="text" value="${item.pubDate || "—"}" readonly></div>
      </div>
      <div class="input-group"><label>Discounted Price (no discount applied)</label><input type="text" value="₱${parseFloat(item.price).toFixed(2)}" readonly style="color:#7a583f;font-weight:600;"></div>`;
  } else if (item.category === "Stationery") {
    const bulkDiscounted = item.quantity >= 10 ? (item.price * 0.95).toFixed(2) : parseFloat(item.price).toFixed(2);
    const bulkLabel = item.quantity >= 10 ? "Discounted Price (5% bulk discount applied)" : "Discounted Price (no discount — quantity below 10)";
    const bulkColor = item.quantity >= 10 ? "#2e7d32" : "#7a583f";
    specificHtml = `
      <div class="input-row">
        <div class="input-group"><label>Brand</label><input type="text" value="${item.brand || "—"}" readonly></div>
        <div class="input-group"><label>Size</label><input type="text" value="${item.size || "—"}" readonly></div>
      </div>
      <div class="input-group"><label>${bulkLabel}</label><input type="text" value="₱${bulkDiscounted}" readonly style="color:${bulkColor};font-weight:600;"></div>`;
  }

  setModalBody(`
    <div class="input-group"><label>Product Name</label><input type="text" value="${item.name}" readonly></div>
    <div class="input-row">
      <div class="input-group"><label>Price (PHP)</label><input type="text" value="&#8369;${parseFloat(item.price).toFixed(2)}" readonly></div>
      <div class="input-group"><label>Quantity</label><input type="text" value="${item.quantity}" readonly></div>
    </div>
    <div class="input-group"><label>Category</label><input type="text" value="${CATEGORY_LABEL[item.category] || item.category}" readonly></div>
    <div class="specific-fields-area" style="margin-top:0;">${specificHtml}</div>
  `);
  modalOverlay.style.display = "flex";

  const btn = getFreshConfirmBtn();
  btn.textContent = "Confirm";
  btn.onclick = closeModal;
}

// EVENT LISTENERS
document.querySelectorAll(".nav-item").forEach(item => {
  const label = item.querySelector(".nav-label")?.textContent.trim();
  if (!label) return;
  if (label === "Add Product")    item.addEventListener("click", openAddModal);
  if (label === "Update Product") item.addEventListener("click", openUpdateModal);
  if (label === "Delete Product") item.addEventListener("click", openDeleteModal);
  if (label === "Check Alerts")   item.addEventListener("click", openAlertsModal);
});

filterSelect?.addEventListener("change", renderTable);
searchInput?.addEventListener("input", renderTable);

modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) closeModal();
});

document.querySelector(".exit")?.addEventListener("click", () => {
  if (confirm("Exit ShelfSense?")) window.close();
});

//  TIME
setInterval(updateClock, 1000);
updateClock();
loadInventory();