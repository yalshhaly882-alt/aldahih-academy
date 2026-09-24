import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig, DEFAULT_CONTENT } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const contentRef = doc(db, "data", "content");
const studentsRef = collection(db, "students");

let content = null;
let studentsCache = [];
let studentsUnsub = null;

const loginScreen = document.getElementById("admin-login");
const panelScreen = document.getElementById("admin-panel");

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value.trim();
  const pass = document.getElementById("admin-password").value;
  const errBox = document.getElementById("admin-login-error");
  errBox.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    errBox.textContent = "بيانات الدخول غلط أو المستخدم مش موجود في Firebase Authentication.";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginScreen.style.display = "none";
    panelScreen.style.display = "block";
    await loadContent();
    startStudentsListener();
  } else {
    loginScreen.style.display = "block";
    panelScreen.style.display = "none";
    if (studentsUnsub) studentsUnsub();
  }
});

function startStudentsListener() {
  const q = query(studentsRef, orderBy("registeredAt", "desc"));
  studentsUnsub = onSnapshot(q, (snap) => {
    studentsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderStudents();
  });
}

function renderStudents() {
  const searchTerm = document.getElementById("students-search").value.trim().toLowerCase();
  const list = document.getElementById("students-list");
  const countBox = document.getElementById("students-count");

  const filtered = studentsCache.filter((s) => {
    if (!searchTerm) return true;
    return (s.name || "").toLowerCase().includes(searchTerm);
  });

  countBox.textContent = `عدد الطلاب المسجلين: ${studentsCache.length}${searchTerm ? ` — عرض ${filtered.length} نتيجة` : ""}`;
  list.innerHTML = "";

  if (!filtered.length) {
    list.innerHTML = `<div class="empty">لسه محدش سجّل</div>`;
    return;
  }

  filtered.forEach((s) => {
    const row = document.createElement("div");
    row.className = "teacher-row";
    const date = s.registeredAt && s.registeredAt.toDate ? s.registeredAt.toDate().toLocaleString("ar-EG") : "—";
    row.innerHTML = `
      <div class="info">
        <div>👤 ${s.name || "—"} <span style="color:var(--text-muted); font-size:12.5px;">(${s.trackName || s.trackKey || "—"})</span></div>
        <span class="link">${date}</span>
      </div>
      <div class="actions">
        <button class="icon-btn" data-action="delete">🗑️ حذف</button>
      </div>
    `;
    row.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      if (!confirm(`متأكد عاوز تمسح تسجيل ${s.name}؟`)) return;
      await deleteDoc(doc(db, "students", s.id));
    });
    list.appendChild(row);
  });
}

document.getElementById("students-search").addEventListener("input", renderStudents);

async function loadContent() {
  const snap = await getDoc(contentRef);
  content = snap.exists() ? snap.data() : JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  fillSiteFields();
  renderSubjectPicker();
  renderTeachersManager();
}

async function saveContent() {
  await setDoc(contentRef, content);
  toast("✅ اتحفظ بنجاح");
}

function fillSiteFields() {
  document.getElementById("f-welcome-title").value = content.welcomeTitle;
  document.getElementById("f-welcome-text").value = content.welcomeText;
  document.getElementById("f-support-username").value = content.supportUsername;
}

document.getElementById("site-settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  content.welcomeTitle = document.getElementById("f-welcome-title").value.trim();
  content.welcomeText = document.getElementById("f-welcome-text").value.trim();
  content.supportUsername = document.getElementById("f-support-username").value.trim();
  await saveContent();
});

// ---------- إدارة المواد لكل شعبة ----------
function renderSubjectPicker() {
  const box = document.getElementById("subject-picker");
  box.innerHTML = "";
  Object.entries(content.groups).forEach(([groupKey, group]) => {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "16px";
    const title = document.createElement("div");
    title.style.fontWeight = "700";
    title.style.marginBottom = "8px";
    title.textContent = group.name;
    wrap.appendChild(title);

    const tagsBox = document.createElement("div");
    Object.entries(content.subjectNames).forEach(([code, name]) => {
      const active = group.subjects.includes(code);
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "subject-tag";
      tag.style.cursor = "pointer";
      tag.style.border = active ? "1px solid var(--accent-2)" : "1px solid transparent";
      tag.style.opacity = active ? "1" : "0.45";
      tag.textContent = name;
      tag.addEventListener("click", () => {
        if (group.subjects.includes(code)) {
          group.subjects = group.subjects.filter((c) => c !== code);
        } else {
          group.subjects.push(code);
        }
        renderSubjectPicker();
      });
      tagsBox.appendChild(tag);
    });
    wrap.appendChild(tagsBox);
    box.appendChild(wrap);
  });
}

document.getElementById("save-groups-btn").addEventListener("click", async () => {
  await saveContent();
});

// ---------- إدارة روابط المدرسين ----------
function subjectSelectOptions(selected) {
  return Object.entries(content.subjectNames)
    .map(([code, name]) => `<option value="${code}" ${code === selected ? "selected" : ""}>${name}</option>`)
    .join("");
}

function renderTeachersManager() {
  const subjSelect = document.getElementById("teacher-subject-select");
  subjSelect.innerHTML = subjectSelectOptions();
  renderTeacherList(subjSelect.value);
}

document.getElementById("teacher-subject-select").addEventListener("change", (e) => {
  renderTeacherList(e.target.value);
});

function renderTeacherList(subjectCode) {
  const list = document.getElementById("teacher-list");
  list.innerHTML = "";
  const teachers = content.teachers[subjectCode] || (content.teachers[subjectCode] = []);

  if (!teachers.length) {
    list.innerHTML = `<div class="empty">لسه مفيش مدرسين في المادة دي</div>`;
    return;
  }

  teachers.forEach((t, idx) => {
    const row = document.createElement("div");
    row.className = "teacher-row";
    row.innerHTML = `
      <div class="info">
        <div>${t.name}</div>
        <span class="link">${t.link}</span>
      </div>
      <div class="actions">
        <button class="icon-btn" data-action="edit">✏️ تعديل</button>
        <button class="icon-btn" data-action="delete">🗑️ حذف</button>
      </div>
    `;
    row.querySelector('[data-action="edit"]').addEventListener("click", () => {
      const newName = prompt("اسم المدرس:", t.name);
      if (newName === null) return;
      const newLink = prompt("رابط القناة/المحاضرات:", t.link);
      if (newLink === null) return;
      t.name = newName.trim();
      t.link = newLink.trim();
      renderTeacherList(subjectCode);
    });
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm(`متأكد عاوز تمسح ${t.name}؟`)) return;
      teachers.splice(idx, 1);
      renderTeacherList(subjectCode);
    });
    list.appendChild(row);
  });
}

document.getElementById("add-teacher-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const subjectCode = document.getElementById("teacher-subject-select").value;
  const name = document.getElementById("new-teacher-name").value.trim();
  const link = document.getElementById("new-teacher-link").value.trim();
  if (!name || !link) {
    toast("اكتب اسم المدرس والرابط");
    return;
  }
  if (!content.teachers[subjectCode]) content.teachers[subjectCode] = [];
  content.teachers[subjectCode].push({ name, link });
  document.getElementById("new-teacher-name").value = "";
  document.getElementById("new-teacher-link").value = "";
  renderTeacherList(subjectCode);
});

document.getElementById("save-teachers-btn").addEventListener("click", async () => {
  await saveContent();
});
