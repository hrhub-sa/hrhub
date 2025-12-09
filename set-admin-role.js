// نسخ هذا الكود وتشغيله في الكونسل بعد إنشاء المستخدم

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://wufvlgmlxqdgqqsnsgxa.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // حط service role key من Dashboard -> Settings -> API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// تحديث المستخدم وإضافة role admin
const { data, error } = await supabase.auth.admin.updateUserById(
  'USER_ID_HERE', // حط الـ ID من صفحة Users
  {
    app_metadata: { role: 'admin' }
  }
);

console.log('Result:', data, error);
