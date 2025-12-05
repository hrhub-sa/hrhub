/*
  # إنشاء جدول الطلبات

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `name` (text, اسم العميل)
      - `email` (text, البريد الإلكتروني)
      - `phone` (text, رقم الهاتف)
      - `message` (text, رسالة العميل)
      - `hub` (text, نوع الباقة - hrhub أو webhub)
      - `status` (text, حالة الطلب)
      - `created_at` (timestamp, تاريخ الإنشاء)
      - `updated_at` (timestamp, تاريخ آخر تحديث)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public to insert orders
    - Add policy for authenticated users to read/update orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  hub text NOT NULL CHECK (hub IN ('hrhub', 'webhub')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'subscribed', 'cancelled', 'not-subscribed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for public to insert orders (العملاء يقدرون يرسلون طلبات)
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated users to read all orders (المدير يقدر يشوف كل الطلبات)
CREATE POLICY "Authenticated users can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to update orders (المدير يقدر يحدث الطلبات)
CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy for authenticated users to delete orders (المدير يقدر يحذف الطلبات)
CREATE POLICY "Authenticated users can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();