# Cenários de teste — VZS-142

Convenções: **CT** = caso de teste · **CA** = critério de aceite · **Prior.**: A/M/B · **Auto**: onde está automatizado (`—` = só manual).
Valores em reais. Dados de teste: produtos P001–P008, cupons `BEMVINDO10` e `VERAO2026`.
Cálculos esperados foram feitos à mão a partir das regras da documentação e conferidos em centavos, para evitar erro de ponto flutuante.

## 1. Cupom — partição de equivalência

Classes: válido, válido com variação de formato, expirado, inexistente, vazio.

| ID | CA | Cenário | Esperado | Prior. | Auto |
|----|----|---------|----------|--------|------|
| CT01 | CA01 | P005 x1 + `BEMVINDO10` | subtotal 100,00 · desconto 10,00 · frete 19,90 · total 109,90 | A | API, UI |
| CT02 | CA02 | Cupom `bemvindo10` | Aplicado, desconto de 10% | A | API, UI |
| CT03 | CA02 | Cupom `  BEMVINDO10  ` | Aplicado (espaços ignorados) | A | API, UI |
| CT04 | CA02 | Cupom `BemVindo10` | Aplicado | M | API |
| CT05 | CA03 | Cupom inexistente `XPTO` | "Cupom inválido.", sem desconto | A | API, UI |
| CT06 | CA04 | Cupom `VERAO2026` | "Cupom expirado.", sem desconto | A | API, UI |
| CT07 | CA05 | Com cupom aplicado, tentar aplicar outro | Não permite dois cupons; é preciso remover o atual | A | — |
| CT08 | CA05 | Remover o cupom e aplicar outro | Valores recalculados com o novo cupom | M | — |
| CT09 | CA03 | Aplicar com campo vazio ou só espaços | Sem desconto e sem quebra de tela | M | — |
| CT10 | CA09 | Desconto sobre o frete (P005 x1 + cupom) | Frete segue 19,90; total = 100 − 10 + 19,90 | A | API, UI |
| CT11 | CA03 | `cupom: null` e `""` no `calcular` | Tratado como "sem cupom" (ver A03) | M | API |

## 2. Frete — valor limite

Limite em R$ 200,00 (inclusive). Pontos testados: abaixo (199,80), no limite (200,00) e acima (229,90).

| ID | CA | Cenário | Esperado | Prior. | Auto |
|----|----|---------|----------|--------|------|
| CT12 | CA07 | P001 + P002 (subtotal 199,80) | frete 19,90 · faltante 0,20 · total 219,70 | A | API |
| CT13 | CA06 | P005 x2 (subtotal 200,00) | frete 0,00 · faltante 0 · total 200,00 | A | API, UI |
| CT14 | CA06 | P008 x4 (subtotal 200,00) | frete 0,00 | M | API |
| CT15 | CA07 | P005 x1: a tela informa quanto falta | Exibe faltante de R$ 100,00 | A | UI |
| CT16 | CA08 | P005 x2 + cupom (200 → 180 líquido) | desconto 20,00 · frete 0,00 · total 180,00 | A | API, UI |
| CT17 | CA08 | P001 + P002 + cupom (199,80) | desconto 19,98 · frete 19,90 · total 199,72 | A | API, UI |
| CT18 | CA06 | P007 x1 (229,90) + cupom | desconto 22,99 · frete 0 · total 206,91 | M | API |
| CT19 | CA06/07 | P003 x1 (189,90) | frete 19,90 · faltante 10,10 · total 209,80 | M | API |
| CT20 | — | Carrinho vazio | "Seu carrinho está vazio" | M | UI |

## 3. Quantidade e itens — valor limite

| ID | CA | Cenário | Esperado | Prior. | Auto |
|----|----|---------|----------|--------|------|
| CT21 | CA10 | UI: tentar chegar a 6 unidades do mesmo produto | Quantidade permanece 5 | A | UI |
| CT22 | CA10 | API: quantidade 5 | 200 | A | API |
| CT23 | CA10 | API: quantidade 6 em `calcular` e em `pedidos` | 422 `QUANTIDADE_MAXIMA_EXCEDIDA` | A | API |
| CT24 | CA10 | API: quantidade 0, -1, 2.5, `"2"`, `null` | 422 `QUANTIDADE_INVALIDA` | A | API |
| CT25 | — | API: mesmo produto duas vezes | 422 `ITEM_DUPLICADO` | M | API |
| CT26 | — | UI: adicionar o mesmo produto duas vezes | Uma linha com quantidade 2 | M | UI |
| CT27 | — | API: `produtoId` inexistente | 422 `PRODUTO_NAO_ENCONTRADO` | M | API |
| CT28 | — | API: item que não é objeto | 422 `ITEM_INVALIDO` | M | API |
| CT29 | — | API: `itens` ausente ou vazio | 422 `ITENS_OBRIGATORIOS` | A | API |

## 4. Cálculo e arredondamento

| ID | CA | Cenário | Esperado | Prior. | Auto |
|----|----|---------|----------|--------|------|
| CT30 | CA11 | P001 x3 + cupom (em float, 59.9 × 3 = 179.70000000000002) | subtotal 179,70 · desconto 17,97; no máximo 2 casas | A | API |
| CT31 | CA11 | P001 x5 + cupom | subtotal 299,50 · desconto 29,95 · total 269,55 | M | API |
| CT32 | — | Todos os produtos x5 + cupom | total = subtotal − desconto + frete | M | API |
| CT33 | CA01–CA09 | Valores da UI iguais aos da API | A UI só exibe o que a API calcula | A | UI |

