# MASTER_PROJECT_PLAN.md

# الخطة الرئيسية النهائية لمشروع لعبة الجوال الاستراتيجية باستخدام OpenCode + DeepSeek + Spec Kit

> هذا الملف هو **مصدر الحقيقة النهائي** للمشروع.  
> أي وكيل داخل OpenCode يجب أن يقرأ هذا الملف قبل العمل، ثم يقرأ الملفات التنفيذية الأخرى مثل `GAME_CONSTRAINTS.md` و`SPEC_TREE_RULES.md` و`CONTINUITY_PROTOCOL.md`.  
> الهدف من هذا الملف هو منع النسيان، منع التناقض، ومنع أن يبدأ الذكاء من الصفر بعد أي انقطاع.

---

## 1. ملخص المشروع

نريد بناء **لعبة جوال استراتيجية Multiplayer**، لكن لا نريد تحديد شكل اللعبة يدويًا من البداية.  
تصميم اللعبة، قواعدها، أنظمتها، وطريقة الفوز يجب أن تخرج من خلال **Spec Kit** وليس من تخمين مباشر.

المشروع سيُبنى باستخدام:

- **GitHub Codespaces** للتشغيل أونلاين.
- **OpenCode** لإدارة الوكلاء وتنفيذ العمل.
- **DeepSeek** كمزود نموذج الذكاء الاصطناعي.
- **Spec Kit** لفرض منهجية المواصفات والتخطيط والمهام والتنفيذ.
- **Expo React Native + TypeScript** كتوجه تقني مبدئي لتطبيق الجوال.
- **Git checkpoints** للحفظ والاستكمال.
- **Recursive Spec Kit Tree** لتحليل المشروع بعمق عبر شجرة تفريعات.

---

## 2. القرارات النهائية المعتمدة

### 2.1 بيئة التشغيل

- التشغيل سيكون أونلاين عبر **GitHub Codespaces**.
- المستخدم لا يريد الاعتماد على جهاز ويندوز أثناء التشغيل.
- Codespaces هو بيئة التطوير السحابية.
- OpenCode يعمل داخل الطرفية في Codespaces.
- DeepSeek يعمل كمزود الذكاء داخل OpenCode.

### 2.2 الذكاء المستخدم

- المستخدم يستخدم **DeepSeek V4 Flash Free** بوضع **Max** حسب الصورة التي تم رفعها.
- هذا الموديل مقبول كبداية.
- لأنه قد يعطي مخرجات مختصرة أو سطحية أحيانًا، تم اعتماد قاعدة:
  **Model Shallow Output Handling Rule**.

### 2.3 التقنية المبدئية

التقنية المفضلة للمشروع:

- Expo React Native
- TypeScript
- Zustand لإدارة الحالة
- React Native SVG إذا احتاجت اللعبة رسومات خريطة أو لوحة أو مناطق
- Jest للاختبارات
- Mock Multiplayer أولًا
- Supabase Realtime لاحقًا للملتي بلاير الحقيقي إذا احتاج المشروع

> Spec Kit يمكنه اقتراح بديل تقني فقط إذا كان هناك سبب قوي وموثق في `DECISIONS.md`.

### 2.4 ترتيب مصادر الحقيقة عند التعارض

إذا ظهر تعارض بين الملفات، يتم اعتماد هذا الترتيب:

1. `MASTER_PROJECT_PLAN.md`
2. `GAME_CONSTRAINTS.md`
3. `SPEC_TREE_RULES.md`
4. `CONTINUITY_PROTOCOL.md`
5. `SYSTEM_CONTRACTS.md`
6. `DECISIONS.md`
7. ملفات العقد داخل `.spec-tree/`
8. الكود الحالي

أي تعارض يجب ألا يُحل بالتخمين.
يجب توثيق الحل في `DECISIONS.md`، وتحديث الملفات المتأثرة، ثم إنشاء checkpoint.

### 2.5 استخدام Spec Kit بأكبر قدر مفيد

الهدف هو استخدام Spec Kit بشكل كامل ومفيد، وليس مجرد تشغيل أوامر كثيرة بلا نتيجة.

الأوامر الأساسية المطلوبة في الجذر وكل عقدة مناسبة:

1. `/speckit.constitution`
2. `/speckit.specify`
3. `/speckit.clarify`
4. `/speckit.plan`
5. `/speckit.tasks`
6. `/speckit.analyze`
7. `/speckit.checklist`
8. `/speckit.implement` أو ما يعادلها للعقد الداخلية إذا لم تستطع slash commands استهداف مجلد العقدة مباشرة

الاستخدام الاختياري:

- `/speckit.taskstoissues` يمكن استخدامه بعد استقرار المهام إذا كان تحويل المهام إلى GitHub Issues سيساعد المتابعة.
- لا يستخدم إذا كان سيزيد الإدارة والتشتيت بلا فائدة واضحة.

Presets وExtensions:

- يمكن للذكاء البحث عنها أو اقتراحها فقط إذا كان لها فائدة مباشرة للمشروع.
- قبل إضافة أي preset أو extension، يجب تقييمه حسب: الفائدة، الضرر المحتمل، هل يناسب المشروع، هل يُنصح به.
- أي إضافة يجب توثيقها في `DECISIONS.md`.


---

## 3. حدود ما لا نريد إضافته

هذه الأشياء **لا تُضاف للخطة** لأنها قد تقيّد المشروع أو تزيد التعقيد بلا فائدة كافية:

