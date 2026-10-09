import { PRODUTOS, ProdutoId, REGRAS } from './dados';

export type Item = { produtoId: ProdutoId; quantidade: number };

export const paraCentavos = (reais: number): number => Math.round(reais * 100);

export function textoParaCentavos(texto: string): number {
  if (/gr[aá]tis/i.test(texto)) return 0;
  const numero = texto.replace(/[^\d,]/g, '').replace(',', '.');
  return Math.round(parseFloat(numero) * 100);
}

export const brl = (valor: string): RegExp => new RegExp(`^R\\$\\s*${valor.replace('.', '\\.')}$`);

export type Resumo = {
  subtotal: number;
  desconto: number;
  frete: number;
  freteGratis: boolean;
  faltante: number;
  total: number;
};

export function calcularEsperado(itens: Item[], comCupomValido = false): Resumo {
  const subtotal = itens.reduce((soma, i) => soma + PRODUTOS[i.produtoId].precoCentavos * i.quantidade, 0);
  const desconto = comCupomValido ? Math.round((subtotal * REGRAS.percentualCupom) / 100) : 0;
  const freteGratis = subtotal >= REGRAS.freteGratisAPartirDe; // CA08: antes do desconto
  const frete = freteGratis ? 0 : REGRAS.freteFixo; // CA09: desconto não incide sobre o frete
  const faltante = Math.max(0, REGRAS.freteGratisAPartirDe - subtotal);
  return { subtotal, desconto, frete, freteGratis, faltante, total: subtotal - desconto + frete };
}
