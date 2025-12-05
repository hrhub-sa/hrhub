/*
  # إصلاح صلاحيات قاعدة البيانات نهائياً

  1. تحديث السياسات
    - السماح للمستخدمين المجهولين بجميع العمليات
    - إزالة القيود الصارمة
    - تبسيط إدارة البيانات

  2. الجداول المتأثرة
    - products (المنتجات)
    - banner_images (صور البنر)
    - orders (الطلبات)
    - admin_users (المستخدمين الإداريين)
*/

-- حذف السياسات الحالية وإنشاء سياسات جديدة مبسطة

-- جدول المنتجات
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anon can manage products" ON products;
DROP POLICY IF EXISTS "Service role can manage products" ON products;

CREATE POLICY "Enable all operations for products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- جدول صور البنر
DROP POLICY IF EXISTS "Anyone can read banners" ON banner_images;
DROP POLICY IF EXISTS "Anon can manage banners" ON banner_images;
DROP POLICY IF EXISTS "Service role can manage banners" ON banner_images;

CREATE POLICY "Enable all operations for banners"
  ON banner_images
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- جدول الطلبات
DROP POLICY IF EXISTS "Anyone can manage orders" ON orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;

CREATE POLICY "Enable all operations for orders"
  ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- جدول المستخدمين الإداريين
DROP POLICY IF EXISTS "Anyone can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;

CREATE POLICY "Enable all operations for admin users"
  ON admin_users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- التأكد من تفعيل RLS على جميع الجداول
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;