1. **Playable Vertical Slice Rule**
   - تم رفضه لأنه قد يضغط الذكاء لبناء نسخة مبكرة جدًا ويقيد حرية التحليل والتفرع.
   - يمكن بناء Prototype لاحقًا، لكن لا نضيف قاعدة إجبارية مبكرة.

2. **موعد نهائي صارم**
   - لا نريد ضغطًا زمنيًا يضعف الجودة.

3. **حد ثابت للفروع**
   - لا يوجد حد رقمي للفروع.
   - الحد الوحيد هو الضرورة والجودة وعدم التكرار.

4. **Security Secrets Rule كملف مستقل**
   - تم عدم اعتماده ضمن آخر طلب من المستخدم.
   - مع ذلك، يظل من الممارسات الجيدة عدم وضع مفاتيح API في Git، لكن لا نضيفه كملف إلزامي مستقل في هذه الخطة.

5. **RISKS.md**
   - لا يضاف كملف مستقل.

6. **No BLOCKED Forward Rule كقاعدة مستقلة**
   - لا يضاف كملف مستقل.
   - لكن مراجعات QA/Reviewer/Integration تبقى معتبرة ضمن سير العمل العام.

7. **scripts/health.sh**
   - لا يضاف.

8. **Mobile Performance Budget كشرط مستقل**
   - لا يضاف.

---

## 4. قاعدة الاقتراحات المستقبلية

أي اقتراح جديد يجب تقييمه بهذه الطريقة قبل اعتماده:

1. الفائدة
2. الضرر المحتمل
3. هل يناسب هذا المشروع؟
4. هل يُنصح به أم لا؟

لا يتم إضافة اقتراحات جديدة لمجرد أنها تبدو جيدة.  
يجب مقارنة المنافع بالمخاطر، لأن بعض الإضافات قد تضر حرية المشروع أو تزيد التعقيد.

---

## 5. هوية اللعبة النهائية المطلوبة

اللعبة ليست مقيدة بأنها لعبة سيطرة مناطق.

التصحيح النهائي:

- اللعبة يجب أن تكون **استراتيجية**.
- لا يجب أن تكون **Area Control** بالضرورة.
- Spec Kit هو الذي يختار أفضل هيكل استراتيجي.
- يمكن أن تكون:
  - استراتيجية أهداف
  - تكتيك لوحة
  - نفوذ مناطق
  - موارد
  - مسارات
  - تخطيط متزامن
  - تكتيك فرق
  - نظام هجين
- المهم ألا تكون:
  - لعبة سرعة ورد فعل
  - لعبة نقاط سطحية
  - لعبة خطة واحدة مكررة تفوز دائمًا

---

## 6. شروط اللعبة الأساسية

يجب أن تلتزم اللعبة بالشروط التالية:

1. اللعبة استراتيجية وليست سرعة أو رد فعل.
2. تعتمد على اختيارات دقيقة ذات نتائج واضحة.
3. تحتوي على Multiplayer.
4. لا يوجد انتظار للدور؛ كل اللاعبين يخططون أو يلعبون في نفس الوقت.
5. سهلة الفهم والدخول في جوها بسرعة.
6. لا تكون معقدة أو مليئة بأنظمة كثيرة.
7. لا تحتوي على إدارة مرهقة أو تفاصيل زائدة.
8. المباراة الواحدة تنتهي خلال 30 دقيقة كحد أقصى.
9. ظروف المباراة تتغير بحيث لا يكون نفس الاختيار هو الصحيح دائمًا.
10. اللاعب المتأخر يستطيع العودة والمنافسة بقوة حتى النهاية.
11. المنافسة تبقى قوية حتى نهاية المباراة.
12. تدعم 4 لاعبين.
13. تدعم اللعب كتيم، خصوصًا 2 ضد 2.
14. تدعم كل لاعب لوحده، خصوصًا 1 ضد 1 ضد 1 ضد 1.
15. يجب أن تكون لعبة استراتيجية حيث يعتمد الفوز على التخطيط، التمركز، التوقيت، استخدام الموارد، الاختيارات التكتيكية، التحكم بالأهداف، أو أي نظام استراتيجي يحدده Spec Kit.
16. لا تكافئ الاختباء أو الانتظار السلبي حتى آخر المباراة.
17. اللعب النشط طوال المباراة مهم للفوز.
18. هدف الفوز واضح جدًا ويفهمه اللاعب الجديد بسرعة.
19. لا تنتهي المباراة مبكرًا بسبب وصول لاعب لهدف الفوز قبل الوقت.
20. تبقى المباراة مفتوحة حتى الجولات الأخيرة أو حتى النهاية.
21. أي لوحة، خريطة، مسارات، مناطق، أهداف، وحدات، موارد، أو مساحات تكتيكية يجب أن تكون لها أهمية عملية في قرارات اللاعب.
22. النتيجة يجب أن تكون قابلة للتقلب حتى نهاية المباراة.

> الشرط القديم الذي كان يقول إن الفوز يجب أن يرتبط بالسيطرة الفعلية على الخريطة أو منطقة حاسمة تم حذفه.  
> كما تم تغيير كل القيود المرتبطة بـ “سيطرة مناطق” إلى “لعبة استراتيجية”.

---

## 7. شروط منع الاستراتيجية الواحدة المهيمنة

يجب ألا تكون هناك خطة واحدة تحفظها وتفوز بها دائمًا.

الشروط:

