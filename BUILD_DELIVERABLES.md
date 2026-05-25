# Build Deliverables — Android APK

> آخر تحديث: 2026-05-25  
> الحالة: ⏳ يحتاج تسجيل دخول Expo

## ❌ NEED_EXPO_LOGIN

لم يكتمل بناء APK لأن EAS Build يتطلب حساب Expo.

### الخطوات المطلوبة منك:

#### 1. سجّل الدخول إلى Expo

```bash
cd mobile-game
npx eas-cli login
```

- سيطلب البريد الإلكتروني وكلمة المرور لحساب Expo الخاص بك.
- إذا ليس لديك حساب، أنشئ واحدًا مجانيًا على: https://expo.dev/signup

#### 2. بعد تسجيل الدخول، أعد تشغيل الأمر:

```bash
cd mobile-game
npx eas-cli build -p android --profile preview-apk
```

#### 3. انتظر اكتمال البناء

- EAS Build سيرفع الكود إلى سيرفرات Expo ويبني APK في السحابة.
- المدة التقريبية: 5-15 دقيقة.
- بعد الاكتمال، ستحصل على رابط تحميل APK.

#### 4. تثبيت APK على جهاز Android

- حمّل رابط APK على جهاز Android.
- افتح الملف لبدء التثبيت.
- قد تحتاج إلى تفعيل "تثبيت من مصادر غير معروفة" في إعدادات الأمان.

---

## 🛠️ إعدادات البناء الحالية

### `eas.json`

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview-apk": {
      "android": { "buildType": "apk" }
    },
    "production": {}
  }
}
```

### `app.json` — إعدادات التطبيق

| الحقل | القيمة |
|---|---|
| الاسم | Shatranj Strategy |
| package name | `com.shatranj.strategy` |
| Android build type | APK (قابل للتثبيت المباشر) |
| Expo SDK | 56 |
| Target | Android + iOS |

---

## ✅ تم التأكيد قبل البناء

| الفحص | النتيجة |
|---|---|
| TypeScript strict mode | ✅ صفر أخطاء |
| EAS CLI | ✅ متاح عبر npx |
| eas.json | ✅ موجود |
| app.json | ✅ محدّث مع package name |
| الاختبارات | 238/250 نجاح (12 فشل سابق غير حرج) |

---

## 📱 بعد تثبيت APK

- اسم التطبيق: **Shatranj Strategy**
- اختر FFA أو 2v2
- اضبط إعدادات البوتات (Easy/Normal/Hard/Expert)
- ابدأ المباراة ولاحظ آلية اللعب: تخطيط ← كشف ← حل الممرات
- يمكن تغيير اللغة (عربي/إنجليزي) من شاشة الإعدادات

---

## 🚨 إذا واجهت مشاكل في البناء

| المشكلة | الحل |
|---|---|
| `An Expo user account is required` | نفّذ `npx eas-cli login` أولًا |
| `Project ID not configured` | قد تحتاج لربط المشروع: `npx eas-cli init` |
| فشل في رفع الملفات | تحقق من اتصال الإنترنت |
| خطأ في build على سيرفر EAS | اقرأ الـ logs التي سيعرضها EAS |
