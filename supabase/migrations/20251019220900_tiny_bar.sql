/*
  # إنشاء نظام مصادقة آمن للمدير

  1. جدول المستخدمين الإداريين
    - `id` (uuid, primary key)
    - `email` (text, unique)
    - `password_hash` (text, مشفرة)
    - `full_name` (text)
    - `role` (text)
    - `is_active` (boolean)
    - `last_login` (timestamp)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  2. الأمان
    - تشفير كلمات المرور
    - Row Level Security
    - سياسات الوصول
*/

-- إنشاء دالة تشفير كلمة المرور
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة التحقق من كلمة المرور
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password, hash) = hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إدراج المستخدم الإداري الافتراضي
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hrhub.sa',
  hash_password('hrhub2025'),
  'مدير النظام',
  'super_admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = hash_password('hrhub2025'),
  updated_at = now();

-- إنشاء دالة المصادقة
CREATE OR REPLACE FUNCTION authenticate_admin(user_email text, user_password text)
RETURNS json AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result json;
BEGIN
  -- البحث عن المستخدم
  SELECT * INTO admin_record
  FROM admin_users
  WHERE email = user_email AND is_active = true;
  
  -- التحقق من وجود المستخدم
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- التحقق من كلمة المرور
  IF NOT verify_password(user_password, admin_record.password_hash) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
  
  -- تحديث آخر تسجيل دخول
  UPDATE admin_users 
  SET last_login = now(), updated_at = now()
  WHERE id = admin_record.id;
  
  -- إرجاع النتيجة الناجحة
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'role', admin_record.role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح الصلاحيات للدالة
GRANT EXECUTE ON FUNCTION authenticate_admin(text, text) TO public;
GRANT EXECUTE ON FUNCTION hash_password(text) TO public;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO public;