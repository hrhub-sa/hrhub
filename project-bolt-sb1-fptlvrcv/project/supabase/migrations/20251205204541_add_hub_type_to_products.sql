/*
  # إضافة حقل hub_type لجدول المنتجات

  1. التغييرات
    - إضافة حقل `hub_type` لجدول products لتصنيف المنتجات حسب النوع (hrhub أو webhub)
    - تحديث المنتجات الحالية بقيمة افتراضية 'webhub'

  2. ملاحظات
    - القيم المسموحة: 'hrhub' أو 'webhub'
    - القيمة الافتراضية: 'webhub'
*/

-- إضافة حقل hub_type إذا لم يكن موجودًا
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'hub_type'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN hub_type text DEFAULT 'webhub' CHECK (hub_type = ANY (ARRAY['hrhub'::text, 'webhub'::text]));
  END IF;
END $$;

-- تحديث المنتجات الحالية بقيمة افتراضية
UPDATE products 
SET hub_type = 'webhub' 
WHERE hub_type IS NULL;
