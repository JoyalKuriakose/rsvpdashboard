import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const configError =
  !url || !key
    ? "Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Add them in your .env.local (dev) or Vercel → Settings → Environment Variables (production), then redeploy."
    : null;

// Fall back to harmless placeholders if misconfigured, so createClient
// itself never throws — the app stays alive and shows configError on
// screen instead of going blank.
export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder");

export type RSVPRow = {
  id: string;
  created_at: string;
  name: string;
  attending: boolean;
  guest_count: number;
  message: string | null;
};

