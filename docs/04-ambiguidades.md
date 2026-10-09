# Ambiguidades e interpretações adotadas

Pontos em que a documentação não é conclusiva. Para cada um, registrei a interpretação usada nos testes, para que um resultado divergente seja tratado como dúvida a confirmar com o time, e não como defeito certo.

| ID | Ponto | Interpretação adotada | Impacto nos testes |
|----|-------|-----------------------|--------------------|
| A01 | A home diz que o cupom vale "na primeira compra", mas a doc não define isso e não há login nem histórico de pedidos. | O cupom vale para qualquer carrinho. Confirmado na EX06: a documentação não define "primeira compra" (nenhuma menção nos CA01 a CA09), e o sistema aceitou o mesmo cupom em um segundo carrinho, tanto na minha execução manual quanto nos pedidos da automação (CT40 e CT56). Como o ambiente não guarda histórico de pedidos, não considerei bug. Fica como dúvida de conteúdo do texto da home, a confirmar com o time. | EX06 |
| A02 | CA08: o frete usa o subtotal antes do desconto. Com subtotal 200,00 e cupom, o líquido é 180,00. | Frete continua R$ 0,00. | CT16 |
| A03 | `cupom: null` ou `""` na API: a doc só diz que o campo é opcional. | Tratado como "sem cupom", sem desconto e sem erro. | CT11 |
| A04 | CA10 vale "para UI e API", mas não diz se `/api/carrinho/calcular` também valida a quantidade. | Valida, pois os códigos 422 de quantidade valem para a API toda. | CT23 |
| A05 | A tabela de erros cita `campos` (plural) para `DADOS_INVALIDOS`, mas o formato padrão traz `campo` (singular). | Resolvida na execução (CT54): `DADOS_INVALIDOS` devolve `erro.campos`, uma lista com `campo` e `mensagem`, como diz a tabela de erros. O formato padrão com `campo` (singular) vale para os demais erros. Não é bug, só uma imprecisão do texto "todo erro segue o mesmo formato". | CT54 |
| A06 | Cupom inválido ou expirado retorna 200 em `calcular` e 422 em `pedidos`. | Intencional, pois está documentado. | CT05, CT06, CT44, CT45 |
| A07 | CA11 não diz o método de arredondamento. | Todos os preços são múltiplos de R$ 0,10, então 10% fecha em 2 casas. O arredondamento só aparece por ponto flutuante (ex.: 59,9 × 3). | CT30 |
| A08 | CA10: "5 unidades por pedido". Por produto ou no pedido inteiro? A frase anterior diz "cada produto". | Por produto. | CT21–CT23 |
| A09 | O CEP é aceito com ou sem hífen, e o exemplo de resposta devolve `01310100`. | Entendi que a API normaliza o CEP removendo o hífen. | CT40, CT43 |
| A10 | A documentação não diz o que deve acontecer ao aplicar um cupom vazio pela interface. | Considerei esperado que a tela avise e não altere os valores. Observei a mensagem "Informe um cupom.". | CT09 |
| A11 | A documentação não diz o que acontece com o cupom aplicado quando o carrinho muda (remover item, adicionar outro produto, esvaziar). | Observei que o cupom permanece ao remover um item e adicionar outro produto, e é limpo em "Esvaziar carrinho". Considerei o comportamento aceitável, já que a regra não define o contrário. | EX01 |