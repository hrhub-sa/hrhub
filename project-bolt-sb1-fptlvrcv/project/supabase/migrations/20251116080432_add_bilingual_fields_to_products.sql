/*
  # إضافة حقول ثنائية اللغة لجدول المنتجات

  1. تعديلات على الجدول
    - إضافة حقول للغة العربية:
      - `name_ar` (text) - اسم المنتج بالعربي
      - `description_ar` (text) - وصف المنتج بالعربي
      - `duration_ar` (text) - المدة بالعربي
    - إضافة حقول للغة الإنجليزية:
      - `name_en` (text) - اسم المنتج بالإنجليزي
      - `description_en` (text) - وصف المنتج بالإنجليزي
      - `duration_en` (text) - المدة بالإنجليزي
    - تحويل حقل features إلى نسختين:
      - `features_ar` (jsonb) - المميزات بالعربي
      - `features_en` (jsonb) - المميزات بالإنجليزي

  2. ترحيل البيانات
    - نقل البيانات الموجودة من الحقول القديمة إلى حقول اللغة العربية
    - حذف الحقول القديمة بعد نقل البيانات
*/

-- إضافة الحقول الجديدة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE products ADD COLUMN name_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE products ADD COLUMN name_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE products ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE products ADD COLUMN description_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'duration_ar'
  ) THEN
    ALTER TABLE products ADD COLUMN duration_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'duration_en'
  ) THEN
    ALTER TABLE products ADD COLUMN duration_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'features_ar'
  ) THEN
    ALTER TABLE products ADD COLUMN features_ar jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'features_en'
  ) THEN
    ALTER TABLE products ADD COLUMN features_en jsonb DEFAULT '[]';
  END IF;
END $$;

-- نقل البيانات الموجودة إلى حقول اللغة العربية
UPDATE products
SET 
  name_ar = name,
  description_ar = description,
  duration_ar = duration,
  features_ar = features,
  name_en = '',
  description_en = '',
  duration_en = '',
  features_en = '[]'::jsonb
WHERE name_ar IS NULL;

-- حذف الحقول القديمة
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'name'
  ) THEN
    ALTER TABLE products DROP COLUMN name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'description'
  ) THEN
    ALTER TABLE products DROP COLUMN description;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'duration'
  ) THEN
    ALTER TABLE products DROP COLUMN duration;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'features'
  ) THEN
    ALTER TABLE products DROP COLUMN features;
  END IF;
END $$;

-- جعل الحقول الجديدة إلزامية
ALTER TABLE products ALTER COLUMN name_ar SET NOT NULL;
ALTER TABLE products ALTER COLUMN name_en SET NOT NULL;
ALTER TABLE products ALTER COLUMN description_ar SET NOT NULL;
ALTER TABLE products ALTER COLUMN description_en SET NOT NULL;
ALTER TABLE products ALTER COLUMN duration_ar SET NOT NULL;
ALTER TABLE products ALTER COLUMN duration_en SET NOT NULL;