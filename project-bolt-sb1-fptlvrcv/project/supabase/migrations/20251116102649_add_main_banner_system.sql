/*
  # إضافة نظام البنر الرئيسي

  1. New Tables
    - `main_banner_settings`
      - `id` (uuid, primary key)
      - `is_enabled` (boolean) - تفعيل/تعطيل البنر
      - `auto_slide_interval` (integer) - وقت التبديل بالثواني (افتراضي 5)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. تعديلات على جدول banner_images
    - إضافة حقل `banner_type` لتحديد نوع البنر (main أو legacy)
    - البنرات الجديدة ستكون من نوع main

  3. Security
    - Enable RLS
    - Add policies for public read access

  4. Default Settings
    - إنشاء إعدادات افتراضية للبنر الرئيسي
*/

-- Create main_banner_settings table
CREATE TABLE IF NOT EXISTS main_banner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT false,
  auto_slide_interval integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE main_banner_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
  ON main_banner_settings
  FOR SELECT
  TO public
  USING (true);

-- Create policy for public write access (for admin)
CREATE POLICY "Enable all operations for main banner settings"
  ON main_banner_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add banner_type to banner_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banner_images' AND column_name = 'banner_type'
  ) THEN
    ALTER TABLE banner_images ADD COLUMN banner_type text DEFAULT 'legacy';
  END IF;
END $$;

-- Insert default settings
INSERT INTO main_banner_settings (is_enabled, auto_slide_interval)
VALUES (false, 5)
ON CONFLICT DO NOTHING;