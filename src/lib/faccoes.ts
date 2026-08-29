/**
 * Facções e seus rostos. Conteúdo estático — o banco guarda só quem já foi
 * revelado (tabela `descobertas`).
 */

export type Rosto = {
  chave: string;
  nome: string;
  papel: string;
  arquivo: string;
  sobre: string;
  /** já nasce revelado */
  inicial?: boolean;
};

export type Faccao = {
  chave: string;
  nome: string;
  resumo: string;
  sobrevive: string;
  rostos: Rosto[];
};

export const FACCOES: Faccao[] = [
  {
    chave: "conselho",
    nome: "O Conselho",
    resumo:
      "Manda na Base e na Usina. Não há um dono — há um comitê, e ele vota. Tudo vira ata.",
    sobrevive: "Sobrevive por muro, procedimento e monopólio.",
    rostos: [
      {
        chave: "wilson",
        nome: "Wilson Amadeu",
        papel: "Líder",
        arquivo: "/faccoes/wilson.webp",
        sobre:
          "Preside, redige a ata, desempata. Não anda armado porque não precisa. Foi ele quem escreveu as primeiras regras quando a Base estava se despedaçando — e elas funcionaram. \"Não fui eu, foi decidido.\" E ele escreveu a decisão.",
        inicial: true,
      },
      {
        chave: "neide",
        nome: "Neide Sampaio",
        papel: "Saúde",
        arquivo: "/faccoes/neide.webp",
        sobre:
          "Aprendeu medicina fazendo, não estudando. Costura, tala, amputa — e sabe exatamente o quanto não sabe. Mãos em carne viva de lavar em água de poço. Foi ela quem cortou o NPC da lista de racionamento. E tinha razão.",
        inicial: true,
      },
      {
        chave: "bandeira",
        nome: "Everaldo Bandeira",
        papel: "Muro",
        arquivo: "/faccoes/bandeira.webp",
        sobre:
          "O mais duro dos seis, e o mais novo. Equipado igual à tropa, porque ele é a tropa. Comanda por apito, não por grito — grito chama. É quem vai atrás dos que fogem, e não vai por raiva.",
        inicial: true,
      },
      {
        chave: "rosana",
        nome: "Rosana Vieira",
        papel: "Trabalho",
        arquivo: "/faccoes/rosana.webp",
        sobre:
          "Eleita por quem dorme nas garagens. Uma cadeira contra cinco. Sabe que a cadeira dela é decoração e vai a todas as reuniões mesmo assim. Votou contra o corte. Perdeu. Carrega as próprias anotações de cada reunião, dobradas no bolso.",
        inicial: true,
      },
      {
        chave: "soldado",
        nome: "Soldado do Conselho",
        papel: "Tropa",
        arquivo: "/faccoes/soldado.webp",
        sobre:
          "Armadura de correia transportadora e banda de pneu, tudo saído da Usina. Fivela enrolada em pano e fita para não tinir. Facão na mão e espingarda nas costas — tiro é barulho, e barulho convoca. Faixa vermelha no braço esquerdo.",
        inicial: true,
      },
    ],
  },
  {
    chave: "cicatrizes",
    nome: "Os Cicatrizes",
    resumo:
      "Vivem na mata que tomou o Taquaral. Matam tudo que entra — gente ou infectado.",
    sobrevive: "Sobrevive por silêncio absoluto.",
    rostos: [
      {
        chave: "cicatriz",
        nome: "Cicatriz",
        papel: "Caçador",
        arquivo: "/faccoes/cicatriz.webp",
        sobre:
          "Arco de bambu, pé sem sola dura, nada que chacoalhe no corpo inteiro. Pararam de falar porque barulho é morte, e o silêncio virou cultura. Matam quem entra porque quem sai conta a alguém onde eles estão.\n\nAs cicatrizes no rosto são a escrita deles: dizem quem é, o que fez, quantos perdeu. Por isso andam de rosto coberto — e por isso descobrir o rosto é o gesto inteiro.",
      },
    ],
  },
];

export const CHAVE_ROSTO = (c: string) => `faccao:${c}`;
