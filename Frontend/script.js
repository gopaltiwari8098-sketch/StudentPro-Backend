document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 600, once: true });
  attachPreviewEvent();
  initApp();
});

// --- API base ---
const API_URL = "https://studentpro-backend-2.onrender.com/api/students";
const API_ORIGIN = API_URL.replace(/\/api\/.*$/, "");

let state = {
  students: [],
  page: 1,
  pageSize: 10,
  sortBy: null,
  sortDir: "asc",
  search: "",
  editId: null,
};

let deptChart = null;

// --- helpers ---
const $ = (id) => document.getElementById(id);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

// --- init ---
async function initApp() {
  $("year").textContent = new Date().getFullYear();
  $("pageSize").value = state.pageSize;
  attachEvents();

  const theme = localStorage.getItem("sp_theme") || "light";
  setTheme(theme);
  $("darkToggle").checked = theme === "dark";

  await loadStudents();
}

// --- Events ---
function attachEvents() {
  $("studentForm").addEventListener("submit", handleSave);
  $("openAddBtn").addEventListener("click", openAddModal);
  $("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    state.page = 1;
    render();
  });
  $("sortNameBtn").addEventListener("click", () => setSort("name"));
  $("sortAgeBtn").addEventListener("click", () => setSort("age"));
  $("pageSize").addEventListener("change", (e) => {
    state.pageSize = Number(e.target.value);
    state.page = 1;
    render();
  });
  $("scrollToTable").addEventListener("click", () => {
    $("mainSection").scrollIntoView({ behavior: "smooth" });
  });
  $("darkToggle").addEventListener("change", (e) => {
    setTheme(e.target.checked ? "dark" : "light");
  });
}

function attachPreviewEvent() {
  const avatarInput = $("avatar");
  const avatarPreview = $("avatarPreview");
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        avatarPreview.src = URL.createObjectURL(file);
        avatarPreview.classList.remove("d-none");
      } else {
        avatarPreview.classList.add("d-none");
      }
    });
  }
}

function setTheme(name) {
  if (name === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  localStorage.setItem("sp_theme", name);
}

// ---------- API ----------
async function loadStudents() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch students");
    state.students = await res.json();
    render();
    updateChart();
  } catch (err) {
    showToast(err.message || "Fetch error", "danger");
  }
}