1. لا توجد استراتيجية صحيحة دائمًا.
2. القرار الأفضل يجب أن يعتمد على حالة المباراة الحالية.
3. يجب أن يتأثر القرار بالموقع، التوقيت، الخصوم، نمط اللعب، الأهداف، والموارد.
4. الخطة التي تنجح في موقف يجب أن تكون قابلة للمواجهة في موقف آخر.
5. يجب أن تتغير ظروف المباراة لتجبر اللاعبين على التكيف.
6. نفس افتتاحية اللعب لا يجب أن تعطي أفضلية قوية دائمًا.
7. نفس خطة نهاية المباراة لا يجب أن تضمن الفوز دائمًا.
8. Balance Simulator يجب أن يختبر الاستراتيجيات المهيمنة.
9. إذا فازت استراتيجية واحدة كثيرًا عبر محاكاة متعددة، يجب اعتبار ذلك مشكلة توازن.
10. البوتات يجب أن تستخدم أنماطًا استراتيجية مختلفة لاختبار التنوع.
11. لا يعطي Reviewer موافقة نهائية إذا كان الفوز يعتمد على تكرار نفس الخطة المثلى.

---

## 8. دعم اللغات والستايل العربي

اللعبة يجب أن تكون:

1. ذات **ستايل عربي بصريًا وثقافيًا**.
2. تدعم العربية والإنجليزية.
3. العربية تدعم RTL بشكل صحيح.
4. الإنجليزية تدعم LTR بشكل صحيح.
5. دعم العربية والإنجليزية يجب أن يكون من البداية، لا يضاف في النهاية.
6. لا يسمح بكتابة نصوص واجهة للمستخدم hardcoded داخل المكونات.
7. كل النصوص المواجهة للاعب يجب أن تمر عبر نظام localization.
8. يجب وجود `DESIGN_SYSTEM.md` لتوثيق:
   - الستايل العربي
   - الألوان
   - الخطوط
   - الأيقونات
   - التباعد
   - قواعد RTL/LTR
   - اعتبارات Android/iOS
   - قواعد النصوص

---

## 9. دعم المنصات

اللعبة يجب أن تدعم:

- Android
- iPhone / iOS

التقنية المبدئية:

- Expo React Native + TypeScript

كل قرار UI أو تفاعل يجب ألا يفترض منصة واحدة فقط إلا إذا تم توثيق ذلك.

## 9a. Art, Audio, Motion, and Game Feel

هذا النظام هو فرع أساسي في Recursive Spec Kit Tree بجانب Core Game Logic و UI و Bots و Multiplayer و Localization و Balance.

يجب أن يمر بدورة Spec Kit كاملة بقيادة @art-audio-motion-director.

المتطلبات الأساسية موثقة في GAME_CONSTRAINTS.md (Art, Audio, Motion, and Game Feel Requirements) و ASSET_PIPELINE.md و DESIGN_SYSTEM.md.

---

## 10. Multiplayer

اللعبة يجب أن تدعم Multiplayer.

الترتيب المعتمد:

1. **Mock Multiplayer أولًا**
   - يسمح باختبار المنطق محليًا.
   - يسمح بتجربة لاعبين وهميين أو بوتات.
   - لا يعلق المشروع بسبب السيرفر.

2. **Supabase Realtime لاحقًا**
   - يتم تجهيز Adapter أو خطة واضحة له.
   - لا يكون شرطًا مبكرًا يعطل النموذج الأولي.

اللعبة يجب أن تدعم:

- 4 لاعبين
- 2v2
- FFA / 1v1v1v1
- تخطيط أو فعل متزامن بدون انتظار أدوار

---

## 11. البوتات

يجب دعم اللعب مع بوتات.

### 11.1 شروط البوتات

1. يمكن اللعب ضد البوتات.
2. يمكن للبوتات ملء أماكن اللاعبين الناقصين.
3. البوتات تعمل في FFA.
4. البوتات تعمل في 2v2.
5. البوتات تعمل مع Mock Multiplayer.
6. البوتات تستخدم في Balance Simulator.
7. البوتات لا تغش بقراءة معلومات مخفية إلا إذا سمح التصميم بذلك ووثقه.
8. البوتات تتبع نفس قواعد البشر.
9. البوتات استراتيجية وليست قائمة على السرعة أو رد الفعل.

### 11.2 مستويات الصعوبة

يجب وجود المستويات التالية على الأقل:

- Easy
- Normal
- Hard
- Expert

الصعوبة تتحكم في جودة القرار، مثل:

- تقييم المخاطر
- فهم التوقيت
- توقع الخصم
- استغلال الأهداف
- التعاون في 2v2
- عدم ارتكاب أخطاء واضحة

### 11.3 أنماط البوتات

يجب ألا تكون البوتات مختلفة بالصعوبة فقط، بل بالأسلوب أيضًا.

أمثلة:

- Aggressive
- Defensive
- Balanced
- Disruptive
- Objective-focused
- Comeback-focused
- Team-support

الصعوبة = جودة القرار.  
الأسلوب = شخصية واستراتيجية اللعب.

---

## 12. Balance Simulator

يجب وجود محاكي توازن أو اختبارات توازن.

وظيفته:

1. تشغيل مباريات كثيرة.
2. اختبار Active vs Passive.
3. اختبار Early Leader Advantage.
4. اختبار Comeback Possibility.
5. اختبار FFA.
6. اختبار 2v2.
7. اختبار مستويات البوتات.
8. اختبار أنماط البوتات.
9. اختبار طول المباراة.
10. اختبار أن النتيجة تبقى مفتوحة للنهاية.
11. اختبار أن القرارات الاستراتيجية هي التي تحسم، وليس الحظ أو خطة واحدة.

