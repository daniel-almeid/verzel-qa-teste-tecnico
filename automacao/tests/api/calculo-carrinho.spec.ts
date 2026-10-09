import { test, expect } from '../../support/fixtures';
import { CUPONS, PRODUTOS, ProdutoId, REGRAS, TODOS_OS_PRODUTOS } from '../../support/dados';
import { Item, calcularEsperado, paraCentavos } from '../../support/calculo';

const item = (produtoId: ProdutoId, quantidade = 1): Item => ({ produtoId, quantidade });

/** Compara o corpo da API com o resumo esperado, tudo em centavos. */
function esperarResumo(corpo: Record<string, number | boolean>, itens: Item[], comCupom: boolean) {
  const e = calcularEsperado(itens, comCupom);
  expect(paraCentavos(corpo.subtotal as number), 'subtotal').toBe(e.subtotal);
  expect(paraCentavos(corpo.desconto as number), 'desconto').toBe(e.desconto);
  expect(paraCentavos(corpo.frete as number), 'frete').toBe(e.frete);
  expect(corpo.freteGratis, 'freteGratis').toBe(e.freteGratis);
  expect(paraCentavos(corpo.valorFaltanteFreteGratis as number), 'valorFaltanteFreteGratis').toBe(e.faltante);
  expect(paraCentavos(corpo.total as number), 'total').toBe(e.total);
}

test.describe('Cálculo do carrinho — exemplos da própria documentação', () => {
  test('CT01 CT10 BEMVINDO10 em P005 x1: 10% de desconto e frete sem desconto @smoke', async ({ api }) => {
    const res = await api.calcular([item('P005')], CUPONS.valido);
    expect(res.status()).toBe(200);
    const b = await res.json();
    expect(b).toMatchObject({
      subtotal: 100,
      desconto: 10,
      frete: 19.9,
      freteGratis: false,
      valorFaltanteFreteGratis: 100,
      cupom: { codigo: 'BEMVINDO10', aplicado: true },
    });
    expect(paraCentavos(b.total)).toBe(10990);
  });

  test('exemplo da doc: P002 + P004 x2 + BEMVINDO10 → total 215,73 e frete grátis', async ({ api }) => {
    const res = await api.calcular([item('P002'), item('P004', 2)], CUPONS.valido);
    const b = await res.json();
    expect(b).toMatchObject({ subtotal: 239.7, desconto: 23.97, frete: 0, freteGratis: true, total: 215.73 });
    expect(b.itens).toHaveLength(2);
  });
});

test.describe('Cálculo do carrinho — frete, cupom e arredondamento (tabela de decisão)', () => {
  // Cada linha: id do CT, descrição, itens e se o cupom válido é enviado.
  const cenarios: Array<{ id: string; nome: string; itens: Item[]; cupom?: boolean; bug?: string }> = [
    { id: 'CT12', nome: 'subtotal 199,80 (logo abaixo do limite)', itens: [item('P001'), item('P002')] },
    { id: 'CT13', nome: 'subtotal 200,00 (limite, inclusive)', itens: [item('P005', 2)], bug: 'BUG-001' },
    { id: 'CT14', nome: 'subtotal 200,00 com P008 x4', itens: [item('P008', 4)], bug: 'BUG-001' },
    { id: 'CT19', nome: 'subtotal 189,90 (faltam 10,10)', itens: [item('P003')] },
    { id: 'CT16', nome: '200,00 + cupom: frete usa subtotal antes do desconto', itens: [item('P005', 2)], cupom: true, bug: 'BUG-001' },
    { id: 'CT17', nome: '199,80 + cupom: continua pagando frete', itens: [item('P001'), item('P002')], cupom: true },
    { id: 'CT18', nome: 'P007 (229,90) + cupom', itens: [item('P007')], cupom: true },
    { id: 'CT30', nome: 'P001 x3 + cupom (float: 59.9*3 = 179.70000000000002)', itens: [item('P001', 3)], cupom: true },
    { id: 'CT31', nome: 'P001 x5 + cupom', itens: [item('P001', 5)], cupom: true },
    { id: 'CT32', nome: 'todos os produtos x5 + cupom', itens: TODOS_OS_PRODUTOS.map((p) => item(p, 5)), cupom: true },
  ];

  for (const c of cenarios) {
    test(`${c.id}${c.bug ? ` [${c.bug}]` : ''} ${c.nome}`, async ({ api }) => {
      const res = await api.calcular(c.itens, c.cupom ? CUPONS.valido : undefined);
      expect(res.status()).toBe(200);
      esperarResumo(await res.json(), c.itens, Boolean(c.cupom));
    });
  }

  test('CT30 CA11 nenhum valor monetário passa de 2 casas decimais', async ({ api }) => {
    const b = await (await api.calcular([item('P001', 3)], CUPONS.valido)).json();
    for (const campo of ['subtotal', 'desconto', 'frete', 'total', 'valorFaltanteFreteGratis']) {
      expect(b[campo], campo).toBe(paraCentavos(b[campo]) / 100);
    }
  });
});

