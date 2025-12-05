/*
  # إضافة حقل السعر قبل التخفيض للمنتجات

  1. تعديلات على الجدول
    - إضافة حقل `price_before` (numeric) - السعر قبل التخفيض (اختياري)
    - هذا الحقل يسمح بعرض السعر القديم مع شطب عليه

  2. ملاحظات
    - الحقل اختياري (nullable)
    - إذا كان فارغ، يتم عرض السعر العادي فقط
    - إذا كان موجود، يتم عرض السعر القديم مع شطب والسعر الجديد بجانبه
*/

-- إضافة حقل السعر قبل التخفيض
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price_before'
  ) THEN
    ALTER TABLE products ADD COLUMN price_before numeric;
  END IF;
END $$;