يجب اختبار استراتيجيات متعددة مثل:

- هجومية
- دفاعية
- تخريبية
- تركيز أهداف
- رجوع من التأخر
- دعم الفريق
- لعب سلبي
- لعب متكيف مختلط

إذا فازت استراتيجية واحدة باستمرار في ظروف متعددة، يجب أن يرجع Balance Analyst بـ BLOCKED.

---

## 13. Recursive Spec Kit Tree

هذا هو قلب المشروع.

### 13.1 الفكرة

نطبق Spec Kit على:

1. المشروع الكامل
2. الفروع التي تظهر من المشروع الكامل
3. الفروع الأصغر التي تظهر من الفروع
4. فروع أعمق حتى حد أقصى 4 مستويات

كل عقدة أو فرع يعامل كمشروع صغير له دورة Spec Kit كاملة.

### 13.2 العمق

العمق الأقصى:

```text
MAX_DEPTH = 4
```

المستويات:

- Root = المشروع الكامل
- Level 1 = فروع رئيسية
- Level 2 = فروع أصغر
- Level 3 = تفاصيل أعمق
- Level 4 = آخر مستوى مسموح

### 13.3 عدد الفروع

لا يوجد حد ثابت للفروع.

لكن:

- ممنوع الفروع المكررة
- ممنوع الفروع الزخرفية
- ممنوع الفروع التي لا تساعد التنفيذ
- ممنوع الفروع التي فقط تكرر هدفًا عامًا
- كل فرع يجب أن يثبت ضرورته

### 13.4 Branch Necessity Rule

يسمح بفرع جديد فقط إذا حقق واحدًا على الأقل:

1. يمثل نظامًا مستقلًا يمكن تخطيطه وتنفيذه.
2. يقلل تعقيد الأب.
3. يحل مشكلة حقيقية في التصميم، التقنية، اللعب، البوتات، التوازن، اللغات، الاختبار، التوثيق، أو الدمج.
4. يمنع تضاربًا مستقبليًا بين أجزاء المشروع.

يرفض الفرع إذا:

1. يكرر الأب.
2. يعيد صياغة أهداف عامة فقط.
3. لا ينتج مهام تنفيذ.
4. لا يؤثر على اللعبة النهائية.
5. أنشئ فقط لزيادة عدد فروع Spec Kit.

---

## 14. دورة Spec Kit لكل عقدة

كل عقدة يجب أن تمر بالآتي:

1. constitution
2. specify
3. clarify
4. plan
5. tasks
6. analyze
7. checklist
8. implement أو implementation instructions حسب حجم العقدة
9. QA
10. review
11. integration notes
12. documentation notes
13. `NODE_SUMMARY.md`

### توضيح مهم عن root implement

عند تشغيل `/speckit.implement` في المشروع الرئيسي، لا يعني ذلك تنفيذ كل اللعبة مباشرة.

المقصود في الجذر:

- تجهيز الاتجاه العام
- بناء الهيكل عند الحاجة
- تحديد القبول
- تحديد التكامل
- تجهيز الفروع

التنفيذ الفعلي يجب أن يحدث غالبًا في leaf nodes.

---

## 15. Definition of Done لكل عقدة

لا تعتبر أي عقدة مكتملة إلا إذا تحتوي:

1. غرض واضح.
2. رابط واضح بمتطلبات الأب.
3. Spec Kit artifacts كاملة.
4. Acceptance criteria.
5. Implementation tasks.
6. Integration notes.
7. Test notes.
8. QA result.
9. Review result.
10. لا يوجد تضارب غير محلول مع sibling nodes.
11. `NODE_SUMMARY.md`.

---

## 16. NODE_SUMMARY.md

كل عقدة يجب أن تحتوي ملف:

```text
NODE_SUMMARY.md
```

ويشمل:

1. Purpose
2. Parent link
3. Decisions made
4. Alternatives rejected
5. Dependencies
6. Integration risks
7. Implementation status
8. Tests
9. Next step

هذا الملف ضروري للاستكمال بعد الانقطاع ولمنع نسيان سياق كل فرع.

---

## 17. Model Shallow Output Handling Rule

تم اعتماد هذا الشرط فقط من آخر مجموعة اقتراحات.

إذا كان مخرج النموذج:

- مختصرًا جدًا
- سطحيًا
- مكررًا
- يتجنب التفاصيل
- يفشل مرتين في نفس المهمة

يجب:

1. عدم متابعة نفس المهمة الواسعة.
2. تقسيمها إلى عقد Spec Kit أصغر.
3. تسجيل سبب التقسيم في `DECISIONS.md`.
4. تحديث `SPEC_TREE.md`.
5. تحديث `SPEC_TREE_STATUS.md`.
6. الاستمرار من العقد الأصغر.
7. عدم إنشاء فروع مكررة أو غير مفيدة.

هذا الشرط يعالج ضعف أو اختصار DeepSeek Flash Free بدون إعادة المشروع من الصفر.

---

## 18. ملفات المشروع الرئيسية

يجب إنشاء الملفات التالية:

### 18.1 ملفات الخطة والشروط

- `MASTER_PROJECT_PLAN.md`
- `GAME_CONSTRAINTS.md`
- `SPEC_TREE_RULES.md`
- `CONTINUITY_PROTOCOL.md`
- `SPEC_TREE.md`
- `SPEC_TREE_STATUS.md`

