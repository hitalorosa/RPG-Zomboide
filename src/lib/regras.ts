/**
 * Conteúdo estático das regras. Não vai para o banco — é texto que só muda
 * quando a gente edita o projeto. O banco guarda o que o jogo altera.
 */

export const PONTOS_INICIAIS = 15;

/* ----------------------------- atributos ----------------------------- */

export const ATRIBUTOS = [
  { chave: "forca", nome: "Força" },
  { chave: "agilidade", nome: "Agilidade" },
  { chave: "resistencia", nome: "Resistência" },
  { chave: "intelecto", nome: "Intelecto" },
  { chave: "percepcao", nome: "Percepção" },
] as const;

export type ChaveAtributo = (typeof ATRIBUTOS)[number]["chave"];

/* --------------------------- especializações -------------------------- */

export type Especializacao = {
  chave: string;
  nome: string;
  resumo: string;
  descricao: string;
  /** o +1 pode ir em um destes dois */
  bonus: readonly [ChaveAtributo, ChaveAtributo];
};

export const ESPECIALIZACOES: readonly Especializacao[] = [
  {
    chave: "rastreador",
    nome: "Rastreador",
    resumo: "Exploração, rastreamento e sobrevivência.",
    descricao:
      "Encontra pegadas, identifica caminhos seguros e percebe sinais de infectados.",
    bonus: ["agilidade", "percepcao"],
  },
  {
    chave: "combatente",
    nome: "Combatente",
    resumo: "Combate corpo a corpo e armas.",
    descricao:
      "Recebe bônus em combate e lida melhor com armas, confrontos e lutas.",
    bonus: ["forca", "resistencia"],
  },
  {
    chave: "medico",
    nome: "Médico",
    resumo: "Primeiros socorros, doenças e ferimentos.",
    descricao:
      "Trata ferimentos, tem kit de primeiros socorros, identifica doenças e estabiliza personagens.",
    bonus: ["intelecto", "percepcao"],
  },
  {
    chave: "mecanico",
    nome: "Mecânico",
    resumo: "Veículos, máquinas e reparos.",
    descricao: "Conserta veículos, geradores, portas e equipamentos.",
    bonus: ["intelecto", "agilidade"],
  },
  {
    chave: "negociador",
    nome: "Negociador",
    resumo: "Comunicação, persuasão e resolução de conflitos.",
    descricao: "Convence, intimida ou acalma NPCs e outros sobreviventes.",
    bonus: ["intelecto", "percepcao"],
  },
] as const;

export function acharEspecializacao(chave: string | null | undefined) {
  return ESPECIALIZACOES.find((e) => e.chave === chave) ?? null;
}

/* ------------------------------- estado ------------------------------- */

export const ESTADOS = [
  { chave: "vida", nome: "Vida" },
  { chave: "sanidade", nome: "Sanidade" },
  { chave: "medo", nome: "Medo" },
  { chave: "panico", nome: "Pânico" },
  { chave: "estresse", nome: "Estresse" },
  { chave: "fadiga", nome: "Fadiga" },
] as const;

export type ChaveEstado = (typeof ESTADOS)[number]["chave"];

/**
 * PROVISÓRIO. A ficha diz "a decidir de acordo com a habilidade" — então
 * Vida e Sanidade saem dos atributos (que é o óbvio) e as outras quatro
 * começam num valor fixo, editável à mão até vocês fecharem a regra.
 */
export function calcularMaximos(a: Record<ChaveAtributo, number>) {
  return {
    vida_max: 10 + a.resistencia * 2,
    sanidade_max: 10 + a.intelecto * 2,
    medo_max: 10,
    panico_max: 10,
    estresse_max: 10,
    fadiga_max: 10,
  };
}

export const FORMULA_TEXTO: Record<ChaveEstado, string> = {
  vida: "10 + Resistência × 2",
  sanidade: "10 + Intelecto × 2",
  medo: "fixo, a definir",
  panico: "fixo, a definir",
  estresse: "fixo, a definir",
  fadiga: "fixo, a definir",
};

export const CONDICOES = [
  "Normal",
  "Ferido",
  "Exausto",
  "Em pânico",
  "Mordido",
  "Inconsciente",
] as const;
