# 📋 تقرير المراجعة الشاملة لمشروع منصة «بسطة | Bastah» من الألف إلى الياء

**تاريخ المراجعة:** 15 نوفمبر 2026  
**طبيعة المراجعة:** فحص تحليلي شامل للكود والبنية التحتية، الأمان، الأداء، والتوافق مع وثائق الـ Backend والـ Handoff (بدون إجراء أي تعديلات على ملفات المشروع).

---

## 📑 الفهرس التنفيذي
1. [نظرة عامة على المشروع وبنيته التقنية](#1-نظرة-عامة-على-المشروع-وبنيته-التقنية)
2. [المشاكل البرمجية الحرجة (Critical Bugs)](#2-المشاكل-البرمجية-الحرجة-critical-bugs)
3. [التعارضات الجوهرية مع قواعد المنصة وميثاق العمل](#3-التعارضات-الجوهرية-مع-قواعد-المنصة-وميثاق-العمل)
4. [الميزات الوهمية أو غير المكتملة (Dummy & Unfinished Features)](#4-الميزات-الوهمية-أو-غير-المكتملة-dummy--unfinished-features)
5. [مشاكل التوجيه والروابط المكسورة (Routing & Broken Links)](#5-مشاكل-التوجيه-والروابط-المكسورة-routing--broken-links)
6. [الملفات المهملة والمكررة (Dead & Orphaned Code)](#6-الملفات-المهملة-والمكررة-dead--orphaned-code)
7. [جودة الكود، الأداء ومعايير TypeScript/ESLint](#7-جودة-الكود-الأداء-ومعايير-typescripteslint)
8. [الأمان والبيئة والمتغيرات (Environment & Security)](#8-الأمان-والبيئة-والمتغيرات-environment--security)
9. [خطة العمل والتوصيات ذات الأولوية (Action Plan)](#9-خطة-العمل-والتوصيات-ذات-الأولوية-action-plan)

---

## 1. نظرة عامة على المشروع وبنيته التقنية

| العنصر | التفاصيل الحالية في الكود | ملاحظات التوافق |
| :--- | :--- | :--- |
| **إطار العمل (Framework)** | **Next.js 16.2.10** (App Router) | إصدار حديث جداً يحتوي على اتفاقية `proxy.ts` بدلاً من `middleware.ts`. |
| **مكتبة الواجهة (UI Core)** | **React 19.2.4** | استخدام Hook حديث مثل `use(params)` المتوافق مع Next.js 15+. |
| **التنسيق والتصميم (Styling)** | **Tailwind CSS v4** + `@tailwindcss/postcss` | الانتقال لـ Tailwind v4 `@theme` في `globals.css`. |
| **إدارة الحالة (State Management)** | **Zustand v5.0.14** | ثلاث مخازن منفصلة: `useAuthStore`، `useCartStore`، `useWishlistStore`. |
| **الذكاء الاصطناعي (AI)** | **`@google/generative-ai`** (Gemini 1.5 Flash) | مسار خادم `/api/chat/route.ts` لخدمة المساعد الذكي. |
| **التدويل واللغات (i18n)** | مجلد مسارات `[lang]` (عربي `ar` / إنجليزي `en`) | قواميس `ar.json` و `en.json` مع دعم اتجاه النصوص RTL / LTR. |

> [!NOTE]
> ملف [README.md](file:///c:/Users/youse/OneDrive/Desktop/projact/README.md) يذكر شارات قديمة غير مطابقة للواقع (يذكر Next.js 14+ و React 18 و Tailwind 3.4 بينما المشروع يستخدم فعلياً Next.js 16 و React 19 و Tailwind 4).

---

## 2. المشاكل البرمجية الحرجة (Critical Bugs)

### 🔴 2.1 ضياع توكن المصادقة وفشل الطلبات المحمية (Token Desynchronization)
* **المشكلة:**
  في [src/lib/api.ts](file:///c:/Users/youse/OneDrive/Desktop/projact/src/lib/api.ts#L13-L22)، يعتمد الـ Interceptor على استرجاع التوكن عبر:
  ```ts
  const token = localStorage.getItem('token');
  ```
  بينما مخزن المصادقة [src/store/useAuthStore.ts](file:///c:/Users/youse/OneDrive/Desktop/projact/src/store/useAuthStore.ts#L94-L96) يستخدم ملحق الحفظ `persist` من Zustand باسم `'bastah-auth-storage'`.
  وبالتالي: **لا يتم أبداً تخزين مفتاح اسمه `token` في الـ LocalStorage مباشرة**، بل يكون محفوظاً ككائن JSON بداخل `bastah-auth-storage`.
* **النتيجة:**
  قيمة `token` المسترجعة في `api.ts` تكون دائماً `null`، وأي طلب يحتاج مصادقة يتم عبر `api.ts` سيفشل بكود `401 Unauthorized`!
* **مشكلة إضافية:**
  `useAuthStore` يقوم بتعيين الرأس:
  ```ts
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  ```
  لكن هذا التعيين يذهب لنسخة `axios` العامة الافتراضية، بينما `api.ts` و `useCartStore.ts` ينشئان نسخاً مستقلة عبر `axios.create(...)`، والتي لا ترث هذه التعديلات اللاحقة.

---

### 🔴 2.2 شات الذكاء الاصطناعي في صفحة `ai/page.tsx` مزيف بالكامل
* **المشكلة:**
  في صفحة [src/app/[lang]/ai/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/ai/page.tsx#L60-L79):
  عندما يرسل المستخدم رسالة، لا يتم استدعاء الـ API الداخلي `/api/chat` إطلاقاً، بل توجد دالة محاكاة بمؤقت زمني:
  ```ts
  // Simulate AI response
  setTimeout(() => {
    const aiResponses = isAr ? [
      'عظيم! جاري البحث في آلاف المنتجات عبر منصتنا...',
      'لقد وجدت بعض الخيارات الممتازة التي قد تنال إعجابك. سأعرضها لك الآن.',
      'طلبك قيد المعالجة! بسطة توفر دائماً أفضل المتاجر المحلية بأفضل الأسعار.'
    ] : [...];
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    ...
  }, 1500);
  ```
* **النتيجة:** المستخدم يتلقى نصوصاً وهمية عشوائية دائماً ولا يتحدث مع Gemini الحقيقي!
* **المفارقة:** في الزر العائم [FloatingButton.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/layout/FloatingButton.tsx#L46-L53)، يتم استدعاء `/api/chat` بالفعل، ما يعني وجود تضارب وتكرار عشوائي في السلوك بين الصفحة والزر.

---

### 🔴 2.3 حساب وحسابات السلة تخالف منطق التوصيل والمتاجر
* **المشكلة في [src/app/[lang]/cart/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/cart/page.tsx#L23-L25):**
  تم وضع تكلفة شحن ثابتة عشوائية بـ 15 شيكل:
  ```ts
  const subtotal = getTotalPrice();
  const shipping = items.length > 0 ? 15 : 0;
  const total = subtotal + shipping;
  ```
  وكذلك دمج إجمالي المتاجر المتعددة في رقم واحد `total`.
* **التعارض:** بحسب ميثاق المشروع في `FRONTEND_HANDOFF.md`:
  1. رسوم التوصيل خاصة بكل متجر وبكل منطقة (`delivery-zones`) وليست رقماً موحداً ثابتاً.
  2. يُمنع جمع طلبات المتاجر المختلفة في رقم حسابي واحد يوهم العميل بأنه سيدفعها معاً، لأن الدفع نقدي منفصل لكل متجر على حدة.

---

### 🔴 2.4 زر الإضافة للسلة في تفاصيل المتجر معطل ولا يحمل معرف الإدراج (Listing ID)
* **المشكلة:**
  في صفحة [src/app/[lang]/shops/[shopId]/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/shops/[shopId]/page.tsx#L22-L30):
  يتم جلب قائمة عروض المتجر عبر `getShopProducts(shopId)`، لكن عند تحويل البيانات يتم تعيين:
  ```ts
  products = listings.map((l: any) => ({
    id: l.product._id, // <-- أخذ معرف المنتج وتجاهل معرف العرض l._id
    ...
  }))
  ```
  وعند الانتقال إلى مكون كارت المنتج [src/components/shops/ProductCard.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/shops/ProductCard.tsx#L96):
  ```ts
  <motion.button 
    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
    ...
  ```
  زر السلة لا ينفذ أي شيء إطلاقاً (`preventDefault` فقط)، وحتى لو أراد الإضافة للسلة، فإن الـ Backend يطلب `listing` (معرف العرض) وليس `productId`!

---

## 3. التعارضات الجوهرية مع قواعد المنصة وميثاق العمل
وفقاً للوثيقة المرجعية الرسمية للمشروع **`FRONTEND_HANDOFF.md`** التي تحدد القواعد الصارمة للمنصة:

### ⚠️ 3.1 قاعدة "لا أموال ولا بطاقات إلكترونية إطلاقاً"
* **القاعدة:**
  > *"No money moves through the app. Ever. An order is a connection / reservation request... settle in cash, in person. Never build a payment button, card form, or payment icons."*
* **المخالفات المرصودة في الكود:**
  1. في الفوتر [Footer.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/layout/Footer.tsx#L76-L77)، تم وضع أيقونات بطاقات الائتمان والمحافظ الإلكترونية:
     `<CreditCard className="w-5 h-5" />` و `<Wallet className="w-5 h-5" />`!
  2. في صفحة تفاصيل المنتج [ProductDetails.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/products/ProductDetails.tsx#L221)، يوجد شارة ثقة باسم:
     `Secure Payment` مع أيقونة درع أمان.
  3. في صفحة الدفع [checkout/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/checkout/page.tsx#L201)، عنوان الصفحة:
     `Secure Checkout` / `إتمام الطلب بأمان`، بينما هو مجرد حجز وتأكيد طلب.

### ⚠️ 3.2 قاعدة العملة الموحدة (الشيكل ₪ / ILS)
* **القاعدة:**
  > *"Currency is the Israeli Shekel (₪ / ILS)... Never show $ or any other currency."*
* **المخالفات المرصودة:**
  في ملف الترجمة العربية [ar.json](file:///c:/Users/youse/OneDrive/Desktop/projact/src/i18n/dictionaries/ar.json#L95):
  `"currency": "ر.س"` (ريال سعودي)!
  وفي ملف الترجمة الإنجليزية [en.json](file:///c:/Users/youse/OneDrive/Desktop/projact/src/i18n/dictionaries/en.json#L95):
  `"currency": "SAR"`!
  وهذا يُظهر أسعار منتجات المتاجر بالريال السعودي بدلاً من الشيكل الفلسطيني/الإسرائيلي المعتمد في غزة.

---

## 4. الميزات الوهمية أو غير المكتملة (Dummy & Unfinished Features)

1. **نموذج تقييم المتاجر (Shop Reviews):**
   في [ShopTabs.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/shops/ShopTabs.tsx#L136)، الزر يحتوي على تعليق صريح:
   `// Here you would normally send the data to your backend`
   ويقوم فقط بضبط `setIsSubmitted(true)` بالذاكرة دون إرسال الطلب إلى `POST /api/shops/:shopId/reviews`. كما أن تبويب المراجعات لا يعرض أي تقييمات سابقة من الباك إند (`GET /api/shops/:shopId/reviews`).
2. **أزرار تسجيل الدخول الاجتماعي (Social Logins):**
   في [SocialLogin.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/auth/SocialLogin.tsx#L18-L55)، أزرار Google و Facebook مجرد عناصر واجهة بدون أي دالة `onClick` أو تكامل مع مزود مصادقة.
3. **أزرار الأسهم في المنتجات الرائجة (Trending chevrons):**
   في [TrendingProducts.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/home/TrendingProducts.tsx#L48-L53)، توجد أزرار أسهم يمين ويسار للإيهام بوجود سلايدر، لكنها لا تحتوي على أي معالج أحداث (`onClick`)، والشبكة أسفلها شبكة ثابتة Grid وليست Carousel.
4. **زر المفضلة في صفحة تفاصيل المنتج:**
   في [ProductDetails.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/products/ProductDetails.tsx#L134-L136)، أيقونة القلب على الصورة الرئيسية مجرد `<div>` بدون `onClick` ولا تتصل بـ `useWishlistStore`.
5. **فلترة وترتيب البحث (Sort by):**
   في [SearchResults.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/search/SearchResults.tsx#L50)، قائمة الترتيب حسب السعر (من الأقل للأعلى أو العكس) تغير المتغير `sortBy`، ولكن استدعاء `searchProducts` يُمرر المعاملين الأولين فقط ويهمل خيار الترتيب!
6. **زر تعديل الملف الشخصي:**
   في [profile/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/profile/page.tsx#L122)، زر "تعديل / Edit" لا يقوم بأي عمل ولا يفتح نموذج تعديل.
7. **لوحة تحكم التاجر (Seller Dashboard):**
   في [seller/dashboard/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/seller/dashboard/page.tsx#L105-L125)، الأرقام بالكامل ثابتة ومصطنعة (24,500 ₪، 142 طلب، 45 منتج)، والطلبات الحديثة فارغة دائماً ولا تجلب الطلبات الواردة من `GET /api/orders/incoming`.

---

## 5. مشاكل التوجيه والروابط المكسورة (Routing & Broken Links)

### 🔗 5.1 روابط الفوتر المكسورة بسبب نسيان خاصية `lang`
* في [src/app/[lang]/layout.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/layout.tsx#L51):
  يتم استدعاء المكون: `<Footer dict={dict} />` بدون تمرير `lang`.
* في [src/components/layout/Footer.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/layout/Footer.tsx#L37-L40):
  تُبنى الروابط بالشكل: `<Link href={'/${lang}#about'}>`.
* **النتيجة الكارثية:** الروابط تظهر في المتصفح هكذا:
  `/undefined#about`، `/undefined#contact`، `/undefined/shops`، `/undefined#offers`!

### 🔗 5.2 روابط تؤدي إلى صفحات خطأ 404
* في لوحة تحكم التاجر [seller/dashboard/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/seller/dashboard/page.tsx#L87):
  زر "إضافة منتج جديد" يوجه إلى:
  `/${lang}/seller/products/new`
  **هذا المسار غير موجود إطلاقاً في مجلد المشروع**، والنقر عليه يؤدي إلى صفحة 404 Not Found!
* في [Navbar.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/layout/Navbar.tsx#L307):
  رابط "بيع مع بسطة / Sell with Us" يحمل `href="#"` ميت ولا يوجه إلى `/seller/login`.
* في [Hero.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/home/Hero.tsx#L60-L66):
  الزران "تسوق الآن" و "اكتشف المزيد" يوجهان لنفس الرابط تماماً: `/${lang}/shops`.

---

## 6. الملفات المهملة والمكررة (Dead & Orphaned Code)

1. **[src/components/home/Categories.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/home/Categories.tsx):**
   مكون كامل مبني ومكتوب بعناية مع أيقونات Framer Motion للأقسام، لكنه غير مستدعى في الصفحة الرئيسية [page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/page.tsx) ولا في أي مكان آخر!
2. **[src/components/shops/ShopsHeader.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/shops/ShopsHeader.tsx):**
   مكون بانر ترويجي كبير للمتاجر، غير مستخدم في أي صفحة، ويحتوي على روابط وهمية بأرقام غير صحيحة (`/shops/1`, `/shops/2`, `/shops/3`) ستسبب أخطاء `Invalid ObjectId` لو استدعيت.
3. **مكونان مختلفان يحملان نفس الاسم `ProductCard.tsx`:**
   - الأول: [src/components/products/ProductCard.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/products/ProductCard.tsx) (يعتمد على واجهة Product ومربوط بالمفضلة).
   - الثاني: [src/components/shops/ProductCard.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/shops/ProductCard.tsx) (يعتمد على واجهة قديمة برقم `id: number` وزر سلة معطل).
4. **[src/components/ui/Pagination.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/ui/Pagination.tsx):**
   مكون ترقيم الصفحات موجود ومصمم بشكل ممتاز، لكنه غير مستخدم في صفحة المنتجات `products/page.tsx` ولا في صفحة البحث `SearchResults.tsx`.
5. **ملفات تجريبية متروكة في جذر المشروع:**
   - `p.json` (بيانات JSON مؤقتة).
   - `product.json` (ملف فارغ بحجم 0 بايت).

---

## 7. جودة الكود، الأداء ومعايير TypeScript/ESLint

### ⚠️ فحص ESLint كشف عن 158 مشكلة (90 خطأ + 68 تحذير):
1. **أخطاء React 19 المحدثة (`react-hooks/set-state-in-effect`):**
   استخدام متكرر لـ:
   ```ts
   useEffect(() => { setMounted(true); }, []);
   ```
   في معظم مكونات العميل لتفادي مشاكل الـ Hydration يسبب إعادة تصيير متتالية (Cascading Re-renders) تعاقب عليها معايير React 19 الحديثة.
2. **استخدام مفرط لنوع `any`:**
   أكثر من 80 موضعاً يستخدم `dict: any`، `params: Promise<any>`، `error: any`، مما يلغي فائدة TypeScript في التحقق من صحة الحقول.
3. **أداء الصور (`@next/next/no-img-element`):**
   استخدام وسوم `<img>` التقليدية مع صور خارجية ضخمة من Unsplash و Picsum بدلاً من `<Image />` من `next/image`، مما يؤدي إلى:
   - تحميل صور بأحجام ميغابايت كاملة دون ضغط أو تحويل لصيغ WebP/AVIF.
   - تراجع حاد في نقاط Core Web Vitals وخاصة LCP (Largest Contentful Paint).
4. **تنبيهات البناء في TypeScript:**
   ملف `.next/types/validator.ts` يشتمل على مسارات لصفحات قديمة تم حذفها (`checkout/delivery`, `checkout/payment`, `product/[productId]`)، مما يتطلب تنظيف مجلد `.next` وإعادة توليده.

---

## 8. الأمان والبيئة والمتغيرات (Environment & Security)

1. **غياب المتغير العام لرابط الـ API:**
   الرابط:
   `https://bastah-backend.onrender.com/api`
   مكتوب كنص ثابت (Hardcoded) في أكثر من 8 ملفات مختلفة. يجب نقله فوراً إلى `.env.local` كـ `NEXT_PUBLIC_API_URL` حتى يسهل التبديل إلى الخادم المحلي `http://localhost:3000/api` أثناء التطوير، أو أي سيرفر إنتاجي آخر.
2. **شات الذكاء الاصطناعي بدون Rate Limiting أو حماية:**
   المسار [src/app/api/chat/route.ts](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/api/chat/route.ts) مفتوح لأي شخص بدون قيود أو مصادقة، ولا يوجد فيه حظر لتكرار الطلبات (Rate Limit)، ما قد يستهلك رصيد Gemini API بسرعة في حال استغلاله.
3. **استخدام `alert()` و `confirm()` في المتصفح:**
   في [SignupForm.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/components/auth/SignupForm.tsx#L28) و [orders/page.tsx](file:///c:/Users/youse/OneDrive/Desktop/projact/src/app/[lang]/orders/page.tsx#L62)، يتم استخدام تنبيهات المتصفح القديمة `alert()` و `confirm()` بدلاً من الـ Toasts المتوفرة بالفعل بالمشروع عبر مكتبة `react-hot-toast`.

---

## 9. خطة العمل والتوصيات ذات الأولوية (Action Plan)

لإعداد هذا المشروع لمستوى الإنتاج (Production-Ready)، نوصي بالخطوات التالية مرتبة حسب الأهمية:

```mermaid
flowchart TD
    A["المرحلة 1: الإصلاحات الحرجة"] --> B["المرحلة 2: تصحيح قواعد العمل والعملة"]
    B --> C["المرحلة 3: إكمال الميزات المبتورة"]
    C --> D["المرحلة 4: تحسين الأداء وتوحيد الكود"]

    subgraph "المرحلة 1: الإصلاحات الحرجة"
        A1["مزامنة التوكن بين useAuthStore و api.ts"]
        A2["تمرير lang لمكون Footer لمنع الروابط المكسورة"]
        A3["ربط صفحة ai/page.tsx بمسار /api/chat الحقيقي"]
        A4["اعتماد NEXT_PUBLIC_API_URL في ملف .env"]
    end

    subgraph "المرحلة 2: تصحيح قواعد العمل والعملة"
        B1["تعديل العملة في القواميس إلى ₪ بدلاً من ر.س و SAR"]
        B2["إزالة أيقونات الدفع والبطاقات والمحافظ من الفوتر وتفاصيل المنتج"]
        B3["إلغاء رسوم الشحن الثابتة في السلة وتطبيق رسوم المتاجر المخصصة"]
    end

    subgraph "المرحلة 3: إكمال الميزات المبتورة"
        C1["ربط زر إضافة السلة في تفاصيل المتجر بمعرف الـ Listing"]
        C2["ربط إرسال التقييمات في المتجر بالـ API الحقيقي"]
        C3["إنشاء صفحة إضافة منتج للتاجر أو إخفاء الرابط المكسور"]
        C4["إتاحة شريط بحث وقائمة تنقل مخصصة للهواتف في الـ Navbar"]
    end

    subgraph "المرحلة 4: تحسين الأداء وتوحيد الكود"
        D1["دمج مكوني ProductCard في مكون واحد متماسك"]
        D2["استبدال وسوم img بمكون Image من Next.js"]
        D3["تفعيل Pagination في صفحتي المنتجات والبحث"]
        D4["تنظيف الملفات المؤقتة p.json و product.json وحذف الكود المهمل"]
    end
```

---
*تم إعداد هذا التقرير بدقة متناهية عبر مراجعة جميع ملفات المشروع سطراً بسطر لمطابقتها مع المعايير البرمجية وأفضل الممارسات.*