### 18.2 ملفات التتبع والدمج

- `REQUIREMENTS_TRACE.md`
- `DECISIONS.md`
- `SYSTEM_CONTRACTS.md`
- `DESIGN_SYSTEM.md`
- `PROGRESS_DASHBOARD.md`
- `PROJECT_PROGRESS.json`

### 18.3 ملفات التسليم النهائي

- `AI_HANDOFF_MANUAL.md`
- Final AI Handoff Package

### 18.4 مجلد الشجرة

```text
.spec-tree/
```

كل عقدة داخله تحتوي:

- `constitution.md`
- `spec.md`
- `clarification.md`
- `checklist.md`
- `plan.md`
- `tasks.md`
- `analysis.md`
- `NODE_SUMMARY.md`
- `implementation-result.md`
- `qa-result.md`
- `review-result.md`

---

## 19. REQUIREMENTS_TRACE.md

هذا الملف يربط كل شرط بمكان تنفيذه.

لا يسمح بـ PASS نهائي إذا كان هناك شرط غير مربوط.

كل شرط يجب أن يرتبط بـ:

1. Spec Kit node
2. Design decision
3. Implementation files
4. Tests أو validation
5. QA result
6. Reviewer result

---

## 20. DECISIONS.md

يسجل القرارات المهمة فقط، وليس كل تفصيل صغير.

كل قرار مهم يجب أن يحتوي:

1. التاريخ
2. العقدة
3. القرار
4. سبب القرار
5. البدائل المرفوضة
6. أثر القرار على الأنظمة الأخرى

يجب تسجيل خصوصًا:

- اختيار نوع اللعبة الاستراتيجية
- نظام الفوز
- نظام البوتات
- نظام الملتي بلاير
- قرارات RTL/LTR
- أي إعادة كتابة كبيرة
- أي تقسيم بسبب ضعف مخرجات النموذج
- أي تغيير في System Contracts

---

## 21. SYSTEM_CONTRACTS.md

يوثق كيف تتصل الأنظمة ببعضها.

كل نظام كبير يجب أن يحدد:

1. Inputs
2. Outputs
3. Data types
4. Events
5. State ownership
6. Dependencies
7. What it must not control
8. How it connects to other systems

أي فرع يغير contract يجب أن يحدث هذا الملف ويستدعي `@integration-architect`.

---

## 22. DESIGN_SYSTEM.md

يوثق:

1. Arabic-first visual style
2. Color direction
3. Typography direction
4. Icon style
5. UI spacing
6. Arabic RTL rules
7. English LTR rules
8. Android/iOS layout considerations
9. Player-facing text rules
10. No hardcoded UI text

---

## 23. Progress Tracking

يجب وجود:

- `PROGRESS_DASHBOARD.md`
- `PROJECT_PROGRESS.json`

النسبة ليست حكمًا نهائيًا، بل مؤشر متابعة.

يجب ألا تصل النسبة إلى 100% إلا بعد:

1. QA PASS
2. Reviewer PASS
3. Integration Architect PASS
4. AI_HANDOFF_MANUAL.md exists
5. Final AI Handoff Package complete

تقسيم مقترح للنسب:

| Area | Weight |
|---|---:|
| Main Spec Kit | 10% |
| Recursive Spec Tree | 12% |
| Game Design Decisions | 8% |
| Core Game Logic | 15% |
| Bots and AI Opponents | 10% |
| Multiplayer Mock / Online Ready | 10% |
| Arabic / English / RTL / LTR | 10% |
| Art, Audio, Motion, and Game Feel | 7% |
| Android / iOS Readiness | 4% |
| Tests / Balance Simulator / QA | 10% |
| Integration / Documentation / Handoff | 4% |

---

## 24. Continuity Protocol

إذا انقطع الاتصال أو توقف Codespaces أو تعطل OpenCode:

لا يبدأ المشروع من الصفر.

يجب قراءة:

1. `MASTER_PROJECT_PLAN.md`
2. `CONTINUITY_PROTOCOL.md`
3. `GAME_CONSTRAINTS.md`
4. `SPEC_TREE_RULES.md`
5. `SPEC_TREE_STATUS.md`
6. `SPEC_TREE.md`
7. `REQUIREMENTS_TRACE.md`
8. `DECISIONS.md`
9. `SYSTEM_CONTRACTS.md`
10. `PROGRESS_DASHBOARD.md`
11. `PROJECT_PROGRESS.json`
12. git log
13. git status
14. `.spec-tree/`

ثم يكمل من أول عنصر:

- TODO
- IN_PROGRESS
- BLOCKED

لا يبدأ من الصفر إلا إذا قال المستخدم حرفيًا:

```text
ابدأ من الصفر
```

---

## 25. Git Checkpoints

بعد كل خطوة مهمة يجب تشغيل:

```bash
./scripts/checkpoint.sh "short description"
```

خطوات مهمة تشمل:

- اكتمال root spec
- اكتمال clarify
- اكتمال plan
- اكتمال tasks
- إنشاء فرع
- اكتمال عقدة
- تنفيذ leaf
- QA
- Review
- Integration
- Documentation
- تحديث progress

---

## 26. No Big Rewrite Rule

ممنوع إعادة كتابة كبيرة إلا إذا:

1. التنفيذ الحالي مكسور بوضوح.
2. السبب موثق في `DECISIONS.md`.
3. الأنظمة المتأثرة مذكورة في `SYSTEM_CONTRACTS.md`.
4. تم إنشاء checkpoint قبل التغيير.

