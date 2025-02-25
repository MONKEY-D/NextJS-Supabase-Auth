// import { NextResponse } from "next/server";
// import { createClient } from "../../../../utils/supabase/server";
// // The client you created from the Server-Side Auth instructions

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // if "next" is in param, use it as the redirect URL
//   const next = searchParams.get("next") ?? "/";

//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       const { data, error: userError } = await supabase.auth.getUser();
//       if (userError) {
//         console.error("Error fetching user data:", userError.message);
//         return NextResponse.redirect(`${origin}/error`);
//       }

//       //check if the user exists in user_profiles table
//       const { data: existingUser } = await supabase
//         .from("user_profiles")
//         .select("*")
//         .eq("email", data?.user?.email)
//         .limit(1)
//         .single();

//       if (!existingUser) {
//         //Insert new user into the user_profiles table
//         const { error: dbError } = await supabase.from("user_profiles").insert({
//           email: data?.user?.email,
//           username: data?.user?.user_metadata?.user_name,
//         });

//         if (dbError) {
//           console.error("Error inserting user data:", dbError.message);
//           return NextResponse.redirect(`${origin}/error`);
//         }
//       }

//       const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
//       const isLocalEnv = process.env.NODE_ENV === "development";
//       if (isLocalEnv) {
//         // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
//         return NextResponse.redirect(`${origin}${next}`);
//       } else if (forwardedHost) {
//         return NextResponse.redirect(`https://${forwardedHost}${next}`);
//       } else {
//         return NextResponse.redirect(`${origin}${next}`);
//       }
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }








import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js"; // Import Supabase client type

async function generateUniqueUsername(supabase: SupabaseClient, baseUsername: string): Promise<string> {
  let uniqueUsername = baseUsername;
  let isUnique = false;

  while (!isUnique) {
    // Append a random number, dot, or underscore to make it unique
    const randomSuffix = Math.floor(Math.random() * 9999);
    uniqueUsername = `${baseUsername}_${randomSuffix}`;

    // Check if the username already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("username", uniqueUsername)
      .limit(1)
      .single();

    if (!existingUser) {
      isUnique = true;
    }
  }

  return uniqueUsername;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient(); // Ensure proper Supabase client type
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data?.user?.email) {
        console.error("Error fetching user data or missing email:", userError?.message);
        return NextResponse.redirect(`${origin}/error`);
      }

      const email = data.user.email; // Now safely defined
      const baseUsername = data.user.user_metadata?.user_name || email.split("@")[0];

      // Check if the user exists
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .limit(1)
        .single();

      if (!existingUser) {
        // Generate a unique username
        const uniqueUsername = await generateUniqueUsername(supabase, baseUsername);

        // Insert the new user
        const { error: dbError } = await supabase.from("user_profiles").insert({
          email,
          username: uniqueUsername,
        });

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

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