## 5. Carrinho (UI)

| ID | Cenário | Esperado | Prior. | Auto |
|----|---------|----------|--------|------|
| CT34 | Adicionar produto pela vitrine | Contador sobe | A | UI |
| CT35 | Contador com vários produtos | Contador = soma das unidades | M | UI |
| CT36 | Navegar Produtos → Documentação → Carrinho | Carrinho mantido na aba | M | — |
| CT37 | Abrir carrinho em outra aba | Vazio (esperado pelo ambiente, **não é bug**) | B | — |
| CT38 | Alterar quantidade, remover item, esvaziar | Resumo recalculado | A | UI |
| CT39 | F5 no carrinho | Comportamento coerente com o ambiente | M | — |

## 6. Pedido e dados do cliente

| ID | Cenário | Esperado | Prior. | Auto |
|----|---------|----------|--------|------|
| CT40 | Pedido válido com cupom | 201 · `VZ-######` · CEP `01310100` | A | API |
| CT41 | Nome sem sobrenome | 422 `DADOS_INVALIDOS` | A | API |
| CT42 | E-mail inválido (`maria@`, `maria.com`) | 422 `DADOS_INVALIDOS` | A | API |
| CT43 | CEP com 7, 8 e 9 dígitos; com e sem hífen; com letra | 8 dígitos aceito; demais rejeitados | A | API |
| CT44 | Pedido com cupom inexistente | 422 `CUPOM_INVALIDO` | A | API |
| CT45 | Pedido com `VERAO2026` | 422 `CUPOM_EXPIRADO` | A | API |
| CT46 | Pedido sem itens | 422 `ITENS_OBRIGATORIOS` | M | API |

## 6.1 Checkout pela interface

Cobre na tela os mesmos dados que o CT40 a CT46 validam na API. O CEP e o e-mail seguem as partições do item 6.

| ID | Cenário | Esperado | Prior. | Auto |
|----|---------|----------|--------|------|
| CT55 | Resumo do checkout (sem cupom e com `BEMVINDO10`) | Subtotal, desconto, frete e total iguais aos do carrinho; item "1x Mochila Urbana 20L" | A | UI |
| CT56 | Pedido válido pela tela (Maria Silva, maria@exemplo.com, 01310-100) | Tela "Pedido confirmado" com número `VZ-000000`, saudação com o nome e resumo (subtotal, desconto, frete, total e itens) igual ao do checkout | A | UI |
| CT57 | Nome sem sobrenome ("Maria") | Mensagem de nome e sobrenome; pedido não confirmado | A | UI |
| CT58 | E-mail inválido (`maria@`, `maria.com`) | Mensagem no campo; pedido não confirmado | A | UI |
| CT59 | CEP inválido (7 dígitos, 9 dígitos, com letra, vazio) | Mensagem no campo; pedido não confirmado | A | UI |
| CT60 | CEP válido com e sem hífen (`01310100`, `01310-100`) | Pedido confirmado nos dois formatos | M | UI |
| CT61 | "Voltar ao carrinho" a partir do checkout (com cupom) | Item e cupom mantidos | M | UI |
| CT62 | Carrinho após confirmar o pedido | Contador em 0 e carrinho vazio | M | UI |
| CT63 | "Continuar comprando" na tela de confirmação | Volta para a vitrine com os 8 produtos | B | UI |

## 7. API — contrato e erros

| ID | Cenário | Esperado | Prior. | Auto |
|----|---------|----------|--------|------|
| CT47 | `GET /api/produtos` | 200 · 8 produtos com id, nome, descricao, categoria e preco | A | API |
| CT48 | `GET /api/produtos/P001` | 200 com o produto | M | API |
| CT49 | `GET /api/produtos/P999` | 404 `PRODUTO_NAO_ENCONTRADO` | M | API |
| CT50 | JSON malformado | 400 `JSON_INVALIDO` | M | API |
| CT51 | Rota inexistente | 404 `ROTA_NAO_ENCONTRADA` | M | API |
| CT52 | `GET /api/pedidos` | 405 `METODO_NAO_PERMITIDO` | M | API |
| CT53 | Formato do erro (`erro.codigo`, `erro.mensagem`) | Padrão respeitado | M | API |
| CT54 | `DADOS_INVALIDOS` com detalhes em `campos` (doc) | Conferir o formato real (ver A05) | M | — |

## 8. Charters exploratórios

Sessões de 20–30 minutos. Cada uma registra o que foi explorado, o que foi encontrado e dúvidas em [`05-execucao.md`](05-execucao.md).

| ID | Charter |
|----|---------|
| EX01 | Explorar o fluxo vitrine → carrinho → cupom → pedido variando a ordem das ações (remover e reaplicar cupom, mudar quantidade com cupom ativo) para achar valores incoerentes. |
| EX02 | Explorar o campo de cupom com entradas incomuns (caracteres especiais, emoji, texto longo, espaços no meio, tab). |
| EX03 | Explorar o limite de quantidade pela UI (cliques rápidos, teclado, navegação e volta). |
| EX04 | Comparar cada tela do carrinho com a resposta de `/api/carrinho/calcular`. |
| EX05 | Explorar usabilidade e acessibilidade básica (teclado, foco, mensagens, mobile). |
| EX06 | Conferir o texto promocional da home ("na primeira compra") contra a regra documentada. |
| EX07 | Explorar a navegação do browser (voltar, avançar, F5) com o carrinho preenchido. |