الأفضل دائمًا:

```text
Small fixes over large rewrites.
```

---

## 27. Do Not Accept Claims Without Artifacts

هذه قاعدة عامة على كل الوكلاء.

لا يقبل أي ادعاء مهم بدون دليل.

الأدلة المقبولة:

1. كود يعمل
2. اختبار
3. نتيجة محاكي
4. شاشة قابلة للتشغيل
5. مستند قرار
6. QA result
7. Reviewer result
8. Integration notes

أمثلة على ادعاءات لا تُقبل بلا دليل:

- اللعبة متوازنة
- العربية مدعومة
- RTL يعمل
- البوتات تعمل
- الملتي بلاير جاهز
- لا توجد استراتيجية واحدة مهيمنة
- النظام متكامل

---

## 28. Integration Architect

وكيل مسؤول عن منع التضارب.

يراجع:

- game rules
- game engine
- UI screens
- navigation
- state management
- mock multiplayer adapter
- future Supabase adapter
- bot system
- balance simulator
- localization
- RTL/LTR
- Android/iOS
- tests
- documentation
- Spec Kit artifacts
- recursive spec tree nodes
- SYSTEM_CONTRACTS.md

يرجع:

- PASS
- BLOCKED

إذا BLOCKED، يوضح التضارب والحد الأدنى للإصلاح.

---

## 29. Integration Freeze

يجب وجود مرحلة نهائية اسمها:

```text
Integration Freeze
```

لا تبدأ مبكرًا.

تبدأ فقط عندما يقرر `speckit-director` أن معظم الفروع الجوهرية اكتملت.

أثناء Integration Freeze:

1. لا ميزات جديدة.
2. لا فروع جديدة إلا لإصلاح BLOCKED.
3. فقط:
   - bug fixes
   - integration fixes
   - tests
   - documentation
   - polish
4. يجب استدعاء:
   - `@integration-architect`
   - `@qa`
   - `@reviewer`
   - `@documentation-keeper`

---

## 30. GitHub Actions CI

يجب إضافة CI لاحقًا، لكنه لا يعطل البداية.

الهدف:

- تشغيل tests
- تشغيل typecheck إذا توفر
- تشغيل lint إذا توفر

الملف المقترح:

```text
.github/workflows/ci.yml
```

لا يجب أن يمنع العمل المبكر إذا كانت أوامر lint/typecheck لم تُجهّز بعد.

---

## 31. Final AI Handoff Package

المشروع لا يعتبر مكتملًا إلا بوجود حزمة تسليم نهائية.

يجب أن تشمل:

1. `AI_HANDOFF_MANUAL.md`
2. `MASTER_PROJECT_PLAN.md`
3. `REQUIREMENTS_TRACE.md`
4. `DECISIONS.md`
5. `SYSTEM_CONTRACTS.md`
6. `DESIGN_SYSTEM.md`
7. `SPEC_TREE.md`
8. `SPEC_TREE_STATUS.md`
9. `CONTINUITY_PROTOCOL.md`
10. `PROGRESS_DASHBOARD.md`
11. `PROJECT_PROGRESS.json`

---

## 32. AI_HANDOFF_MANUAL.md

هذا هو الدليل الرسمي النهائي للمشروع واللعبة.

يجب أن يكون كافيًا لإرساله لأي ذكاء اصطناعي مستقبلًا حتى يفهم المشروع ويكمل عليه.

يجب أن يحتوي:

1. Arabic executive summary
2. English executive summary
3. Project summary
4. Game concept
5. Target platforms
6. Languages
7. Arabic-first style
8. RTL/LTR handling
9. Full game rules
10. Win condition
11. Strategic core system selected by Spec Kit
12. Multiplayer model
13. 2v2 mode
14. FFA mode
15. Bot system
16. Bot difficulty levels
17. Bot strategy styles
18. Balance simulator
19. Anti-dominant strategy testing
20. Match flow
21. Game engine architecture
22. UI architecture
23. State management
24. Mock multiplayer adapter
25. Future Supabase adapter
26. File and folder structure
27. Recursive Spec Kit tree explanation
28. Completed Spec Kit artifacts summary
29. Tests and QA approach
30. Known limitations
31. How to run the project
32. How to modify the project
33. How to add new features safely
34. How future AI assistants should continue without breaking systems

---

## 33. وكلاء OpenCode

يجب إنشاء الوكلاء التالية:

### 33.1 speckit-director

المدير الرئيسي.

مسؤول عن:

- قراءة كل ملفات الخطة
- تشغيل Spec Kit
- إدارة الشجرة
- استدعاء الوكلاء
- منع البدء من الصفر
- تحديث الحالة والتقدم
- اتخاذ قرار Integration Freeze
- التأكد من الدليل النهائي

### 33.2 recursive-spec-node

مسؤول عن عقدة واحدة في الشجرة.

يقوم بـ:

- Spec Kit كامل للعقدة
- تحديد هل تحتاج فروعًا
- إنشاء NODE_SUMMARY.md
- تحديث الحالة
- الرجوع للمدير

### 33.3 spec-critic

ينتقد مخرجات Spec Kit.

يتحقق من:

- عدم السطحية
- عدم التكرار
- الالتزام بالشروط
- عدم العودة لفكرة Area Control كقيد
- ضرورة الفروع

### 33.4 implementer

ينفذ فقط مهام صادرة من Spec Kit.

ممنوع يخترع ميزات خارج Spec Kit.

### 33.5 qa

يختبر:

