import { test as base, expect } from '@playwright/test';
import { VerzelApi } from './api-client';
import { VitrinePage } from '../pages/vitrine.page';
import { CarrinhoPage } from '../pages/carrinho.page';
import { CheckoutPage } from '../pages/checkout.page';

type Fixtures = {
  api: VerzelApi;
  vitrine: VitrinePage;
  carrinho: CarrinhoPage;
  checkout: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => use(new VerzelApi(request)),
  vitrine: async ({ page }, use) => use(new VitrinePage(page)),
  carrinho: async ({ page }, use) => use(new CarrinhoPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
