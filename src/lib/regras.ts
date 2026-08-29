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

/* ------------------------------- armas ------------------------------- */

export type Arma = {
  chave: string;
  nome: string;
  /** o atributo que soma na rolagem de ataque */
  atributo: ChaveAtributo;
  dano: string;
  barulhenta: boolean;
  nota: string;
};

/**
 * Duas por classe, e não texto livre. Cada uma soma um atributo diferente,
 * então a escolha da arma conversa com a distribuição dos 15 pontos.
 */
export const ARMAS: Record<string, readonly [Arma, Arma]> = {
  rastreador: [
    {
      chave: "arco",
      nome: "Arco de bambu",
      atributo: "percepcao",
      dano: "1d6",
      barulhenta: false,
      nota: "Munição se faz. Silencioso de verdade, o único a distância que não convoca.",
    },
    {
      chave: "facao",
      nome: "Facão de mato",
      atributo: "forca",
      dano: "1d6",
      barulhenta: false,
      nota: "Abre caminho na cana e serve de arma. Nunca acaba.",
    },
  ],
  combatente: [
    {
      chave: "marreta",
      nome: "Marreta",
      atributo: "forca",
      dano: "1d8",
      barulhenta: false,
      nota: "O maior dano do jogo, e o mais lento. Erra e você está no chão.",
    },
    {
      chave: "espingarda",
      nome: "Espingarda",
      atributo: "percepcao",
      dano: "2d6",
      barulhenta: true,
      nota: "Resolve qualquer coisa uma vez. E chama tudo que estiver ouvindo.",
    },
  ],
  medico: [
    {
      chave: "bisturi",
      nome: "Bisturi de campo",
      atributo: "agilidade",
      dano: "1d4",
      barulhenta: false,
      nota: "Fraco e preciso. Serve pra ferir e serve pra costurar.",
    },
    {
      chave: "machadinha",
      nome: "Machadinha de resgate",
      atributo: "forca",
      dano: "1d6",
      barulhenta: false,
      nota: "A de ambulância. Corta gente e corta porta.",
    },
  ],
  mecanico: [
    {
      chave: "grifo",
      nome: "Chave de grifo",
      atributo: "forca",
      dano: "1d6",
      barulhenta: false,
      nota: "Pesada e sem graça. Também abre cano, porta e caixa.",
    },
    {
      chave: "macarico",
      nome: "Maçarico portátil",
      atributo: "intelecto",
      dano: "1d6 por rodada",
      barulhenta: false,
      nota: "Fogo, que é a arma contra quase tudo. Gasta gás e denuncia pela luz.",
    },
  ],
  negociador: [
    {
      chave: "revolver",
      nome: "Revólver",
      atributo: "percepcao",
      dano: "2d6",
      barulhenta: true,
      nota: "Menos arma e mais argumento. Todo mundo entende o que ele significa.",
    },
    {
      chave: "cassetete",
      nome: "Cassetete",
      atributo: "forca",
      dano: "1d6",
      barulhenta: false,
      nota: "Machuca sem matar, e é isso que resolve briga entre gente.",
    },
  ],
};

export function armasDe(especializacao: string | null | undefined) {
  return especializacao ? (ARMAS[especializacao] ?? null) : null;
}

export function acharArma(especializacao: string | null | undefined, chave: string) {
  return armasDe(especializacao)?.find((a) => a.chave === chave) ?? null;
}
