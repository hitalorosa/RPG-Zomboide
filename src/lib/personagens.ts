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
  descricao_visual: string;
  retrato_url: string;
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
    descricao_visual: "",
    retrato_url: "",
  };
}

const chaveLocal = (jogadorId: string) => `zomboide:personagem:${jogadorId}`;

function lerLocalPersonagem(jogadorId: string): Personagem | null {
  try {
    const bruto = window.localStorage.getItem(chaveLocal(jogadorId));
    return bruto ? (JSON.parse(bruto) as Personagem) : null;
  } catch {
    return null;
  }
}

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
      // O retrato fica de fora do update. A ficha e a página do personagem
      // seguram uma cópia que envelhece, e salvar qualquer campo devolvia o
      // retrato_url antigo por cima do atual, apagando a imagem. Quem grava
      // essa coluna é salvarRetrato, e só ela.
      const { retrato_url: _retrato, ...campos } = p;
      void _retrato;
      const { data, error } = await supabase
        .from("personagens")
        .update(campos)
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

  // mesma proteção do caminho do banco: o retrato guardado vence o da cópia
  const guardado = lerLocalPersonagem(p.jogador_id);
  const comId: Personagem = {
    ...p,
    retrato_url: guardado?.retrato_url ?? p.retrato_url,
    id: p.id ?? crypto.randomUUID(),
  };
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

/* ------------------------------- a mesa ------------------------------ */

export type LinhaMesa = {
  jogador: { id: string; nome: string };
  personagem: Personagem | null;
};

/** Todos os jogadores com o personagem ativo de cada um. Usado na admin. */
export async function listarMesa(): Promise<LinhaMesa[]> {
  if (supabaseConfigurado && supabase) {
    const [{ data: jogadores, error: e1 }, { data: fichas, error: e2 }] =
      await Promise.all([
        supabase.from("jogadores").select("id, nome").order("criado_em"),
        supabase.from("personagens").select("*").eq("ativo", true),
      ]);

    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    const porJogador = new Map<string, Personagem>();
    for (const f of (fichas ?? []) as Personagem[]) {
      porJogador.set(f.jogador_id, f);
    }

    return (jogadores ?? []).map((j) => ({
      jogador: j,
      personagem: porJogador.get(j.id) ?? null,
    }));
  }

  // fallback local: só dá para ver quem está neste navegador
  try {
    const bruto = window.localStorage.getItem("zomboide:jogadores");
    const jogadores = bruto
      ? (JSON.parse(bruto) as { id: string; nome: string }[])
      : [];
    return jogadores.map((j) => {
      const f = window.localStorage.getItem(chaveLocal(j.id));
      return {
        jogador: j,
        personagem: f ? (JSON.parse(f) as Personagem) : null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Único caminho que escreve no retrato. Fica separado de propósito: assim
 * salvar a ficha ou mexer nas barras de estado nunca encosta na imagem.
 */
export async function salvarRetrato(
  p: Personagem,
  url: string
): Promise<void> {
  const retrato_url = url.trim();

  if (supabaseConfigurado && supabase && p.id) {
    const { error } = await supabase
      .from("personagens")
      .update({ retrato_url })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    return;
  }

  const atual = lerLocalPersonagem(p.jogador_id);
  if (!atual) return;
  try {
    window.localStorage.setItem(
      chaveLocal(p.jogador_id),
      JSON.stringify({ ...atual, retrato_url })
    );
  } catch {
    /* navegador sem storage disponível */
  }
}
