import { supabase, supabaseConfigurado } from "./supabase";

export type Jogador = {
  id: string;
  nome: string;
};

const CHAVE_LISTA = "zomboide:jogadores";
const CHAVE_SESSAO = "zomboide:jogador-atual";

/* ------------------------------------------------------------------ *
 * Fallback local — usado enquanto o Supabase não estiver configurado. *
 * ------------------------------------------------------------------ */

function lerLocal(): Jogador[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_LISTA);
    return bruto ? (JSON.parse(bruto) as Jogador[]) : [];
  } catch {
    return [];
  }
}

function gravarLocal(lista: Jogador[]) {
  try {
    window.localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista));
  } catch {
    /* navegador sem storage disponível — segue sem persistir */
  }
}

/* ------------------------------------------------------------------ *
 * API pública                                                         *
 * ------------------------------------------------------------------ */

export function normalizarNome(nome: string) {
  return nome.trim().replace(/\s+/g, " ");
}

export async function listarJogadores(): Promise<Jogador[]> {
  if (supabaseConfigurado && supabase) {
    const { data, error } = await supabase
      .from("jogadores")
      .select("id, nome")
      .order("criado_em", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  return lerLocal();
}

/**
 * Entra com um nome. Se já existir alguém com esse nome, reaproveita —
 * ninguém quer criar personagem duplicado por causa de maiúscula.
 */
export async function entrarComoJogador(nomeBruto: string): Promise<Jogador> {
  const nome = normalizarNome(nomeBruto);
  if (!nome) throw new Error("Digite um nome.");
  if (nome.length > 24) throw new Error("Nome muito longo (máx. 24).");

  if (supabaseConfigurado && supabase) {
    const { data: existente, error: erroBusca } = await supabase
      .from("jogadores")
      .select("id, nome")
      .ilike("nome", nome)
      .maybeSingle();

    if (erroBusca) throw new Error(erroBusca.message);
    if (existente) return existente;

    const { data, error } = await supabase
      .from("jogadores")
      .insert({ nome })
      .select("id, nome")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const lista = lerLocal();
  const jaExiste = lista.find(
    (j) => j.nome.toLowerCase() === nome.toLowerCase()
  );
  if (jaExiste) return jaExiste;

  const novo: Jogador = { id: crypto.randomUUID(), nome };
  gravarLocal([...lista, novo]);
  return novo;
}

/* ---------------------------- sessão ------------------------------ */

export function salvarSessao(jogador: Jogador) {
  try {
    window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(jogador));
  } catch {
    /* ignora */
  }
}

export function lerSessao(): Jogador | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as Jogador) : null;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  try {
    window.localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    /* ignora */
  }
}

/**
 * Sessão criada enquanto o banco estava desconectado guarda um id que só
 * existe naquele navegador. Quando o banco volta, salvar a ficha quebra na
 * chave estrangeira. Aqui a gente confere e reconstrói pelo nome, sem o
 * jogador perceber.
 */
export async function garantirSessao(): Promise<Jogador | null> {
  const sessao = lerSessao();
  if (!sessao) return null;
  if (!supabaseConfigurado || !supabase) return sessao;

  const { data, error } = await supabase
    .from("jogadores")
    .select("id, nome")
    .eq("id", sessao.id)
    .maybeSingle();

  if (error) return sessao; // banco fora do ar: segue com o que tem
  if (data) return data;

  // o id não existe mais (ou nunca existiu): recria pelo nome
  const recriado = await entrarComoJogador(sessao.nome);
  salvarSessao(recriado);
  return recriado;
}
