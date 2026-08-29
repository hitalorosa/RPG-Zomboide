import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Enquanto as credenciais não estiverem no .env.local, o site continua
 * funcionando usando armazenamento local do navegador. Isso permite testar
 * a interface antes de ligar o banco.
 */
export const supabaseConfigurado = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, anonKey as string)
  : null;
