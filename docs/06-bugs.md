# Registro de bugs

Antes de reportar cada bug, eu:
1. Reproduzi o problema mais de uma vez (nas duas rodadas da automação e, quando possível, manualmente no Postman).
2. Conferi que não é um comportamento descrito em "Sobre este ambiente" da documentação.
3. Identifiquei o critério de aceite ou a regra violada e citei a documentação.
4. Anexei a evidência (print, vídeo ou requisição e resposta).

Severidade e prioridade seguem as definições do [plano de testes](01-plano-de-testes.md#5-severidade-e-prioridade).

## Resumo

| ID | Título | Severidade | Prioridade | CA / CT | Status |
|----|--------|------------|------------|---------|--------|
| BUG-001 | [Frete] Subtotal de exatamente R$ 200,00 é cobrado com frete de R$ 19,90 | Alta | Alta | CA06 · CT13, CT14, CT16 | Aberto |
| BUG-002 | [API] Quantidade acima de 5 unidades por produto é aceita em `calcular` e em `pedidos` | Alta | Média | CA10 · CT23 | Aberto |

## Modelo

### BUG-000 — [Módulo] O que acontece, em uma linha

| Campo | Valor |
|-------|-------|
| Severidade / Prioridade | |
| Critério violado / Cenário | CAxx · CTxx |
| Ambiente | URL · navegador e versão · SO · data e hora |
| Frequência | Sempre / Intermitente |
| Camada | UI / API |

**Pré-condições:**

**Passos para reproduzir:**
1.
2.
3.

**Resultado esperado** (citar a documentação):

**Resultado obtido:**

**Evidência:** `evidencias/BUG-000-descricao.png`

**Requisição e resposta** (se for API):
```http
POST /api/carrinho/calcular
{ ... }

200 OK
{ ... }
```

**Observações / hipótese:** (o que já descartei, impacto no usuário)

---

# Bugs reportados

### BUG-001 — [Frete] Subtotal de exatamente R$ 200,00 é cobrado com frete de R$ 19,90

| Campo | Valor |
|-------|-------|
| Severidade / Prioridade | Alta / Alta (cobrança indevida de R$ 19,90 no valor de borda da promoção) |
| Critério violado / Cenário | CA06 · CT13, CT14, CT16 |
| Ambiente | https://verzel-store.qa-test-verzel-store.workers.dev/ · v2.3.0 · Postman (API) e Chromium 139 via Playwright (UI) · 07/10/2026 |
| Frequência | Sempre (3 composições de carrinho, na API e na UI) |
| Camada | API (causa) e UI (exibe o valor retornado) |

**Como encontrei:** na automação, ao validar o valor limite do frete (CT13, CT14 e CT16). Depois reproduzi manualmente no Postman e vi o mesmo na UI durante a sessão exploratória EX01.

**Pré-condições:** carrinho com subtotal exatamente R$ 200,00.

**Passos para reproduzir (UI):**
1. Na vitrine, adicionar 2 unidades de "Mochila Urbana 20L" (R$ 100,00 cada).
2. Abrir o carrinho.
3. Conferir a linha "Frete" do resumo do pedido.

**Passos para reproduzir (API):**
1. `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P005","quantidade":2}]}`.
2. Repetir com `{"itens":[{"produtoId":"P008","quantidade":4}]}`.

**Resultado esperado:** frete R$ 0,00, `freteGratis: true` e total R$ 200,00. O CA06 diz que o frete é grátis para subtotal "a partir de R$ 200,00, inclusive".

**Resultado obtido (API, status 200):**
```json
{
  "subtotal": 200,
  "desconto": 0,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 0,
  "total": 219.9,
  "cupom": null
}
```
A mesma resposta veio nos dois carrinhos (2 x P005 e 4 x P008). Na UI, o resumo mostra "R$ 19,90" no lugar de "Grátis". Com `BEMVINDO10` (2 x P005), o desconto de R$ 20,00 é calculado corretamente, mas o frete segue em R$ 19,90.

**Inconsistência na própria resposta:** `valorFaltanteFreteGratis` vem `0` (a API entende que o mínimo foi atingido), mas `freteGratis` vem `false` e o frete é cobrado.

**Reflexo na UI (EX01):** com 2 x Mochila e `BEMVINDO10`, o carrinho mostra subtotal R$ 200,00, desconto R$ 20,00, frete R$ 19,90 e total R$ 199,90, junto com o aviso "Faltam R$ 0,00 para o frete grátis.". O aviso contradiz a cobrança do frete. A conta (200 − 20 + 19,90) fecha, o erro está só na decisão do frete.

**Evidência:**
- `evidencias/BUG-001-api-subtotal-200.png` (2 x P005, Postman)
- `evidencias/BUG-001-api-subtotal-200-p008.png` (4 x P008, Postman)
- `evidencias/BUG-001-ui-frete-200.png` (UI, sem cupom)
- `evidencias/BUG-001-ui-frete-200-com-cupom.png` (UI, com `BEMVINDO10`)
- `evidencias/BUG-001-ui-aviso-faltam-zero.png` (UI, aviso "Faltam R$ 0,00 para o frete grátis." com frete cobrado)
- `evidencias/automacao-execucao-2.txt` (CT13, CT14 e CT16 falhando)

**Observações / hipótese:** os testes com subtotal de 199,80 (CT12), 189,90 (CT19) e 229,90 (CT18) passaram, ou seja, abaixo e acima do limite o frete está correto. O defeito só aparece na igualdade. Isso me leva a suspeitar que a regra do frete grátis usa "maior que" em vez de "maior ou igual", enquanto o cálculo do valor faltante já usa a regra correta. É uma hipótese, porque não tenho acesso ao código.

**Contexto:** a própria home promete "Frete grátis a partir de R$ 200,00" (EX06), e o carrinho não cumpre isso no valor exato.

---

### BUG-002 — [API] Quantidade acima de 5 unidades por produto é aceita em `calcular` e em `pedidos`

| Campo | Valor |
|-------|-------|
| Severidade / Prioridade | Alta / Média (a UI bloqueia, mas a regra não é imposta na API e o pedido é confirmado) |
| Critério violado / Cenário | CA10 e código de erro `QUANTIDADE_MAXIMA_EXCEDIDA` · CT23 |
| Ambiente | https://verzel-store.qa-test-verzel-store.workers.dev/ · v2.3.0 · Postman · 07/10/2026 |
| Frequência | Sempre |
| Camada | API |

**Como encontrei:** ao testar o valor limite da quantidade pela API (CT23). Depois reproduzi manualmente no Postman, nos dois endpoints.

**Passos para reproduzir:**
1. `POST /api/carrinho/calcular` com `{"itens":[{"produtoId":"P001","quantidade":6}]}`.
2. `POST /api/pedidos` com `{"cliente":{"nome":"Maria Silva","email":"maria@exemplo.com","cep":"01310-100"},"itens":[{"produtoId":"P001","quantidade":6}]}`.

**Resultado esperado:** status `422` com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"`. O CA10 diz que o limite de 5 unidades por produto vale para a interface e para a API, e a tabela de erros prevê esse código quando a quantidade é maior que 5.

**Resultado obtido:**
- `calcular`: `200 OK`, com `subtotal` 359,4, `frete` 0 e `total` 359,4.
- `pedidos`: `201 Created`, com `numero` `VZ-236750`, `quantidade` 6 e `total` 359,4. O pedido foi confirmado.

**Contraste:** a UI não deixa passar de 5 unidades. Na sessão exploratória EX03, mesmo com cliques rápidos, o botão "Adicionar ao carrinho" (vitrine) e o "+" (carrinho) foram bloqueados na quinta unidade, com aviso de limite por produto no carrinho. Não encontrei caminho pela interface que ultrapasse 5, então a regra só existe no front-end. A quantidade 5 é aceita corretamente pela API (CT22 passou).

**Evidência:**
- `evidencias/BUG-002-api-qtd6.png` (`calcular`, Postman)
- `evidencias/BUG-002-api-pedido-qtd6.png` (`pedidos`, Postman)
- `evidencias/automacao-execucao-2.txt` (CT23 falhando nos dois endpoints)

**Observações:** não testei quantidades acima de 6 (7, 10 e 100), então não sei se a API tem algum limite maior ou se não valida nada.

---