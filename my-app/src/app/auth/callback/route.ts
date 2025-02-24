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


      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", data?.user?.email)
        .limit(1)
        .single();

    //   if (!existingUser) {
    //     const { error: dbError } = await supabase.from("user_profiles").insert({
    //       email: data?.user?.email,
    //       username: data?.user?.user_metadata?.username,
    //     });

    //     if (dbError) {
    //       console.error("Error inserting user data:", dbError.message);
    //       return NextResponse.redirect(`${origin}/error`);
    //     }
    //   }

    if (!existingUser) {
        const email = data?.user?.email;
        if (!email) {
          console.error("Error: Email is undefined");
          return NextResponse.redirect(`${origin}/error`);
        }
      
        // Ensure username is never null
        const username =
          data?.user?.user_metadata?.username ||  // Use username if available
          data?.user?.user_metadata?.full_name || // Fallback to full name
          email.split("@")[0]; // Use email prefix as last resort
      
        console.log("Generated username:", username); // Debugging log
      
        const { error: dbError } = await supabase.from("user_profiles").insert([
          {
            email: email, // Now guaranteed to be defined
            username: username,
          },
        ]);
      
        if (dbError) {
          console.error("Error inserting user data:", dbError);
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
