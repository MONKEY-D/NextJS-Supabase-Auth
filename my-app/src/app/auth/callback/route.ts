import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.log("Error fetching user data:", userError.message);
        return NextResponse.redirect(`${origin}/error`);
      }

      const { data: existingUser, error: fetchError } = await supabase
        .from("user_profiles")
        .select("id") // Only fetch the ID to reduce payload size
        .eq("email", data?.user?.email)
        .limit(1)
        .single();

      if (!existingUser && !fetchError) {
        const { error: dbError } = await supabase
          .from("user_profiles")
          .insert({
            email: data?.user?.email,
            username: data?.user?.user_metadata?.full_name || "New User",
          })
          .select(); // Ensure Supabase returns the inserted data

        if (dbError) {
          console.error("Error inserting user data:", dbError.message);
          return NextResponse.redirect(`${origin}/error`);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
