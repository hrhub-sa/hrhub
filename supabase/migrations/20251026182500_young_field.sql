/*
  # إضافة جدول إعدادات الموقع

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public access to settings

  3. Sample Data
    - Default site settings with all configurations
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Enable all operations for site settings"
  ON site_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('contact_info', '{
  "whatsappNumber": "+966530017278",
  "phoneNumber": "+966542345930",
  "emailAddress": "hrhub.sa@gmail.com",
  "address": "المدينة المنورة، السعودية"
}'),
('social_media', '{
  "instagramUrl": "https://instagram.com/hrhub.sa",
  "twitterUrl": "https://x.com/hrhub_sa",
  "linkedinUrl": "https://linkedin.com/company/hrhub-sa",
  "facebookUrl": "https://facebook.com/hrhub.sa"
}'),
('site_content', '{
  "siteTitleAr": "HR Hub ‒ إدارة الموارد البشرية والشؤون الحكومية",
  "siteTitleEn": "HR Hub ‒ HR & Government Affairs Solutions",
  "siteDescription": "شريككم المثالي في إدارة الموارد البشرية والشؤون الحكومية"
}'),
('package_pricing', '{
  "economyPrice": 3000,
  "comprehensivePrice": 6000
}'),
('webhub_settings', '{
  "webHubStatus": "coming-soon",
  "webHubMessage": "نعمل حالياً على تطوير منصة Web Hub لتقديم أفضل الحلول التقنية والبرمجية"
}')
ON CONFLICT (setting_key) DO NOTHING;