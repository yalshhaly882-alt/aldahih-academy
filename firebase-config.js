// غيّر القيم دي ببيانات مشروعك على Firebase
// (Project settings → General → Your apps → SDK setup and configuration)
export const firebaseConfig = {
  apiKey: "AIzaSyAnNTBTMSOJRAZrZZgNfAwtVmlIF5MDDP0",
  authDomain: "aldahih-academy.firebaseapp.com",
  projectId: "aldahih-academy",
  storageBucket: "aldahih-academy.firebasestorage.app",
  messagingSenderId: "299868342044",
  appId: "1:299868342044:web:afe8c64ad373bab3d49cd9"
};

// بيانات افتراضية تُستخدم أول مرة فقط لو مفيش داتا في Firestore بعد
// (بترفع تلقائياً لقاعدة البيانات أول ما حد يفتح الموقع أو لوحة التحكم)
export const DEFAULT_CONTENT = {
  siteName: "Al-Dahih Academy",
  welcomeTitle: "أهلاً بيك يا بطل في أقوى منصة لطلاب 3 ثانوي! 🚀",
  welcomeText: "🌟 Al-Dahih Academy 🌟 — هنا تلاقي طريقك للقمة. جميع محاضرات نخبة مدرسي الثانوية العامة 2026 بين إيديك مجاناً بالكامل 🆓✨",
  supportUsername: "Al_Dahih11_Bot",
  groups: {
    scientific: { name: "🔬 مواد العلمي", subjects: ["ara", "eng", "bio", "che", "phy", "fr", "ger"] },
    literary:   { name: "📚 مواد الأدبي", subjects: ["ara", "eng", "geo", "his", "fr", "ger"] },
    math:       { name: "📐 مواد الرياضة", subjects: ["ara", "eng", "math", "che", "phy", "fr", "ger"] },
    azhar:      { name: "🕌 قسم الأزهر", subjects: ["ara", "eng", "bio", "che", "phy", "math", "fr", "ger"] }
  },
  subjectNames: {
    ara: "عربي", eng: "إنجليزي", bio: "أحياء", che: "كيمياء",
    phy: "فيزياء", math: "رياضة", fr: "فرنساوي", ger: "ألماني",
    geo: "جغرافيا", his: "تاريخ"
  },
  teachers: {
    ara: [
      { name: "محمد صلاح", link: "https://t.me/+EEW-TCiIRLw3MDg8" },
      { name: "رضا الفاروق", link: "https://t.me/+HEw-RmGIHm5lNmM0" }
    ],
    eng: [
      { name: "مي مجدي", link: "https://t.me/+xhZsZARfnIg4ODg0" },
      { name: "انجلشاوي", link: "https://t.me/+ZojKLI2COnE4MDc0" },
      { name: "شريف المصري", link: "https://t.me/+DOaIcPoYn29jYjhk" }
    ],
    bio: [
      { name: "احمد الجوهري", link: "https://t.me/+8TzcQHWCW1I5NDc0" },
      { name: "محمد ايمن", link: "https://t.me/+cJ7-ZzlLxoRhZmI0" },
      { name: "جيو ماجد", link: "https://t.me/+p789CzNA-Yo3YjM0" }
    ],
    che: [
      { name: "خالد صقر", link: "https://t.me/+2PsWSgn0axQ0ZGU8" },
      { name: "محمد عبد الجواد", link: "https://t.me/+u0EQ2rkZvYJkOWI0" }
    ],
    phy: [
      { name: "محمد عبد المعبود", link: "https://t.me/+4LnGU3IsX_U2MTE0" },
      { name: "د. كيرلس", link: "https://t.me/+CXri0nffu1Q3MDA0" },
      { name: "محمود مجدي", link: "https://t.me/+pH5ZV-XHyHU2Yzg0" }
    ],
    math: [
      { name: "لطفي زهران", link: "https://t.me/+3sy2vCDouhU3MTdk" },
      { name: "احمد عصام", link: "https://t.me/+Vv_VvBH74o00YTc0" }
    ],
    fr: [{ name: "مسيو حسين", link: "https://t.me/+4KXDU0WlAYk3NGZk" }],
    ger: [{ name: "هير عبد المعز", link: "https://t.me/+g3iCkdOC5rdiYjc8" }],
    geo: [{ name: "احمد زهران", link: "https://t.me/+ZUHl-AONl2JkNTU8" }],
    his: [{ name: "الخديوي", link: "https://t.me/+x6HaE2EbdSU3M2Q8" }]
  }
};
