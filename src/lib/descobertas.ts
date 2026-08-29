import { supabase, supabaseConfigurado } from "./supabase";

/**
 * O que o grupo já conhece. Guarda só as chaves reveladas — a descrição
 * de cada coisa fica no código.
 */

const CHAVE_LOCAL = "zomboide:descobertas";

function lerLocal(): string[] {
  try {
    const b = window.localStorage.getItem(CHAVE_LOCAL);
    return b ? (JSON.parse(b) as string[]) : [];
  } catch {
    return [];
  }
}

function gravarLocal(lista: string[]) {
  try {
    window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(lista));
  } catch {}
}

export async function listarDescobertas(): Promise<Set<string>> {
  if (supabaseConfigurado && supabase) {
    const { data, error } = await supabase.from("descobertas").select("chave");
    if (error) throw new Error(error.message);
    return new Set((data ?? []).map((d) => d.chave as string));
  }
  return new Set(lerLocal());
}

export async function revelar(chave: string) {
  if (supabaseConfigurado && supabase) {
    const { error } = await supabase.from("descobertas").insert({ chave });
    // 23505 = já existe; nesse caso não é erro de verdade
    if (error && error.code !== "23505") throw new Error(error.message);
    return;
  }
  const l = lerLocal();
  if (!l.includes(chave)) gravarLocal([...l, chave]);
}

export async function esconder(chave: string) {
  if (supabaseConfigurado && supabase) {
    const { error } = await supabase
      .from("descobertas")
      .delete()
      .eq("chave", chave);
    if (error) throw new Error(error.message);
    return;
  }
  gravarLocal(lerLocal().filter((c) => c !== chave));
}