async function createStudentFD(formData) {
  const res = await fetch(API_URL, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
}

async function updateStudentFD(id, formData) {
  const res = await fetch(`${API_URL}/${id}`, { method: "PUT", body: formData });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

// ---------- CRUD UI ----------
function openAddModal() {
  resetForm();
  $("modalTitle").textContent = "Add Student";
  $("saveBtn").textContent = "Save";
  new bootstrap.Modal($("studentModal")).show();
}

function resetForm() {
  $("studentId").value = "";
  $("name").value = "";
  $("email").value = "";
  $("course").value = "";
  $("age").value = "";
  $("rollNumber").value = "";
  $("phone").value = "";
  $("department").value = "";
  $("gpa").value = "";
  $("skills").value = "";
  $("achievements").value = "";
  $("portfolio").value = "";
  $("avatar").value = "";
  $("avatarPreview").classList.add("d-none");
  state.editId = null;
}

async function handleSave(e) {
  e.preventDefault();

  const id = $("studentId").value || null;
  const name = $("name").value.trim();
  const email = $("email").value.trim();

  if (!name || !email) {
    showToast("Name and Email are required", "danger");
    return;
  }

  const fd = new FormData();
  fd.append("name", name);
  fd.append("email", email);
  fd.append("course", $("course").value.trim());
  fd.append("age", $("age").value ? Number($("age").value) : "");
  fd.append("rollNumber", $("rollNumber").value.trim());
  fd.append("phone", $("phone").value.trim());
  fd.append("department", $("department").value.trim());
  fd.append("gpa", $("gpa").value ? Number($("gpa").value) : "");
  fd.append("skills", $("skills").value.trim());
  fd.append("achievements", $("achievements").value.trim());
  fd.append("portfolio", $("portfolio").value.trim());

  const file = $("avatar").files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB", "danger");
      return;
    }
    fd.append("avatar", file);
  }

  try {
    if (id) {
      await updateStudentFD(id, fd);
      showToast("Student updated", "success");
    } else {
      await createStudentFD(fd);
      showToast("Student added", "success");
    }

    // AUTO REFRESH
    await loadStudents();
    const modalEl = $("studentModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();

  } catch (err) {
    showToast(err.message || "Save failed", "danger");
  }
}

// ---------- table rendering ----------
function render() {
  let list = [...state.students];

  if (state.search) {
    const q = state.search;
    list = list.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.course || "").toLowerCase().includes(q) ||
        (s.department || "").toLowerCase().includes(q) ||
        (s.skills || "").toLowerCase().includes(q)
    );
  }

  if (state.sortBy) {
    list.sort((a, b) => {
      let av = a[state.sortBy] ?? "";
      let bv = b[state.sortBy] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const total = list.length;
  const pageSize = state.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  const tbody = $("studentsBody");
  tbody.innerHTML = pageItems
    .map((s) => {
      const initials = (s.name || "")
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      const avatarSrc = s.avatar
        ? s.avatar.startsWith("http")
          ? s.avatar
          : `${API_ORIGIN}${s.avatar}`
        : null;
      const avatarHTML = avatarSrc
        ? `<img src="${avatarSrc}" class="rounded" style="width:46px; height:46px; object-fit:cover;">`
        : `<div class="avatar">${initials || "?"}</div>`;

      return `
        <tr>
          <td>${avatarHTML}</td>
          <td>${escapeHtml(s.name || "—")}</td>
          <td>${escapeHtml(s.email || "—")}</td>
          <td>${escapeHtml(s.course || "—")}</td>
          <td>${s.age ?? "—"}</td>
          <td>${escapeHtml(s.rollNumber || "—")}</td>
          <td>${escapeHtml(s.phone || "—")}</td>
          <td>${escapeHtml(s.department || "—")}</td>
          <td>${s.gpa ?? "—"}</td>
          <td>${escapeHtml(s.skills || "—")}</td>
          <td>${escapeHtml(s.achievements || "—")}</td>
          <td>${s.portfolio ? `<a href="${s.portfolio}" target="_blank">View</a>` : "—"}</td>
          <td>${formatDate(s.createdAt)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" onclick="onEdit('${s._id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger ms-2" onclick="onDelete('${s._id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  $("totalCount").textContent = total;
  $("showingRange").textContent =
    total === 0
      ? "0 - 0 of 0"
      : `${Math.min(total, start + 1)} - ${Math.min(total, start + pageItems.length)} of ${total}`;

  renderPagination(totalPages);
  AOS.refreshHard();
}

// --- Pagination ---
function renderPagination(totalPages) {
  const ul = $("pagination");
  ul.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === state.page ? "active" : ""}`;
    li.innerHTML = `<button class="page-link" onclick="gotoPage(${i})">${i}</button>`;
    ul.appendChild(li);
  }
}

function gotoPage(n) {
  state.page = n;
  render();
}

// --- edit & delete ---
function onEdit(id) {
  const student = state.students.find((s) => s._id === id);
  if (!student) return;

  $("studentId").value = student._id;
  $("name").value = student.name || "";
  $("email").value = student.email || "";
  $("course").value = student.course || "";
  $("age").value = student.age || "";
  $("rollNumber").value = student.rollNumber || "";
  $("phone").value = student.phone || "";
  $("department").value = student.department || "";
  $("gpa").value = student.gpa || "";
  $("skills").value = student.skills || "";
  $("achievements").value = student.achievements || "";
  $("portfolio").value = student.portfolio || "";
  $("avatar").value = "";
  $("avatarPreview").classList.add("d-none");

  $("modalTitle").textContent = "Edit Student";
  $("saveBtn").textContent = "Update";
  new bootstrap.Modal($("studentModal")).show();
}

async function onDelete(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  try {
    await deleteStudent(id);
    showToast("Student deleted", "warning");
    await loadStudents(); // AUTO REFRESH
  } catch (err) {
    showToast(err.message || "Delete failed", "danger");
  }
}

// --- sorting ---
function setSort(field) {
  if (state.sortBy === field) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  else {
    state.sortBy = field;
    state.sortDir = "asc";
  }
  render();
}

// --- CSV Export ---
function exportCSV() {
  if (!state.students.length) {
    showToast("No data to export", "warning");
    return;
  }

  const headers = [
    "Name","Email","Course","Age","Roll No","Phone","Department","GPA","Skills","Achievements","Portfolio"
  ];
  const rows = state.students.map((s) => [
    `"${s.name || ""}"`,
    `"${s.email || ""}"`,
    `"${s.course || ""}"`,
    `"${s.age || ""}"`,
    `"${s.rollNumber || ""}"`,
    `"${s.phone || ""}"`,
    `"${s.department || ""}"`,
    `"${s.gpa || ""}"`,
    `"${s.skills || ""}"`,
    `"${s.achievements || ""}"`,
    `"${s.portfolio || ""}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- Chart ---
function updateChart() {
  const deptCounts = {};
  state.students.forEach((s) => {
    const dept = s.department || "Unknown";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const labels = Object.keys(deptCounts);
  const data = Object.values(deptCounts);

  const ctx = $("deptChart");
  if (deptChart) deptChart.destroy();

  deptChart = new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ data, backgroundColor: ["#4caf50","#2196f3","#ff9800","#9c27b0","#f44336","#00bcd4","#8bc34a","#ff5722"] }] },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });
}

// --- utils ---
function showToast(message, type = "info") {
  const toastId = "t" + Date.now();
  const container = $("toastContainer");
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");
  toastEl.id = toastId;
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
  bsToast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function escapeHtml(str = "") {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
