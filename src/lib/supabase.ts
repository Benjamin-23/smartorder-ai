import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pjkfwjtjlbhwyislskxz.supabase.co";
const supabaseAnonKey =
  "sb_publishable_W5_q0CpZ9URlpjjjY7R3pg_rds8KoHJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Implicit flow keeps auth working inside the ephemeral preview iframe/URL.
    flowType: "implicit",
    persistSession: true,
    autoRefreshToken: true,
  },
});
