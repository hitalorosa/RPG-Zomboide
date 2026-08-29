/**
 * Caracterização do personagem. Conteúdo estático — o banco guarda só as
 * escolhas, num único campo jsonb.
 */

export type Aparencia = {
  pele: string;
  rosto: string;
  cabelo: string;
  corPelos: string;
  barba: string;
  roupa: string;
  corRoupa: string;
  chapeu: string;
  marca: string;
  tatuagem: string;
};

export const APARENCIA_PADRAO: Aparencia = {
  pele: "#a9744f",
  rosto: "neutro",
  cabelo: "curto",
  corPelos: "#2a2118",
  barba: "nenhuma",
  roupa: "camiseta",
  corRoupa: "#5a6350",
  chapeu: "nenhum",
  marca: "nenhuma",
  tatuagem: "nenhuma",
};

/* ------------------------------- cores ------------------------------- */

export const TONS_PELE = [
  "#f2d5bd",
  "#e5bd9a",
  "#d3a074",
  "#bd8556",
  "#a9744f",
  "#8a5a3b",
  "#6b452c",
  "#4a2f1d",
];

export const CORES_PELOS = [
  "#141110",
  "#2a2118",
  "#4a331f",
  "#6b4a2a",
  "#946434",
  "#c39c58",
  "#8c3b22",
  "#7d7d78",
  "#d8d3c6",
];

export const CORES_ROUPA = [
  "#5a6350",
  "#3f4a3a",
  "#6b5540",
  "#8a4a32",
  "#4a4f5c",
  "#2f3330",
  "#7d7566",
  "#a03a28",
];

/* ------------------------------- peças ------------------------------- */

export type Opcao = { chave: string; nome: string };

export const ROSTOS: Opcao[] = [
  { chave: "neutro", nome: "Neutro" },
  { chave: "cansado", nome: "Cansado" },
  { chave: "duro", nome: "Duro" },
  { chave: "jovem", nome: "Jovem" },
  { chave: "atento", nome: "Atento" },
];

export const CABELOS: Opcao[] = [
  { chave: "raspado", nome: "Raspado" },
  { chave: "curto", nome: "Curto" },
  { chave: "medio", nome: "Médio" },
  { chave: "longo", nome: "Longo" },
  { chave: "coque", nome: "Coque" },
  { chave: "rabo", nome: "Rabo de cavalo" },
  { chave: "moicano", nome: "Moicano" },
  { chave: "careca", nome: "Careca" },
];

export const BARBAS: Opcao[] = [
  { chave: "nenhuma", nome: "Nenhuma" },
  { chave: "porFazer", nome: "Por fazer" },
  { chave: "cavanhaque", nome: "Cavanhaque" },
  { chave: "bigode", nome: "Bigode" },
  { chave: "cheia", nome: "Cheia" },
];

export const ROUPAS: Opcao[] = [
  { chave: "camiseta", nome: "Camiseta" },
  { chave: "camisa", nome: "Camisa" },
  { chave: "jaqueta", nome: "Jaqueta" },
  { chave: "moletom", nome: "Moletom" },
  { chave: "colete", nome: "Colete" },
  { chave: "macacao", nome: "Macacão" },
];

export const CHAPEUS: Opcao[] = [
  { chave: "nenhum", nome: "Nenhum" },
  { chave: "bone", nome: "Boné" },
  { chave: "boneTras", nome: "Boné pra trás" },
  { chave: "bandana", nome: "Bandana" },
  { chave: "capuz", nome: "Capuz" },
  { chave: "palha", nome: "Chapéu de palha" },
];

export const MARCAS: Opcao[] = [
  { chave: "nenhuma", nome: "Nenhuma" },
  { chave: "olho", nome: "Corte no olho" },
  { chave: "bochecha", nome: "Corte na bochecha" },
  { chave: "queixo", nome: "Corte no queixo" },
  { chave: "queimadura", nome: "Queimadura" },
  { chave: "mordida", nome: "Marca de mordida" },
];

export const TATUAGENS: Opcao[] = [
  { chave: "nenhuma", nome: "Nenhuma" },
  { chave: "pescoco", nome: "No pescoço" },
  { chave: "rosto", nome: "No rosto" },
  { chave: "ombro", nome: "No ombro" },
];

/* ---------------------------- para a tela ---------------------------- */

export const GRUPOS = [
  { titulo: "Pele", campo: "pele", tipo: "cor", cores: TONS_PELE },
  { titulo: "Rosto", campo: "rosto", tipo: "peca", opcoes: ROSTOS },
  { titulo: "Cabelo", campo: "cabelo", tipo: "peca", opcoes: CABELOS },
  { titulo: "Cor dos pelos", campo: "corPelos", tipo: "cor", cores: CORES_PELOS },
  { titulo: "Barba", campo: "barba", tipo: "peca", opcoes: BARBAS },
  { titulo: "Roupa", campo: "roupa", tipo: "peca", opcoes: ROUPAS },
  { titulo: "Cor da roupa", campo: "corRoupa", tipo: "cor", cores: CORES_ROUPA },
  { titulo: "Chapéu", campo: "chapeu", tipo: "peca", opcoes: CHAPEUS },
  { titulo: "Marca", campo: "marca", tipo: "peca", opcoes: MARCAS },
  { titulo: "Tatuagem", campo: "tatuagem", tipo: "peca", opcoes: TATUAGENS },
] as const;

/** Sorteia uma aparência — útil pra quem não quer escolher nada. */
export function aparenciaAleatoria(): Aparencia {
  const um = <T,>(lista: readonly T[]) =>
    lista[Math.floor(Math.random() * lista.length)];
  return {
    pele: um(TONS_PELE),
    rosto: um(ROSTOS).chave,
    cabelo: um(CABELOS).chave,
    corPelos: um(CORES_PELOS),
    barba: um(BARBAS).chave,
    roupa: um(ROUPAS).chave,
    corRoupa: um(CORES_ROUPA),
    chapeu: um(CHAPEUS).chave,
    marca: um(MARCAS).chave,
    tatuagem: um(TATUAGENS).chave,
  };
}
