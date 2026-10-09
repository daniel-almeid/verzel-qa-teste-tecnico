import { test, expect } from '../../support/fixtures';
import { CUPONS } from '../../support/dados';
import { paraCentavos } from '../../support/calculo';

test.describe('POST /api/pedidos — pedido válido', () => {
  test('CT40 pedido com cupom: 201, número VZ-000000, CEP normalizado e valores corretos @smoke', async ({ api }) => {
    const res = await api.criarPedido({ cupom: CUPONS.valido });
    expect(res.status()).toBe(201);
    const b = await res.json();
    expect(b.numero).toMatch(/^VZ-\d{6}$/);
    expect(b.cliente.cep).toBe('01310100'); // A09
    expect(b).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, freteGratis: false });
    expect(paraCentavos(b.total)).toBe(10990);
  });
});

test.describe('POST /api/pedidos — dados do cliente (regras pré-existentes)', () => {
  test('CT41 nome sem sobrenome: DADOS_INVALIDOS', async ({ api }) => {
    const res = await api.criarPedido({ cliente: { nome: 'Maria' } });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('DADOS_INVALIDOS');
  });

  for (const email of ['maria@', 'maria.com', 'maria@exemplo', '@exemplo.com']) {
    test(`CT42 e-mail ${JSON.stringify(email)} inválido: DADOS_INVALIDOS`, async ({ api }) => {
      const res = await api.criarPedido({ cliente: { email } });
      expect(res.status()).toBe(422);
      expect((await res.json()).erro.codigo).toBe('DADOS_INVALIDOS');
    });
  }

  // Partição de equivalência + valor limite no tamanho do CEP (8 dígitos, com ou sem hífen).
  const ceps: Array<[string, number]> = [
    ['01310100', 201],
    ['01310-100', 201],
    ['0131010', 422], // 7 dígitos
    ['013101000', 422], // 9 dígitos
    ['0131A100', 422], // letra
    ['', 422],
  ];
  for (const [cep, status] of ceps) {
    test(`CT43 CEP ${JSON.stringify(cep)} → ${status}`, async ({ api }) => {
      const res = await api.criarPedido({ cliente: { cep } });
      expect(res.status()).toBe(status);
      if (status === 422) expect((await res.json()).erro.codigo).toBe('DADOS_INVALIDOS');
    });
  }
});

test.describe('POST /api/pedidos — cupom, itens e quantidade', () => {
  test('CT44 cupom inexistente: CUPOM_INVALIDO', async ({ api }) => {
    const res = await api.criarPedido({ cupom: CUPONS.inexistente });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('CUPOM_INVALIDO');
  });

  test('CT45 cupom expirado: CUPOM_EXPIRADO', async ({ api }) => {
    const res = await api.criarPedido({ cupom: CUPONS.expirado });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('CUPOM_EXPIRADO');
  });

  test('CT46 pedido sem itens: ITENS_OBRIGATORIOS', async ({ api }) => {
    const res = await api.criarPedido({ itens: [] });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('ITENS_OBRIGATORIOS');
  });

  test('CT23 [BUG-002] quantidade 6 no pedido: QUANTIDADE_MAXIMA_EXCEDIDA (CA10 vale na API)', async ({ api }) => {
    const res = await api.criarPedido({ itens: [{ produtoId: 'P001', quantidade: 6 }] });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });
});
