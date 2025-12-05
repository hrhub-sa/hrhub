/*
  # إنشاء جداول إدارة المحتوى

  1. جداول جديدة
    - `banner_images` - صور البنر
    - `products` - منتجات Web Hub
    - `admin_users` - مستخدمي الإدارة

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للمستخدمين المصرح لهم فقط
*/

-- جدول صور البنر
CREATE TABLE IF NOT EXISTS banner_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  hub_type text NOT NULL CHECK (hub_type IN ('hrhub', 'webhub')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول منتجات Web Hub
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  duration text NOT NULL,
  image_url text DEFAULT '',
  icon text DEFAULT 'fas fa-code',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  features jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول مستخدمي الإدارة
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE banner_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمصرح لهم فقط
CREATE POLICY "Authenticated users can manage banner images"
  ON banner_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات للقراءة العامة
CREATE POLICY "Anyone can read active banner images"
  ON banner_images
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO anon
  USING (is_active = true);

-- إدراج بيانات تجريبية
INSERT INTO banner_images (title, image_url, alt_text, hub_type, display_order) VALUES
('QIWA Platform', 'qiwa.png', 'QIWA', 'hrhub', 1),
('Absher Platform', 'absher.png', 'Absher', 'hrhub', 2),
('Balady Platform', 'balady.png', 'Balady', 'hrhub', 3),
('GOSI Platform', 'gosi.png', 'GOSI', 'hrhub', 4),
('Ministry Platform', 'ministry.png', 'HRSD', 'hrhub', 5);

INSERT INTO products (name, description, price, duration, icon, features, display_order) VALUES
('موقع إلكتروني احترافي', 'تصميم وتطوير موقع إلكتروني متجاوب مع لوحة تحكم', 5000.00, '2-3 أسابيع', 'fas fa-globe', '["تصميم متجاوب", "لوحة تحكم", "SEO محسن", "استضافة مجانية لسنة"]', 1),
('تطبيق جوال', 'تطوير تطبيق جوال لنظامي iOS و Android', 15000.00, '4-6 أسابيع', 'fas fa-mobile-alt', '["متوافق مع iOS و Android", "تصميم عصري", "إشعارات فورية", "ربط مع APIs"]', 2),
('متجر إلكتروني', 'متجر إلكتروني كامل مع نظام دفع آمن', 8000.00, '3-4 أسابيع', 'fas fa-shopping-cart', '["نظام دفع آمن", "إدارة المخزون", "تقارير مبيعات", "دعم متعدد العملات"]', 3),
('نظام إدارة', 'نظام إدارة مخصص لإدارة العمليات', 12000.00, '4-5 أسابيع', 'fas fa-cogs', '["واجهات مخصصة", "تقارير تفصيلية", "إدارة المستخدمين", "نسخ احتياطي تلقائي"]', 4);

-- إدراج مستخدم إدارة افتراضي
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@hrhub.sa', '$2b$12$LQv3c1yqBwEHXw.9oC9GCO', 'مدير النظام', 'super_admin');

-- تحديث الوقت تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banner_images_updated_at BEFORE UPDATE ON banner_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();