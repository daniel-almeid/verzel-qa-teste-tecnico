import { PRODUTOS } from "./dados";
import { Item } from "./calculo";
import { VitrinePage } from "../pages/vitrine.page";
import { CarrinhoPage } from "../pages/carrinho.page";
import { CheckoutPage } from "../pages/checkout.page";

export async function abrirCarrinhoCom(vitrine: VitrinePage, carrinho: CarrinhoPage, itens: Item[]): Promise<void> {
  await vitrine.abrir();
  for (const i of itens) await vitrine.adicionar(PRODUTOS[i.produtoId].nome, i.quantidade);
  await vitrine.irParaCarrinho();
  await carrinho.aguardarCarregado();
}

export async function abrirCheckoutCom(
  vitrine: VitrinePage,
  carrinho: CarrinhoPage,
  checkout: CheckoutPage,
  itens: Item[],
  cupom?: string,
): Promise<void> {
  await abrirCarrinhoCom(vitrine, carrinho, itens);
  if (cupom) {
    await carrinho.aplicarCupom(cupom);
    await carrinho.removerCupom.waitFor();
  }
  await carrinho.finalizarCompra();
  await checkout.aguardarCarregado();
}
