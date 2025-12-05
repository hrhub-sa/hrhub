import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, password } = await req.json();
    console.log("Login attempt for:", email);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبة" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: adminUser, error: fetchError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (fetchError) {
      console.error("Database error:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "خطأ في قاعدة البيانات" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!adminUser) {
      console.log("User not found");
      return new Response(
        JSON.stringify({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User found, comparing passwords");
    const passwordMatch = bcrypt.compareSync(password, adminUser.password_hash);
    console.log("Password match result:", passwordMatch);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", adminUser.id);

    const sessionToken = crypto.randomUUID();
    const sessionData = {
      token: sessionToken,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, session: sessionData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "حدث خطأ في الخادم" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
