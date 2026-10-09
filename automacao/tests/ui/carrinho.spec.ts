import { test, expect } from '../../support/fixtures';
import { CUPONS, PRODUTOS } from '../../support/dados';
import { Item, brl, paraCentavos } from '../../support/calculo';
import { abrirCarrinhoCom } from '../../support/fluxos';

const mochila1: Item[] = [{ produtoId: 'P005', quantidade: 1 }];
const mochila2: Item[] = [{ produtoId: 'P005', quantidade: 2 }];
const camisetaMaisCalca: Item[] = [
  { produtoId: 'P001', quantidade: 1 },
  { produtoId: 'P002', quantidade: 1 },
];

test.describe('Carrinho — estado e itens', () => {
  test('CT20 carrinho vazio mostra mensagem e link para a vitrine', async ({ page, carrinho }) => {
    await page.goto('/carrinho');
    await expect(carrinho.tituloVazio).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver produtos' })).toBeVisible();
  });

  test('CT38 alterar quantidade, remover item e esvaziar recalcula o resumo', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, [
      { produtoId: 'P001', quantidade: 1 },
      { produtoId: 'P004', quantidade: 1 },
    ]);
    await expect(carrinho.resumo('subtotal')).toHaveText(brl('109,80'));

    await carrinho.aumentar(PRODUTOS.P004.nome).click();
    await expect(carrinho.resumo('subtotal')).toHaveText(brl('159,70'));

    await carrinho.remover(PRODUTOS.P004.nome).click();
    await expect(carrinho.resumo('subtotal')).toHaveText(brl('59,90'));

    await carrinho.esvaziar.click();
    await expect(carrinho.tituloVazio).toBeVisible();
  });

  test('CT21 CA10 o botão "+" não deixa passar de 5 unidades', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, [{ produtoId: 'P001', quantidade: 1 }]);
    for (let i = 0; i < 6; i++) await carrinho.aumentar(PRODUTOS.P001.nome).click({ force: true });
    await expect(carrinho.quantidade(PRODUTOS.P001.nome)).toHaveText('5');
  });
});

test.describe('Carrinho — cupom', () => {
  test('CT01 CT10 BEMVINDO10 em P005 x1: desconto 10, frete 19,90, total 109,90 @smoke', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila1);
    await expect(carrinho.resumo('subtotal')).toHaveText(brl('100,00'));
    await carrinho.aplicarCupom(CUPONS.valido);
    await expect(carrinho.resumo('desconto')).toContainText('10,00');
    await expect(carrinho.resumo('frete')).toContainText('19,90');
    await expect(carrinho.resumo('total')).toHaveText(brl('109,90'));
  });

  test('CT02 CT03 CA02 cupom em minúsculas e com espaços é aceito', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila1);
    await carrinho.aplicarCupom('  bemvindo10  ');
    await expect(carrinho.resumo('desconto')).toContainText('10,00');
  });

  test('CT05 CA03 cupom inexistente: "Cupom inválido." e sem desconto', async ({ page, vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila1);
    await carrinho.aplicarCupom(CUPONS.inexistente);
    await expect(page.getByText('Cupom inválido.')).toBeVisible();
    await expect(carrinho.resumo('desconto')).toContainText('0,00');
  });

  test('CT06 CA04 cupom expirado: "Cupom expirado." e sem desconto', async ({ page, vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila1);
    await carrinho.aplicarCupom(CUPONS.expirado);
    await expect(page.getByText('Cupom expirado.')).toBeVisible();
    await expect(carrinho.resumo('desconto')).toContainText('0,00');
  });
});

test.describe('Carrinho — frete', () => {
  test('CT15 CA07 abaixo de R$ 200 cobra frete e informa quanto falta', async ({ page, vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila1);
    await expect(carrinho.resumo('frete')).toContainText('19,90');
    await expect(page.getByText(/falt/i).first()).toContainText('100,00');
  });

  test('CT13 [BUG-001] CA06 subtotal exatamente R$ 200,00 tem frete grátis @smoke', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila2);
    await expect(carrinho.resumo('subtotal')).toHaveText(brl('200,00'));
    await expect(carrinho.resumo('frete')).toHaveText('Grátis');
    await expect(carrinho.resumo('total')).toHaveText(brl('200,00'));
  });

  test('CT16 [BUG-001] CA08 frete grátis considera o subtotal antes do desconto', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, mochila2);
    await carrinho.aplicarCupom(CUPONS.valido);
    await expect(carrinho.resumo('desconto')).toContainText('20,00');
    await expect(carrinho.resumo('frete')).toHaveText('Grátis');
    await expect(carrinho.resumo('total')).toHaveText(brl('180,00'));
  });

  test('CT17 CA08 subtotal 199,80 com cupom continua pagando frete', async ({ vitrine, carrinho }) => {
    await abrirCarrinhoCom(vitrine, carrinho, camisetaMaisCalca);
    await carrinho.aplicarCupom(CUPONS.valido);
    await expect(carrinho.resumo('desconto')).toContainText('19,98');
    await expect(carrinho.resumo('frete')).toContainText('19,90');
    await expect(carrinho.resumo('total')).toHaveText(brl('199,72'));
  });
});

test.describe('Consistência UI × API', () => {
  const casos: Array<{ nome: string; itens: Item[]; cupom: boolean }> = [
    { nome: 'abaixo do limite, sem cupom', itens: camisetaMaisCalca, cupom: false },
    { nome: 'abaixo do limite, com cupom', itens: camisetaMaisCalca, cupom: true },
    { nome: 'no limite, com cupom', itens: mochila2, cupom: true },
    { nome: 'acima do limite, vários itens', itens: [{ produtoId: 'P001', quantidade: 2 }, { produtoId: 'P002', quantidade: 1 }, { produtoId: 'P003', quantidade: 1 }], cupom: true },
  ];

  for (const c of casos) {
    test(`CT33 a UI exibe o mesmo que a API calcula: ${c.nome}`, async ({ api, vitrine, carrinho }) => {
      await abrirCarrinhoCom(vitrine, carrinho, c.itens);
      if (c.cupom) await carrinho.aplicarCupom(CUPONS.valido);

      const res = await api.calcular(c.itens, c.cupom ? CUPONS.valido : undefined);
      expect(res.status()).toBe(200);
      const b = await res.json();

      await expect.poll(() => carrinho.centavos('subtotal')).toBe(paraCentavos(b.subtotal));
      await expect.poll(() => carrinho.centavos('desconto')).toBe(paraCentavos(b.desconto));
      await expect.poll(() => carrinho.centavos('frete')).toBe(paraCentavos(b.frete));
      await expect.poll(() => carrinho.centavos('total')).toBe(paraCentavos(b.total));
    });
  }
});
