# Al-Dahih Academy — موقع الأكاديمية

موقع بسيط: الطالب يدخل باسمه وشعبته، يشوف المواد، يضغط على مدرس فيتفتحله رابط قناة المحاضرات على تليجرام. في لوحة تحكم مخفية (`admin.html`) لإدارة كل حاجة.

## 1. جهّز Firebase (قاعدة البيانات + تسجيل دخول الأدمن)

1. روح [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → سمّيه زي ما تحب.
2. من القائمة الجانبية: **Build → Firestore Database → Create database** → اختار **Start in production mode** → اختار أقرب منطقة.
3. من القائمة الجانبية: **Build → Authentication → Get started** → فعّل **Email/Password**.
4. في نفس الصفحة (تبويب Users) → **Add user** → حط إيميل وباسورد بتاعك (ده اللي هتدخل بيه لوحة التحكم).
5. من **Project settings** (الترس بجانب Project Overview) → انزل لـ **Your apps** → اضغط أيقونة الويب `</>` → سمّي التطبيق → هيطلعلك كائن `firebaseConfig`.
6. افتح ملف `firebase-config.js` في المشروع، واستبدل القيم بالقيم اللي طلعتلك.

### قواعد الحماية (Firestore Rules)
في Firestore → تبويب **Rules** → استبدل الموجود بده وانشر (Publish):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data/content {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /students/{studentId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

يعني: أي حد يقرأ محتوى الموقع عادي، وأي طالب يقدر "يسجل" بياناته (بس مايقدرش يقرا بيانات طلاب تانيين). أما التعديل على المحتوى، وقراءة/حذف قائمة الطلاب، فمحتاج تسجيل دخول بإيميل وباسورد Firebase اللي عملتهم فوق (يعني لوحة التحكم بس).

## 2. جرّب على جهازك (اختياري)

افتح مجلد المشروع بمحرر زي VS Code وشغّل أي سيرفر محلي بسيط (لازم سيرفر مش فتح الملف مباشرة عشان الـ modules تشتغل)، مثلاً:

```
npx serve .
```

## 3. ارفعه على GitHub

```
cd aldahih-academy
git init
git add .
git commit -m "Al-Dahih Academy website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

## 4. فعّل GitHub Pages

1. في صفحة الريبو على GitHub → **Settings → Pages**
2. تحت **Build and deployment** اختار **Deploy from a branch**
3. اختار Branch: `main` والمجلد `/ (root)` → **Save**
4. هياخد دقيقة، وهتلاقي رابط الموقع فوق (زي `https://USERNAME.github.io/REPO-NAME/`)

لوحة التحكم هتكون على: `https://USERNAME.github.io/REPO-NAME/admin.html` — مش متلينكة من أي مكان في الموقع، بس أي حد يعرف الرابط ولاقى إيميل وباسورد صح يقدر يدخلها، فخليهم سريين.

## ملاحظة مهمة عن الفيديوهات

الروابط الحالية هي روابط دعوة لقنوات تليجرام خاصة، مش روابط فيديو مباشرة. لما الطالب يضغط على اسم المدرس هيتفتحله رابط القناة في تاب/تطبيق تليجرام جديد — مش تشغيل فيديو جوه الموقع نفسه. لو عايز الفيديو يشتغل فعلياً جوه صفحة الموقع، هتحتاج ترفع الفيديوهات مكان بيدّيك رابط مباشر قابل للتضمين (زي يوتيوب "غير مدرج" أو سيرفر فيديو)، وبعدين تضيف الرابط ده بدل رابط التليجرام من نفس لوحة التحكم.

## هيكل الملفات

- `index.html` — الموقع اللي بيشوفه الطالب
- `admin.html` — لوحة التحكم المخفية
- `style.css` — التصميم
- `app.js` — منطق موقع الطالب
- `admin.js` — منطق لوحة التحكم
- `firebase-config.js` — إعدادات Firebase + بيانات افتراضية أول مرة

## تسجيل الطلاب

لما الطالب يكتب اسمه ويختار شعبته ويدخل، بياناته بتتسجل تلقائي في Firestore (collection اسمها `students`). من لوحة التحكم هتلاقي قسم "👥 الطلاب المسجلين" فيه اسم كل طالب، شعبته، ووقت التسجيل — وفيه بحث وحذف.
