import { test, expect } from '../../support/fixtures';
import { CLIENTE_VALIDO, CUPONS } from '../../support/dados';
import { Item } from '../../support/calculo';
import { abrirCarrinhoCom, abrirCheckoutCom } from '../../support/fluxos';

const mochila1: Item[] = [{ produtoId: 'P005', quantidade: 1 }];
const entregaValida = {
  nome: CLIENTE_VALIDO.nome,
  email: CLIENTE_VALIDO.email,
  cep: CLIENTE_VALIDO.cep,
};

test.describe('Checkout — resumo do pedido', () => {
  const casos = [
    { nome: 'sem cupom', cupom: undefined },
    { nome: 'com cupom BEMVINDO10', cupom: CUPONS.valido },
  ];

  for (const c of casos) {
    test(`CT55 o resumo do checkout é igual ao do carrinho (${c.nome})`, async ({ vitrine, carrinho, checkout }) => {
      await abrirCarrinhoCom(vitrine, carrinho, mochila1);
      if (c.cupom) {
        await carrinho.aplicarCupom(c.cupom);
        await carrinho.removerCupom.waitFor();
      }
      const noCarrinho = {
        subtotal: await carrinho.centavos('subtotal'),
        desconto: await carrinho.centavos('desconto'),
        frete: await carrinho.centavos('frete'),
        total: await carrinho.centavos('total'),
      };

      await carrinho.finalizarCompra();
      await checkout.aguardarCarregado();

      await expect.poll(() => checkout.centavos('subtotal')).toBe(noCarrinho.subtotal);
      await expect.poll(() => checkout.centavos('desconto')).toBe(noCarrinho.desconto);
      await expect.poll(() => checkout.centavos('frete')).toBe(noCarrinho.frete);
      await expect.poll(() => checkout.centavos('total')).toBe(noCarrinho.total);
      await expect(checkout.itensDoResumo).toHaveCount(1);
      await expect(checkout.itensDoResumo.first()).toContainText('1x Mochila Urbana 20L');
    });
  }

  test('CT61 "Voltar ao carrinho" mantém o item e o cupom aplicado', async ({ vitrine, carrinho, checkout }) => {
    await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1, CUPONS.valido);
    await checkout.voltarAoCarrinho.click();
    await carrinho.aguardarCarregado();
    await expect(carrinho.quantidade('Mochila Urbana 20L')).toHaveText('1');
    await expect(carrinho.resumo('desconto')).toContainText('10,00');
  });
});

test.describe('Checkout — confirmação do pedido', () => {
  test('CT56 pedido válido é confirmado com selo, número VZ-000000, nome e resumo @smoke', async ({ vitrine, carrinho, checkout }) => {
    await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1, CUPONS.valido);
    const antes = {
      subtotal: await checkout.centavos('subtotal'),
      desconto: await checkout.centavos('desconto'),
      frete: await checkout.centavos('frete'),
      total: await checkout.centavos('total'),
    };

    await checkout.preencher(entregaValida);
    await checkout.confirmar();

    await expect(checkout.seloConfirmacao).toBeVisible();
    await expect(checkout.numeroDoPedido).toHaveText(/^VZ-\d{6}$/);
    await expect(checkout.saudacao).toContainText('Maria');

    await expect.poll(() => checkout.centavos('subtotal')).toBe(antes.subtotal);
    await expect.poll(() => checkout.centavos('desconto')).toBe(antes.desconto);
    await expect.poll(() => checkout.centavos('frete')).toBe(antes.frete);
    await expect.poll(() => checkout.centavos('total')).toBe(antes.total);
    await expect(checkout.itensDoResumo.first()).toContainText('1x Mochila Urbana 20L');
  });

  test('CT62 depois de confirmar, o carrinho é esvaziado', async ({ vitrine, carrinho, checkout }) => {
    await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
    await checkout.preencher(entregaValida);
    await checkout.confirmar();
    await expect(checkout.numeroDoPedido).toBeVisible();

    await expect(vitrine.contadorCarrinho).toHaveText('0');
    await vitrine.irParaCarrinho();
    await expect(carrinho.tituloVazio).toBeVisible();
  });

  test('CT63 "Continuar comprando" volta para a vitrine', async ({ vitrine, carrinho, checkout }) => {
    await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
    await checkout.preencher(entregaValida);
    await checkout.confirmar();
    await expect(checkout.numeroDoPedido).toBeVisible();

    await checkout.continuarComprando.click();
    await expect(vitrine.produtos).toHaveCount(8);
  });

  for (const cep of ['01310100', '01310-100']) {
    test(`CT60 CEP válido ${JSON.stringify(cep)} é aceito`, async ({ vitrine, carrinho, checkout }) => {
      await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
      await checkout.preencher({ ...entregaValida, cep });
      await checkout.confirmar();
      await expect(checkout.numeroDoPedido).toHaveText(/^VZ-\d{6}$/);
    });
  }
});

test.describe('Checkout — validação do formulário (regras pré-existentes)', () => {
  test('CT57 nome sem sobrenome é rejeitado com mensagem', async ({ vitrine, carrinho, checkout }) => {
    await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
    await checkout.preencher({ ...entregaValida, nome: 'Maria' });
    await checkout.confirmar();

    await expect.poll(() => checkout.mensagemDe('nome')).toMatch(/nome e sobrenome/i);
    await expect(checkout.numeroDoPedido).toHaveCount(0);
    await expect(checkout.botaoConfirmar).toBeVisible();
  });

  for (const email of ['maria@', 'maria.com']) {
    test(`CT58 e-mail ${JSON.stringify(email)} é rejeitado com mensagem`, async ({ vitrine, carrinho, checkout }) => {
      await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
      await checkout.preencher({ ...entregaValida, email });
      await checkout.confirmar();

      await expect.poll(() => checkout.mensagemDe('email')).not.toBe('');
      await expect(checkout.numeroDoPedido).toHaveCount(0);
    });
  }

  for (const cep of ['0131010', '013101000', '0131A100', '']) {
    test(`CT59 CEP ${JSON.stringify(cep)} é rejeitado com mensagem`, async ({ vitrine, carrinho, checkout }) => {
      await abrirCheckoutCom(vitrine, carrinho, checkout, mochila1);
      await checkout.preencher({ ...entregaValida, cep });
      await checkout.confirmar();

      await expect.poll(() => checkout.mensagemDe('cep')).not.toBe('');
      await expect(checkout.numeroDoPedido).toHaveCount(0);
    });
  }
});
