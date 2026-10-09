import { Locator, Page } from '@playwright/test';

export class VitrinePage {
  constructor(private readonly page: Page) { }

  async abrir(): Promise<void> {
    await this.page.goto('/');
  }

  get produtos(): Locator {
    return this.page.locator('.produto');
  }

  get contadorCarrinho(): Locator {
    return this.page.locator('.contador-carrinho');
  }

  card(nome: string): Locator {
    return this.page.locator('article', { hasText: nome });
  }

  botaoAdicionar(nome: string): Locator {
    return this.card(nome).getByRole('button', { name: 'Adicionar ao carrinho' });
  }

  async adicionar(nome: string, vezes = 1): Promise<void> {
    for (let i = 0; i < vezes; i++) await this.botaoAdicionar(nome).click();
  }

  async irParaCarrinho(): Promise<void> {
    await this.page.getByRole('link', { name: /^Carrinho/ }).click();
  }
}
