import { NextResponse } from "next/server";
import { mapProfileRow, type ProfileRow } from "@/lib/chat/mappers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, makeUsername } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ users: [], live: false });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ users: [], live: true, error: "Not signed in" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (admin) {
    const { data: list, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      console.error(listError);
    } else {
      const rows = (list.users ?? []).map((authUser) => {
        const email = authUser.email ?? `${authUser.id}@zinger.local`;
        const meta = (authUser.user_metadata ?? {}) as {
          full_name?: string;
          username?: string;
        };
        const fullName = meta.full_name || email.split("@")[0] || "Learner";
        return {
          id: authUser.id,
          full_name: fullName,
          email,
          username: meta.username || `${makeUsername(fullName, email)}${authUser.id.replace(/-/g, "").slice(0, 4)}`,
          avatar_url: null as string | null,
          role: isAdminEmail(email) ? "admin" : "student",
          last_seen_at: new Date().toISOString(),
        };
      });
      if (rows.length) {
        const { error: upsertError } = await admin.from("profiles").upsert(rows, {
          onConflict: "id",
        });
        if (upsertError) console.error(upsertError);
      }
    }

    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name, email, username, avatar_url, role, created_at, last_seen_at")
      .neq("id", user.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ users: [], live: true, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      live: true,
      users: (data as ProfileRow[]).map(mapProfileRow),
    });
  }

  const { data, error } = await supabase.from("profiles").select("*").neq("id", user.id);
  if (error) {
    console.error(error);
    return NextResponse.json({ users: [], live: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    live: true,
    users: (data as ProfileRow[]).map(mapProfileRow),
  });
}
