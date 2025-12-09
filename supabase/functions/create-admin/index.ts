import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // حذف أي مستخدم موجود
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find((u: any) => u.email === 'admin@hrhub.sa');
    
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // إنشاء مستخدم جديد
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@hrhub.sa',
      password: 'Admin123',
      email_confirm: true,
      app_metadata: { role: 'admin' }
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'تم إنشاء المستخدم بنجاح',
        email: 'admin@hrhub.sa',
        password: 'Admin123'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});