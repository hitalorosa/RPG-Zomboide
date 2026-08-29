import { supabase, supabaseConfigurado } from "./supabase";

export type Personagem = {
  id?: string;
  jogador_id: string;
  ativo: boolean;

  nome: string;
  idade: string;
  pronomes: string;
  profissao_antes: string;

  especializacao: string | null;
  atributo_bonus: string | null;

  forca: number;
  agilidade: number;
  resistencia: number;
  intelecto: number;
  percepcao: number;

  vida: number;
  vida_max: number;
  sanidade: number;
  sanidade_max: number;
  medo: number;
  medo_max: number;
  panico: number;
  panico_max: number;
  estresse: number;
  estresse_max: number;
  fadiga: number;
  fadiga_max: number;
  condicao: string;

  arma: string;
  arma_barulhenta: boolean;
  itens: string;

  qualidade: string;
  defeito: string;
  maior_medo: string;
  como_se_acalma: string;

  historia: string;
};

export function personagemVazio(jogadorId: string): Personagem {
  return {
    jogador_id: jogadorId,
    ativo: true,
    nome: "",
    idade: "",
    pronomes: "",
    profissao_antes: "",
    especializacao: null,
    atributo_bonus: null,
    forca: 0,
    agilidade: 0,
    resistencia: 0,
    intelecto: 0,
    percepcao: 0,
    vida: 0,
    vida_max: 0,
    sanidade: 0,
    sanidade_max: 0,
    medo: 0,
    medo_max: 0,
    panico: 0,
    panico_max: 0,
    estresse: 0,
    estresse_max: 0,
    fadiga: 0,
    fadiga_max: 0,
    condicao: "Normal",
    arma: "",
    arma_barulhenta: false,
    itens: "",
    qualidade: "",
    defeito: "",
    maior_medo: "",
    como_se_acalma: "",
    historia: "",
  };
}

const chaveLocal = (jogadorId: string) => `zomboide:personagem:${jogadorId}`;

/* ------------------------------ leitura ------------------------------ */

export async function carregarPersonagem(
  jogadorId: string
): Promise<Personagem | null> {
  if (supabaseConfigurado && supabase) {
    const { data, error } = await supabase
      .from("personagens")
      .select("*")
      .eq("jogador_id", jogadorId)
      .eq("ativo", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Personagem) ?? null;
  }

  try {
    const bruto = window.localStorage.getItem(chaveLocal(jogadorId));
    return bruto ? (JSON.parse(bruto) as Personagem) : null;
  } catch {
    return null;
  }
}

/* ------------------------------- escrita ----------------------------- */

export async function salvarPersonagem(p: Personagem): Promise<Personagem> {
  if (supabaseConfigurado && supabase) {
    if (p.id) {
      const { data, error } = await supabase
        .from("personagens")
        .update(p)
        .eq("id", p.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return data as Personagem;
    }

    const { id: _ignorado, ...novo } = p;
    void _ignorado;
    const { data, error } = await supabase
      .from("personagens")
      .insert(novo)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Personagem;
  }

  const comId: Personagem = { ...p, id: p.id ?? crypto.randomUUID() };
  try {
    window.localStorage.setItem(
      chaveLocal(p.jogador_id),
      JSON.stringify(comId)
    );
  } catch {
    /* segue sem persistir */
  }
  return comId;
}
