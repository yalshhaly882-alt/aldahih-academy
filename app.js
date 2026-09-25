import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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

function applySiteText(content) {
  document.getElementById("site-name").textContent = content.siteName;
  document.getElementById("welcome-title").textContent = content.welcomeTitle;
  document.getElementById("welcome-text").textContent = content.welcomeText;
  document.getElementById("support-link").href = `https://t.me/${content.supportUsername}`;
}

function renderTrackOptions(content) {
  const select = document.getElementById("track-select");
  const currentValue = select.value;
  select.innerHTML = `<option value="">-- اختار شعبتك --</option>`;
  Object.entries(content.groups).forEach(([key, group]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = group.name;
    select.appendChild(opt);
  });
  if (currentValue) select.value = currentValue;
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
  state.trackKey = document.getElementById("track-select").value;

  if (!name) {
    toast("اكتب اسمك الأول");
    return;
  }
  if (!state.trackKey) {
    toast("اختار شعبتك الأول");
    return;
  }
  if (!state.content || !state.content.groups || !state.content.groups[state.trackKey]) {
    toast("⚠️ حصلت مشكلة في تحميل بيانات الشعبة، جرب تقفل الصفحة وتفتحها تاني");
    return;
  }

  state.studentName = name;

  const submitBtn = document.getElementById("login-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ جاري الدخول...";

  try {
    const regPromise = addDoc(studentsRef, {
      name,
      trackKey: state.trackKey,
      trackName: state.content.groups[state.trackKey].name,
      registeredAt: serverTimestamp(),
    }).catch((regErr) => {
      // حتى لو التسجيل فشل أو الشبكة بطيئة، سيب الطالب يكمل عادي
      console.error("student registration failed", regErr);
    });

    // متستناش أكتر من 4 ثواني على التسجيل — كمّل الطالب على أي حال
    await Promise.race([regPromise, new Promise((resolve) => setTimeout(resolve, 4000))]);

    renderSubjects();
    showScreen("subjects");
  } catch (err) {
    console.error("login flow failed", err);
    toast("⚠️ حصل خطأ: " + (err && err.message ? err.message : "غير معروف"));
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "📝 دخول المنصة";
  }
});

document.getElementById("back-to-login").addEventListener("click", () => showScreen("login"));
document.getElementById("back-to-subjects").addEventListener("click", () => showScreen("subjects"));

(function init() {
  // اعرض البيانات الافتراضية فوراً عشان الموقع يشتغل على طول من غير ما يستنى الشبكة
  state.content = DEFAULT_CONTENT;
  applySiteText(state.content);
  renderTrackOptions(state.content);

  onSnapshot(
    contentRef,
    (snap) => {
      if (snap.exists()) {
        state.content = snap.data();
      } else {
        // مفيش داتا محفوظة لسه (أول مرة) — جرب تسجلها، ولو الكتابة اتمنعت (لازم تسجيل دخول أدمن)
        // فالموقع هيفضل شغال بالبيانات الافتراضية اللي فوق أصلاً
        setDoc(contentRef, DEFAULT_CONTENT).catch(() => {});
        state.content = DEFAULT_CONTENT;
      }
      applySiteText(state.content);
      renderTrackOptions(state.content);
      // لو الطالب واصل لشاشة بعدين والداتا اتحدثت، حدّث الشاشة الحالية بدون ما ترجّعه للأول
      if (screens.subjects.style.display === "block" && state.trackKey) renderSubjects();
      if (screens.teachers.style.display === "block" && state.subjectCode) renderTeachers();
    },
    () => {
      // فشل الاتصال بـ Firestore خالص — الموقع يفضل شغال بالبيانات الافتراضية
    }
  );
})();
