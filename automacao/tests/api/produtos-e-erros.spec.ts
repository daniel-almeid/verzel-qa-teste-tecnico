import { test, expect } from '../../support/fixtures';
import { PRODUTOS, ProdutoId } from '../../support/dados';
import { paraCentavos } from '../../support/calculo';

test.describe('GET /api/produtos', () => {
  test('CT47 lista os 8 produtos com o contrato documentado @smoke', async ({ api }) => {
    const res = await api.produtos();
    expect(res.status()).toBe(200);
    const lista = await res.json();
    expect(lista).toHaveLength(8);
    for (const p of lista) {
      expect(p).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^P\d{3}$/),
          nome: expect.any(String),
          descricao: expect.any(String),
          categoria: expect.any(String),
          preco: expect.any(Number),
        }),
      );
    }
  });

  for (const produto of Object.values(PRODUTOS)) {
    test(`CT48 ${produto.id} consulta por id retorna ${produto.nome}`, async ({ api }) => {
      const res = await api.produto(produto.id);
      expect(res.status()).toBe(200);
      const b = await res.json();
      expect(b.nome).toBe(produto.nome);
      expect(paraCentavos(b.preco)).toBe(PRODUTOS[produto.id as ProdutoId].precoCentavos);
    });
  }

  test('CT49 id inexistente: 404 PRODUTO_NAO_ENCONTRADO', async ({ api }) => {
    const res = await api.produto('P999');
    expect(res.status()).toBe(404);
    expect((await res.json()).erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  });
});

test.describe('Erros genéricos da API', () => {
  test('CT50 JSON malformado: 400 JSON_INVALIDO', async ({ api }) => {
    const res = await api.postBruto('/api/carrinho/calcular', '{ "itens": [ ');
    expect(res.status()).toBe(400);
    expect((await res.json()).erro.codigo).toBe('JSON_INVALIDO');
  });

  test('CT51 rota inexistente: 404 ROTA_NAO_ENCONTRADA', async ({ api }) => {
    const res = await api.get('/api/rota-inexistente');
    expect(res.status()).toBe(404);
    expect((await res.json()).erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });

  test('CT52 método não permitido: 405 METODO_NAO_PERMITIDO', async ({ api }) => {
    const res = await api.get('/api/pedidos');
    expect(res.status()).toBe(405);
    expect((await res.json()).erro.codigo).toBe('METODO_NAO_PERMITIDO');
  });

  test('CT53 todo erro segue o formato { erro: { codigo, mensagem } }', async ({ api }) => {
    const respostas = [await api.produto('P999'), await api.calcular([]), await api.get('/api/nao-existe')];
    for (const res of respostas) {
      const b = await res.json();
      expect(b.erro).toEqual(expect.objectContaining({ codigo: expect.any(String), mensagem: expect.any(String) }));
    }
  });
});
