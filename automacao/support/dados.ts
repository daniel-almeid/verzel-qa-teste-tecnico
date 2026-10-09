export const PRODUTOS = {
  P001: { id: 'P001', nome: 'Camiseta Essencial', precoCentavos: 5990 },
  P002: { id: 'P002', nome: 'Calça Jeans Slim', precoCentavos: 13990 },
  P003: { id: 'P003', nome: 'Tênis Casual Urbano', precoCentavos: 18990 },
  P004: { id: 'P004', nome: 'Boné Aba Curva', precoCentavos: 4990 },
  P005: { id: 'P005', nome: 'Mochila Urbana 20L', precoCentavos: 10000 },
  P006: { id: 'P006', nome: 'Kit 3 Pares de Meias', precoCentavos: 2990 },
  P007: { id: 'P007', nome: 'Jaqueta Corta-Vento', precoCentavos: 22990 },
  P008: { id: 'P008', nome: 'Garrafa Térmica 750ml', precoCentavos: 5000 },
} as const;

export type ProdutoId = keyof typeof PRODUTOS;
export const TODOS_OS_PRODUTOS = Object.keys(PRODUTOS) as ProdutoId[];

export const CUPONS = {
  valido: 'BEMVINDO10',
  expirado: 'VERAO2026',
  inexistente: 'XPTO',
} as const;

export const REGRAS = {
  percentualCupom: 10,
  freteGratisAPartirDe: 20000,
  freteFixo: 1990,
  maxUnidadesPorProduto: 5,
} as const;

export const CLIENTE_VALIDO = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  cep: '01310-100',
};
