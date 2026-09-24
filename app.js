import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig, DEFAULT_CONTENT } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const contentRef = doc(db, "data", "content");
const studentsRef = collection(db, "students");

const screens = {
  login: document.getElementById("screen-login"),
  subjects: document.getElementById("screen-subjects"),
  teachers: document.getElementById("screen-teachers"),
};

const state = {
  content: null,
  studentName: "",
  trackKey: null,
  subjectCode: null,
};

function showScreen(name) {
  Object.values(screens).forEach((el) => (el.style.display = "none"));
  screens[name].style.display = "block";
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

async function ensureSeeded() {
  const snap = await getDoc(contentRef);
  if (!snap.exists()) {
    await setDoc(contentRef, DEFAULT_CONTENT);
  }
}

function applySiteText(content) {
  document.getElementById("site-name").textContent = content.siteName;
  document.getElementById("welcome-title").textContent = content.welcomeTitle;
  document.getElementById("welcome-text").textContent = content.welcomeText;
  document.getElementById("support-link").href = `https://t.me/${content.supportUsername}`;
}

function renderTrackOptions(content) {
  const box = document.getElementById("track-grid");
  box.innerHTML = "";
  Object.entries(content.groups).forEach(([key, group]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "track-option";
    btn.textContent = group.name;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".track-option").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.trackKey = key;
    });
    box.appendChild(btn);
  });
}

function renderSubjects() {
  const content = state.content;
  const group = content.groups[state.trackKey];
  document.getElementById("subjects-track-name").textContent = group.name;
  document.getElementById("subjects-student-name").textContent = state.studentName;

  const list = document.getElementById("subjects-list");
  list.innerHTML = "";

  if (!group.subjects.length) {
    list.innerHTML = `<div class="empty">لسه مفيش مواد مضافة للشعبة دي</div>`;
    return;
  }

  group.subjects.forEach((code) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<span class="name">${content.subjectNames[code] || code}</span><span class="go">عرض المدرسين ←</span>`;
    item.addEventListener("click", () => {
      state.subjectCode = code;
      renderTeachers();
      showScreen("teachers");
    });
    list.appendChild(item);
  });
}

function renderTeachers() {
  const content = state.content;
  const subjectName = content.subjectNames[state.subjectCode] || state.subjectCode;
  document.getElementById("teachers-subject-name").textContent = subjectName;

  const list = document.getElementById("teachers-list");
  list.innerHTML = "";

  const teachers = content.teachers[state.subjectCode] || [];
  if (!teachers.length) {
    list.innerHTML = `<div class="empty">لسه مفيش مدرسين مضافين للمادة دي</div>`;
    return;
  }

  teachers.forEach((t) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<span class="name">📺 ${t.name}</span><span class="go">فتح المحاضرات على تليجرام ←</span>`;
    item.addEventListener("click", () => {
      window.open(t.link, "_blank", "noopener");
    });
    list.appendChild(item);
  });
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("student-name").value.trim();

  if (!name) {
    toast("اكتب اسمك الأول");
    return;
  }
  if (!state.trackKey) {
    toast("اختار شعبتك الأول");
    return;
  }

  state.studentName = name;

  const submitBtn = document.getElementById("login-submit-btn");
  submitBtn.disabled = true;

  try {
    await addDoc(studentsRef, {
      name,
      trackKey: state.trackKey,
      trackName: state.content.groups[state.trackKey].name,
      registeredAt: serverTimestamp(),
    });
  } catch (err) {
    // حتى لو التسجيل فشل (مثلاً مشكلة نت)، سيب الطالب يكمل عادي
    console.error("student registration failed", err);
  }

  submitBtn.disabled = false;
  renderSubjects();
  showScreen("subjects");
});

document.getElementById("back-to-login").addEventListener("click", () => showScreen("login"));
document.getElementById("back-to-subjects").addEventListener("click", () => showScreen("subjects"));

(async function init() {
  await ensureSeeded();
  onSnapshot(contentRef, (snap) => {
    if (!snap.exists()) return;
    state.content = snap.data();
    applySiteText(state.content);
    renderTrackOptions(state.content);
    // لو الطالب واصل لشاشة بعدين والداتا اتحدثت، حدّث الشاشة الحالية بدون ما ترجّعه للأول
    if (screens.subjects.style.display === "block" && state.trackKey) renderSubjects();
    if (screens.teachers.style.display === "block" && state.subjectCode) renderTeachers();
  });
})();
