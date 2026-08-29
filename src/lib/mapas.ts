/** Mapas da campanha. Conteúdo estático — arquivos em public/mapas. */

export type Mapa = {
  chave: string;
  nome: string;
  arquivo: string;
  /** o da região, que fica aberto por padrão */
  principal?: boolean;
};

export const MAPAS: Mapa[] = [
  {
    chave: "campinas",
    nome: "Campinas",
    arquivo: "/mapas/campinas.webp",
    principal: true,
  },
  { chave: "base", nome: "Base Inicial", arquivo: "/mapas/base.webp" },
  { chave: "usina", nome: "Usina", arquivo: "/mapas/usina.webp" },
  { chave: "clareira", nome: "Clareira", arquivo: "/mapas/clareira.webp" },
  {
    chave: "zona-quimica",
    nome: "Zona Química",
    arquivo: "/mapas/zona-quimica.webp",
  },
  { chave: "shopping", nome: "Shopping", arquivo: "/mapas/shopping.webp" },
  { chave: "hospital", nome: "Hospital", arquivo: "/mapas/hospital.webp" },
  { chave: "terminal", nome: "Terminal", arquivo: "/mapas/terminal.webp" },
];

export const MAPA_PADRAO =
  MAPAS.find((m) => m.principal) ?? MAPAS[0];

export function acharMapa(chave: string | null | undefined) {
  return MAPAS.find((m) => m.chave === chave) ?? MAPA_PADRAO;
}