test.describe('Cálculo do carrinho — normalização e validade do cupom (CA02–CA04)', () => {
  const variacoes = [
    ['CT02', 'bemvindo10'],
    ['CT03', '  BEMVINDO10  '],
    ['CT04', 'BemVindo10'],
  ];
  for (const [id, codigo] of variacoes) {
    test(`${id} CA02 código ${JSON.stringify(codigo)} é aceito`, async ({ api }) => {
      const b = await (await api.calcular([item('P005')], codigo)).json();
      expect(b.cupom.aplicado).toBe(true);
      expect(b.desconto).toBe(10);
    });
  }

  test('CT05 CA03 cupom inexistente: 200, sem desconto e mensagem de inválido', async ({ api }) => {
    const res = await api.calcular([item('P005')], CUPONS.inexistente);
    expect(res.status()).toBe(200);
    const b = await res.json();
    expect(b.desconto).toBe(0);
    expect(b.cupom.aplicado).toBe(false);
    expect(b.cupom.mensagem).toMatch(/cupom inv[aá]lido/i);
  });

  test('CT06 CA04 cupom expirado: 200, sem desconto e mensagem de expirado', async ({ api }) => {
    const res = await api.calcular([item('P005')], CUPONS.expirado);
    expect(res.status()).toBe(200);
    const b = await res.json();
    expect(b.desconto).toBe(0);
    expect(b.cupom.aplicado).toBe(false);
    expect(b.cupom.mensagem).toMatch(/cupom expirado/i);
  });

  // A03: a doc só diz que o campo é opcional. Assumo "sem cupom" para null e string vazia.
  for (const vazio of [null, '']) {
    test(`CT11 cupom ${JSON.stringify(vazio)} é tratado como sem cupom (A03)`, async ({ api }) => {
      const res = await api.calcular([item('P005')], vazio);
      expect(res.status()).toBe(200);
      expect((await res.json()).desconto).toBe(0);
    });
  }
});

test.describe('Cálculo do carrinho — itens e quantidades (CA10)', () => {
  test('CT22 quantidade 5 (limite) é aceita', async ({ api }) => {
    const res = await api.calcular([item('P001', REGRAS.maxUnidadesPorProduto)]);
    expect(res.status()).toBe(200);
    expect((await res.json()).subtotal).toBe(299.5);
  });

  test('CT23 [BUG-002] quantidade 6 é rejeitada com QUANTIDADE_MAXIMA_EXCEDIDA @smoke', async ({ api }) => {
    const res = await api.calcular([item('P001', 6)]);
    expect(res.status()).toBe(422);
    const b = await res.json();
    expect(b.erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
    expect(b.erro.campo).toBe('itens[0].quantidade');
  });

  for (const q of [0, -1, 2.5, '2', null]) {
    test(`CT24 quantidade ${JSON.stringify(q)} é rejeitada com QUANTIDADE_INVALIDA`, async ({ api }) => {
      const res = await api.calcular([{ produtoId: 'P001', quantidade: q }]);
      expect(res.status()).toBe(422);
      expect((await res.json()).erro.codigo).toBe('QUANTIDADE_INVALIDA');
    });
  }

  test('CT25 mesmo produto repetido: ITEM_DUPLICADO', async ({ api }) => {
    const res = await api.calcular([item('P001'), item('P001')]);
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('ITEM_DUPLICADO');
  });

  test('CT27 produto inexistente: PRODUTO_NAO_ENCONTRADO', async ({ api }) => {
    const res = await api.calcular([{ produtoId: 'P999', quantidade: 1 }]);
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  });

  for (const invalido of ['P001', 123, null]) {
    test(`CT28 item ${JSON.stringify(invalido)} que não é objeto: ITEM_INVALIDO`, async ({ api }) => {
      const res = await api.calcular([invalido]);
      expect(res.status()).toBe(422);
      expect((await res.json()).erro.codigo).toBe('ITEM_INVALIDO');
    });
  }

  for (const [nome, itens] of [['lista vazia', []], ['ausente', undefined]] as const) {
    test(`CT29 itens ${nome}: ITENS_OBRIGATORIOS`, async ({ api }) => {
      const res = await api.calcular(itens);
      expect(res.status()).toBe(422);
      expect((await res.json()).erro.codigo).toBe('ITENS_OBRIGATORIOS');
    });
  }
});

// Garante que a massa de dados do código ainda bate com a API (se o preço mudar, o resto dos testes perde sentido).
test('pré-condição: preços da API iguais à massa de dados da documentação', async ({ api }) => {
  const lista = await (await api.produtos()).json();
  for (const p of lista) {
    expect(paraCentavos(p.preco), p.id).toBe(PRODUTOS[p.id as ProdutoId].precoCentavos);
  }
});
