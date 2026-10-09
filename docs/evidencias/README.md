# Evidências

Convenção de nomes: `CTxx-descricao-curta.png` para execução e `BUG-xxx-descricao-curta.png` para bugs. Vídeos em `.mp4` ou `.webm`.
Cada arquivo é referenciado na coluna "Evidência" de [`../05-execucao.md`](../05-execucao.md) ou no bug correspondente de [`../06-bugs.md`](../06-bugs.md).

O relatório HTML do Playwright (`automacao/playwright-report`, gerado por `npm run report`) complementa as evidências da automação.

| Arquivo | Cenário / Bug | O que mostra | Status |
|---------|---------------|--------------|--------|
| `automacao-execucao-2.txt` | CT13, CT14, CT16, CT23 e resumo da suíte | Saída do terminal da rodada 2: detalhe das 7 falhas e resumo (77 passaram, 7 falharam) | ✅ |
| `BUG-001-api-subtotal-200.png` | BUG-001 · CT13 | Postman: `calcular` com P005 x2: frete de R$ 19,90 e `freteGratis` false com subtotal de R$ 200,00 | ✅ |
| `BUG-001-api-subtotal-200-p008.png` | BUG-001 · CT14 | Postman: `calcular` com P008 x4 (subtotal R$ 200,00) com o mesmo frete de R$ 19,90 | ✅ |
| `BUG-001-ui-frete-200.png` | BUG-001 · CT13 (UI) | Carrinho com 2 mochilas mostrando frete R$ 19,90 em vez de "Grátis" | ✅ |
| `BUG-001-ui-frete-200-com-cupom.png` | BUG-001 · CT16 (UI) | Carrinho com 2 mochilas + `BEMVINDO10`: desconto 20,00 e frete 19,90 | ✅ |
| `BUG-002-api-qtd6.png` | BUG-002 · CT23 | Postman: `calcular` com quantidade 6 retorna 200 em vez de 422 | ✅ |
| `BUG-002-api-pedido-qtd6.png` | BUG-002 · CT23 | `pedidos` com quantidade 6: 201 Created e número `VZ-236750` | ✅ |
| `CT07-cupom-aplicado.png` | CT07 · CT01 · CT10 | Carrinho com `BEMVINDO10` aplicado: o campo de cupom dá lugar a "Remover cupom"; desconto de R$ 10,00, frete de R$ 19,90 e total de R$ 109,90 | ✅ |
| `CT08-1-cupom-removido.png` | CT08 · CT15 | Cupom removido: desconto de R$ 0,00, total de R$ 119,90 e aviso "Faltam R$ 100,00 para o frete grátis." | ✅ |
| `CT08-2-cupom-expirado.png` | CT08 · CT06 | `VERAO2026`: mensagem "Cupom expirado." e nenhum desconto | ✅ |
| `CT08-3-cupom-reaplicado.png` | CT08 | `BEMVINDO10` reaplicado: desconto de R$ 10,00 e total de R$ 109,90 | ✅ |
| `CT09-campo-vazio.png` | CT09 | Campo vazio: mensagem "Informe um cupom." e valores inalterados | ✅ |
| `CT54-campos-dados-invalidos.png` | CT54 · CT41 | Postman: `POST /api/pedidos` com nome "Maria" retorna 422 `DADOS_INVALIDOS` com `erro.campos` (`cliente.nome`: "Informe nome e sobrenome.") | ✅ |
| `automacao-execucao-3.txt` | CT55 a CT63 e resumo da suíte | Saída do terminal da rodada 3, com o checkout: 99 testes, 92 passaram e 7 falharam (as mesmas dos bugs) | ✅ |
| `BUG-001-ui-aviso-faltam-zero.png` | BUG-001 · EX01 | Carrinho com 2 mochilas e `BEMVINDO10`: subtotal R$ 200,00, frete R$ 19,90, total R$ 199,90 e aviso "Faltam R$ 0,00 para o frete grátis." | ✅ |
| `EX01-recalculo-1-mochila.png` | EX01 | Carrinho depois de reduzir de 2 para 1 mochila com cupom: desconto R$ 10,00, frete R$ 19,90, total R$ 109,90 e "Faltam R$ 100,00" | ✅ |