- المنطق
- الملتي بلاير
- البوتات
- التوازن
- اللغات
- RTL/LTR
- Android/iOS
- عدم الاستراتيجية الواحدة

### 33.6 reviewer

يعطي PASS أو BLOCKED.

لا يعطي PASS إلا إذا:

- الشروط محققة
- اللعبة قابلة للتشغيل
- هناك منطق حقيقي
- الاختبارات موجودة
- الدليل موجود
- حزمة التسليم موجودة

### 33.7 integration-architect

يربط الأجزاء ويمنع التضارب.

### 33.8 documentation-keeper

ينشئ ويحافظ على:

- `AI_HANDOFF_MANUAL.md`
- Final AI Handoff Package

### 33.9 bot-ai-designer

يصمم البوتات:

- الصعوبات
- الأنماط
- نموذج القرار
- اختبارات البوتات

### 33.10 balance-analyst

يصمم أو يراجع:

- Balance simulator
- اختبارات منع الاستراتيجية المهيمنة
- اختبارات الرجوع من التأخر
- اختبارات اللعب السلبي

### 33.11 art-audio-motion-director

يقود فرع Art, Audio, Motion, and Game Feel System.

مسؤول عن:

- قيادة دورة Spec Kit كاملة لهذا الفرع
- الهوية البصرية العربية (ليست مجرد ترجمة)
- نظام الألوان والخطوط والأيقونات
- تنظيم assets وإنشاء placeholders قانونية
- تحديد الأصوات والحركات والانتقالات
- تحديد game feel للأحداث المهمة
- ضمان أن كل asset قانوني وموثق
- التنسيق مع UI و Localization و Android/iOS
- التأكد أن النظام يدعم وضوح القرارات الإستراتيجية ولا يشتت اللاعب

---

## 34. opencode.json

### 34.1 الصلاحيات المعتمدة

تم اعتماد خيار إعطاء OpenCode صلاحيات كاملة دفعة واحدة لتقليل المقاطعات أثناء العمل الطويل.

الإعداد المطلوب في `opencode.json` هو:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "speckit-director",
  "instructions": [
    "MASTER_PROJECT_PLAN.md",
    "CONTINUITY_PROTOCOL.md",
    "GAME_CONSTRAINTS.md",
    "SPEC_TREE_RULES.md",
    "REQUIREMENTS_TRACE.md",
    "DECISIONS.md",
    "SYSTEM_CONTRACTS.md",
    "DESIGN_SYSTEM.md"
  ],
  "snapshot": true,
  "share": "disabled",
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 10000
  },
  "permission": "allow"
}
```

### 34.2 معنى هذا القرار

هذا يعني أن OpenCode سيملك صلاحيات واسعة جدًا لتنفيذ الأوامر، تعديل الملفات، تشغيل السكربتات، تثبيت الحزم، وتشغيل الاختبارات دون طلب موافقة متكررة من المستخدم.

الهدف من ذلك:

- تقليل التوقفات أثناء دورة Spec Kit الطويلة.
- السماح للوكلاء بالعمل المتتابع دون انتظار المستخدم كل فترة.
- جعل دورة التخطيط والتنفيذ والمراجعة أقرب إلى التشغيل التلقائي.

### 34.3 خطر هذا القرار وكيف تتم مقاومته

هذا القرار أكثر خطورة من الصلاحيات المحدودة، لأنه يعطي الذكاء حرية أكبر.

لذلك يجب تعويض هذا الخطر عبر الالتزام الصارم بما يلي:

1. استخدام Git checkpoints بكثرة.
2. عدم البدء من الصفر بعد أي انقطاع.
3. تحديث `SPEC_TREE_STATUS.md` بعد كل خطوة مهمة.
4. تحديث `PROGRESS_DASHBOARD.md` و`PROJECT_PROGRESS.json`.
5. الالتزام بـ `No Big Rewrite Rule`.
6. عدم حذف عمل سابق إلا إذا كان السبب موثقًا بوضوح في `DECISIONS.md`.
7. إنشاء checkpoint قبل أي تغيير كبير.
8. الرجوع إلى Git عند حدوث تخريب أو تغيير غير مرغوب.

### 34.4 ملاحظة مهمة

رغم أن الصلاحية المعتمدة هي `permission: "allow"`، لا يزال يجب على الوكلاء الالتزام بكل قواعد الخطة، خصوصًا:

- `MASTER_PROJECT_PLAN.md` هو مصدر الحقيقة الأعلى.
- لا يتم تجاوز Spec Kit.
- لا يتم القفز إلى التنفيذ قبل التخطيط.
- لا يتم حذف أو إعادة كتابة أجزاء كبيرة دون توثيق.
- لا يتم اعتبار المشروع مكتملًا دون QA وReviewer وIntegration وDocumentation.

---

## 35. مبدأ عدم زيادة التعقيد

الخطة قوية وكبيرة، لذلك لا يتم إضافة أي ملف أو وكيل أو قاعدة جديدة إلا إذا كانت فائدتها أكبر من ضررها.

لا تتم إضافة الأشياء التالية لأنها مرفوضة أو غير معتمدة حاليًا:

- `Playable Vertical Slice Rule`
- موعد نهائي صارم
- حد ثابت للفروع
- `Security Secrets Rule` كملف مستقل
- `RISKS.md`
- `No BLOCKED Forward Rule` كقاعدة مستقلة
- `scripts/health.sh`
- `Mobile Performance Budget` كشرط مستقل

إذا اقترح وكيل إضافة شيء من هذه القائمة، يجب رفضه إلا إذا طلب المستخدم صراحة إعادة فتح النقاش حوله.

## 36. ترتيب التنفيذ من الصفر

1. إنشاء GitHub Repository.
2. فتح Codespaces.
3. تثبيت OpenCode.
4. ربط OpenCode مع DeepSeek.
5. إنشاء مشروع Expo.
6. تثبيت المكتبات الأساسية.
7. تثبيت Spec Kit باستخدام integration opencode.
8. إنشاء `MASTER_PROJECT_PLAN.md`.
9. إنشاء الملفات الرئيسية.
10. إنشاء سكربتات checkpoint/status/progress.
11. إنشاء وكلاء OpenCode.
12. إنشاء `opencode.json`.
13. عمل أول checkpoint.
14. تشغيل OpenCode.
15. إعطاء أمر البداية.
16. تشغيل root Spec Kit.
17. إنشاء الشجرة.
18. تنفيذ leaf nodes.
19. اختبار الفروع.
20. دمج الفروع.
21. Integration Freeze.
22. QA نهائي.
23. Reviewer نهائي.
24. Documentation Keeper.
25. Final AI Handoff Package.
26. playable prototype.

---

## 37. أمر البداية النهائي داخل OpenCode

عند بدء المشروع داخل OpenCode، يجب إعطاء أمر بمعنى:

```text
ابدأ العمل الآن.

