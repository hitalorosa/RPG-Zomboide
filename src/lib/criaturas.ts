/**
 * As onze criaturas. Conteúdo estático — o banco guarda só quais já foram
 * reveladas (tabela `descobertas`).
 *
 * A ordem aqui é a ordem de apresentação sugerida: cada tipo quebra a lição
 * que o anterior ensinou.
 */

export type Criatura = {
  chave: string;
  nome: string;
  arquivo: string;
  /** o que ele percebe */
  le: string;
  /** o comportamento que ele castiga */
  pune: string;
  /** como se lida */
  contra: string;
  /** a lição que ele ensina ou quebra */
  licao: string;
  /** já nasce revelado */
  inicial?: boolean;
};

export const CRIATURAS: Criatura[] = [
  {
    chave: "comum",
    nome: "Comum",
    arquivo: "/criaturas/comum.webp",
    le: "Proximidade e ruído grosseiro",
    pune: "Nada em especial — é a linha de base",
    contra: "Um a um, com qualquer coisa",
    licao: "Ensina: dá pra lidar",
    inicial: true,
  },
  {
    chave: "corredor",
    nome: "Corredor",
    arquivo: "/criaturas/corredor.webp",
    le: "Proximidade, como o Comum",
    pune: "Achar que dá pra correr",
    contra: "Terreno, porta, altura — velocidade não resolve",
    licao: "Quebra: correr era a resposta certa até agora",
    inicial: true,
  },
  {
    chave: "estalador",
    nome: "Estalador",
    arquivo: "/criaturas/estalador.webp",
    le: "O eco do próprio clique. É cego",
    pune: "Fazer barulho",
    contra: "Imobilidade absoluta, ou ruído mais alto em outro lugar",
    licao: "Ensina: fique quieto",
  },
  {
    chave: "acido",
    nome: "Ácido",
    arquivo: "/criaturas/acido.webp",
    le: "Só proximidade",
    pune: "Corpo a corpo — e saquear o corpo depois",
    contra: "Distância. Nunca encostar no cadáver",
    licao: "Ensina: o prêmio pode ser a armadilha",
  },
  {
    chave: "berrante",
    nome: "Berrante",
    arquivo: "/criaturas/berrante.webp",
    le: "Visão. Ele te vê primeiro",
    pune: "Ser visto, e hesitar",
    contra: "Um golpe, silencioso, antes do grito",
    licao: "Quebra: agora ser visto custa a cidade inteira",
  },
  {
    chave: "tecelao",
    nome: "Tecelão",
    arquivo: "/criaturas/tecelao.webp",
    le: "Contato. Espera no teto",
    pune: "Não olhar pra cima",
    contra: "Iluminar o teto antes de entrar",
    licao: "Quebra: o perigo não está na sua frente",
  },
  {
    chave: "gigante",
    nome: "Gigante",
    arquivo: "/criaturas/gigante.webp",
    le: "Nada. Segue os outros",
    pune: "Enfrentar de frente",
    contra: "Terreno e vão estreito. Não é combate, é geografia",
    licao: "Ensina: nem tudo se mata",
  },
  {
    chave: "couracado",
    nome: "Couraçado",
    arquivo: "/criaturas/couracado.webp",
    le: "Nada. Simplesmente vem",
    pune: "Insistir em munição",
    contra: "Fogo — a carapaça retém calor e não dissipa",
    licao: "Quebra: munição não resolve. E tira o descanso",
  },
  {
    chave: "semeador",
    nome: "Semeador",
    arquivo: "/criaturas/semeador.webp",
    le: "Visão, à distância",
    pune: "Ficar exposto em campo aberto",
    contra: "Distância, cobertura, pano molhado no rosto",
    licao: "Quebra: vencer o combate não resolve nada",
  },
  {
    chave: "alien",
    nome: "Alien",
    arquivo: "/criaturas/alien.webp",
    le: "Calor do corpo — e o pico que o pânico produz",
    pune: "Ter medo. Literalmente",
    contra: "Frio, imobilidade e sangue-frio",
    licao: "Quebra tudo: não basta quieto e parado, tem que estar calmo",
  },
  {
    chave: "falante",
    nome: "Falante",
    arquivo: "/criaturas/falante.webp",
    le: "Você. E sabe o que você quer ouvir",
    pune: "Confiar",
    contra: "Senha combinada. Perguntas que só um vivo responde",
    licao: "Quebra a confiança entre pessoas",
  },
];

export const CHAVE_CRIATURA = (c: string) => `criatura:${c}`;
