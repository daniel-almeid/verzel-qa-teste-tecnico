import { Locator, Page, expect } from '@playwright/test';
import { textoParaCentavos } from '../support/calculo';

export type CampoResumo = 'subtotal' | 'desconto' | 'frete' | 'total';

export class CarrinhoPage {
  constructor(private readonly page: Page) {}

  get titulo(): Locator {
    return this.page.getByRole('heading', { name: 'Carrinho', exact: true });
  }

  get tituloVazio(): Locator {
    return this.page.getByRole('heading', { name: 'Seu carrinho está vazio' });
  }

  async aguardarCarregado(): Promise<void> {
    await expect(this.titulo).toBeVisible();
  }

  resumo(campo: CampoResumo): Locator {
    return this.page.locator(`dd[data-valor="${campo}"]`);
  }

  async centavos(campo: CampoResumo): Promise<number> {
    return textoParaCentavos(await this.resumo(campo).innerText());
  }

  async aplicarCupom(codigo: string): Promise<void> {
    await this.page.getByLabel('Cupom de desconto').fill(codigo);
    await this.page.getByRole('button', { name: 'Aplicar cupom' }).click();
  }

  quantidade(produto: string): Locator {
    return this.page.locator(`output[aria-label="Quantidade de ${produto}"]`);
  }

  aumentar(produto: string): Locator {
    return this.page.getByRole('button', { name: `Aumentar quantidade de ${produto}` });
  }

  diminuir(produto: string): Locator {
    return this.page.getByRole('button', { name: `Diminuir quantidade de ${produto}` });
  }

  remover(produto: string): Locator {
    return this.page.getByRole('button', { name: `Remover ${produto} do carrinho` });
  }

  get removerCupom(): Locator {
    return this.page.getByText("Remover cupom");
  }

  async finalizarCompra(): Promise<void> {
    await this.page.getByRole("link", { name: "Finalizar compra" }).click();
  }

  get esvaziar(): Locator {
    return this.page.getByRole('button', { name: 'Esvaziar carrinho' });
  }
}