لا تبدأ من الصفر أبدًا إذا وجدت عملًا سابقًا.

اقرأ:
MASTER_PROJECT_PLAN.md
CONTINUITY_PROTOCOL.md
GAME_CONSTRAINTS.md
SPEC_TREE_RULES.md
SPEC_TREE_STATUS.md
SPEC_TREE.md
REQUIREMENTS_TRACE.md
DECISIONS.md
SYSTEM_CONTRACTS.md
DESIGN_SYSTEM.md
PROGRESS_DASHBOARD.md
PROJECT_PROGRESS.json

ثم شغّل:
./scripts/status.sh

استأنف من أول مرحلة غير مكتملة.

استخدم Recursive Spec Kit Tree لبناء لعبة جوال استراتيجية Multiplayer.

لا تصمم اللعبة مباشرة.
Spec Kit هو الذي يستخرج شكل اللعبة.

اللعبة ليست ملزمة بأنها سيطرة مناطق.
يجب أن تكون استراتيجية حقيقية.

استخدم Spec Kit كامل للجذر.
ثم استخرج الفروع الضرورية فقط.
كل فرع يستخدم Spec Kit كامل.
لا تتجاوز عمق 4.
لا يوجد حد ثابت للفروع.
ممنوع الفروع غير الضرورية أو المكررة.

إذا كان الإخراج سطحيًا أو مكررًا أو فشل مرتين، قسّم المهمة إلى عقد أصغر حسب Model Shallow Output Handling Rule.

نفذ leaf nodes فقط بعد وجود tasks واضحة.
استدعِ QA وReviewer وIntegration Architect وDocumentation Keeper حسب الخطة.
حدّث ملفات الحالة والتقدم والتتبع بعد كل خطوة.
شغّل checkpoint بعد كل تقدم.

لا تضف:
Playable Vertical Slice Rule
موعد نهائي صارم
حد ثابت للفروع

لا تعتبر المشروع مكتملًا إلا بعد:
playable prototype
QA PASS
Reviewer PASS
Integration Architect PASS
AI_HANDOFF_MANUAL.md
Final AI Handoff Package
```

---

## 38. تعريف الاكتمال النهائي للمشروع

المشروع يعتبر مكتملًا فقط إذا تحقق الآتي:

1. يوجد playable prototype.
2. اللعبة تعمل كتطبيق جوال.
3. تدعم Android وiOS من حيث البنية.
4. تدعم العربية والإنجليزية.
5. RTL/LTR موثق ومطبق.
6. اللعبة استراتيجية وليست لعبة سرعة.
7. لا توجد استراتيجية واحدة مهيمنة حسب الاختبارات أو المحاكاة.
8. توجد بوتات بصعوبات وأنماط.
9. يوجد Mock Multiplayer.
10. يوجد مسار واضح لـ Supabase لاحقًا.
11. توجد اختبارات أو محاكي توازن.
12. QA PASS.
13. Reviewer PASS.
14. Integration Architect PASS.
15. AI_HANDOFF_MANUAL.md مكتمل.
16. Final AI Handoff Package مكتمل.
17. REQUIREMENTS_TRACE.md محدث.
18. SPEC_TREE_STATUS.md محدث.
19. PROGRESS_DASHBOARD.md وPROJECT_PROGRESS.json محدثان.
20. لا توجد BLOCKED جوهرية غير محلولة.

---

## 39. ملاحظات نهائية

هذه الخطة تعطي الذكاء حرية كبيرة جدًا في التصميم، لكنها تمنع الفوضى عبر:

- Spec Kit
- Recursive tree
- Definition of Done
- Requirements Trace
- System Contracts
- Decisions Log
- Integration Architect
- QA
- Reviewer
- Documentation Keeper
- Git checkpoints
- Continuity Protocol
- Progress Dashboard
- Model Shallow Output Handling Rule

الهدف ليس إنتاج أكبر عدد من ملفات Spec Kit.  
الهدف هو إنتاج أفضل لعبة استراتيجية ممكنة ضمن القيود، مع مشروع قابل للفهم والاستكمال مستقبلًا.

