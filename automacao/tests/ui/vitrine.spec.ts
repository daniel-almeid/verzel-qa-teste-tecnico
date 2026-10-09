import { test, expect } from '../../support/fixtures';
import { PRODUTOS } from '../../support/dados';
import { REGRAS } from '../../support/dados';

test.describe('Vitrine', () => {
  test('CT47 mostra os 8 produtos com nome e preço', async ({ vitrine }) => {
    await vitrine.abrir();
    await expect(vitrine.produtos).toHaveCount(8);
    await expect(vitrine.card(PRODUTOS.P001.nome)).toContainText(/R\$\s*59,90/);
  });

  test('CT34 CT35 adicionar produtos atualiza o contador do carrinho @smoke', async ({ vitrine }) => {
    await vitrine.abrir();
    await expect(vitrine.contadorCarrinho).toHaveText('0');
    await vitrine.adicionar(PRODUTOS.P001.nome);
    await expect(vitrine.contadorCarrinho).toHaveText('1');
    await vitrine.adicionar(PRODUTOS.P001.nome);
    await vitrine.adicionar(PRODUTOS.P004.nome);
    await expect(vitrine.contadorCarrinho).toHaveText('3');
  });

  test('CT21 CA10 a vitrine bloqueia a 6ª unidade do mesmo produto', async ({ vitrine }) => {
    const nome = PRODUTOS.P001.nome;
    await vitrine.abrir();
    await vitrine.adicionar(nome, REGRAS.maxUnidadesPorProduto);
    await expect(vitrine.contadorCarrinho).toHaveText(String(REGRAS.maxUnidadesPorProduto));

    await expect(vitrine.botaoAdicionar(nome)).toBeDisabled();

    await vitrine.botaoAdicionar(nome).click({ force: true });
    await expect(vitrine.contadorCarrinho).toHaveText(String(REGRAS.maxUnidadesPorProduto));
  });

  test('CT26 o mesmo produto adicionado duas vezes vira uma linha com quantidade 2', async ({ vitrine, carrinho }) => {
    await vitrine.abrir();
    await vitrine.adicionar(PRODUTOS.P001.nome, 2);
    await vitrine.irParaCarrinho();
    await carrinho.aguardarCarregado();
    await expect(carrinho.quantidade(PRODUTOS.P001.nome)).toHaveText('2');
    await expect(carrinho.remover(PRODUTOS.P001.nome)).toHaveCount(1);
  });
});
