import { supabase, supabaseConfigurado } from "./supabase";

export type Rolagem = {
  id?: string;
  quem: string;
  rotulo: string;
  formula: string;
  resultados: number[];
  modificador: number;
  total: number;
  criado_em?: string;
};

export const DADOS = [4, 6, 8, 10, 12, 20, 100] as const;

/** Rola de verdade, aqui no navegador. */
export function rolar(
  lados: number,
  quantidade: number,
  vantagem: boolean
): number[] {
  const n = vantagem ? 2 : quantidade;
  return Array.from(
    { length: n },
    () => Math.floor(Math.random() * lados) + 1
  );
}

export function totalizar(
  resultados: number[],
  modificador: number,
  vantagem: boolean
) {
  const base = vantagem
    ? Math.max(...resultados)
    : resultados.reduce((s, r) => s + r, 0);
  return base + modificador;
}

export function descreverFormula(
  lados: number,
  quantidade: number,
  vantagem: boolean,
  modificador: number
) {
  const dado = vantagem ? `2d${lados} maior` : `${quantidade}d${lados}`;
  if (!modificador) return dado;
  return `${dado} ${modificador > 0 ? "+" : ""}${modificador}`;
}

/* ------------------------------ persistência ---------------------------- */

const CHAVE_LOCAL = "zomboide:rolagens";

function lerLocal(): Rolagem[] {
  try {
    const b = window.localStorage.getItem(CHAVE_LOCAL);
    return b ? (JSON.parse(b) as Rolagem[]) : [];
  } catch {
    return [];
  }
}

export async function listarRolagens(limite = 40): Promise<Rolagem[]> {
  if (supabaseConfigurado && supabase) {
    const { data, error } = await supabase
      .from("rolagens")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data ?? []) as Rolagem[];
  }
  return lerLocal().slice(0, limite);
}

export async function gravarRolagem(r: Rolagem): Promise<Rolagem> {
  if (supabaseConfigurado && supabase) {
    const { data, error } = await supabase
      .from("rolagens")
      .insert(r)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Rolagem;
  }
  const comId: Rolagem = {
    ...r,
    id: crypto.randomUUID(),
    criado_em: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(
      CHAVE_LOCAL,
      JSON.stringify([comId, ...lerLocal()].slice(0, 100))
    );
  } catch {}
  return comId;
}

export async function limparRolagens() {
  if (supabaseConfigurado && supabase) {
    const { error } = await supabase
      .from("rolagens")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    return;
  }
  try {
    window.localStorage.removeItem(CHAVE_LOCAL);
  } catch {}
}
