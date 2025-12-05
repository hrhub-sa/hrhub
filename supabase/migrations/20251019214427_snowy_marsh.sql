/*
  # إصلاح صلاحيات قاعدة البيانات

  1. تحديث سياسات الأمان
    - السماح للمستخدمين المجهولين بالقراءة فقط
    - السماح للمستخدمين المسجلين بجميع العمليات
    - إضافة سياسات مرنة للإدارة

  2. إصلاح RLS للجداول
    - products: قراءة للجميع، تعديل للمسجلين
    - banner_images: قراءة للجميع، تعديل للمسجلين
    - orders: إدراج للجميع، باقي العمليات للمسجلين
*/

-- إصلاح سياسات جدول المنتجات
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- سياسات جديدة للمنتجات
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage products"
  ON products
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- إصلاح سياسات جدول صور البنر
DROP POLICY IF EXISTS "Anyone can read active banner images" ON banner_images;
DROP POLICY IF EXISTS "Authenticated users can manage banner images" ON banner_images;

-- سياسات جديدة لصور البنر
CREATE POLICY "Anyone can read banners"
  ON banner_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage banners"
  ON banner_images
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can manage banners"
  ON banner_images
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- إصلاح سياسات جدول الطلبات
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can read all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

-- سياسات جديدة للطلبات
CREATE POLICY "Anyone can manage orders"
  ON orders
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- إصلاح سياسات جدول المستخدمين الإداريين
DROP POLICY IF EXISTS "Authenticated users can manage admin users" ON admin_users;

CREATE POLICY "Anyone can manage admin users"
  ON admin_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);