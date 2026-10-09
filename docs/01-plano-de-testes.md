# Plano de testes — VZS-142 · Cupom de desconto e frete grátis

| | |
|---|---|
| **Card** | VZS-142 |
| **Versão testada** | 2.3.0 (documentação publicada em 30/09/2026) |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev/ |
| **Prazo** | 5 dias corridos |

## 1. Objetivo

Validar se a entrega do cupom de desconto e do frete grátis atende aos critérios de aceite CA01–CA11, tanto pela interface quanto pela API, e se não quebrou as regras que já existiam (dados do cliente no pedido).

## 2. Escopo

**Dentro do escopo**
- Aplicação, troca e remoção de cupom no carrinho.
- Regra de frete grátis e valor faltante.
- Limite de 5 unidades por produto (UI e API).
- Cálculo de subtotal, desconto, frete e total, incluindo arredondamento.
- Endpoints `/api/produtos`, `/api/produtos/{id}`, `/api/carrinho/calcular` e `/api/pedidos`, com os códigos de erro documentados.
- Validações pré-existentes do pedido: nome com sobrenome, e-mail e CEP (na API e na tela de checkout).
- Tela de checkout: resumo do pedido, formulário de entrega e confirmação do pedido.

**Fora do escopo**
- Testes de carga, estresse e segurança (regra do teste, pois o ambiente é compartilhado).
- Login, cadastro, pagamento online e consulta de pedidos (documentação).
- Comportamentos listados em "Sobre este ambiente": carrinho por aba, pedidos não persistidos, ausência de estoque e de e-mail. Não serão reportados como bug.

## 3. Abordagem

Uso uma abordagem baseada em risco: os cenários de maior impacto financeiro (cálculo de frete e desconto) recebem mais cobertura e são os primeiros a executar e automatizar.

| Técnica | Onde foi aplicada |
|---------|-------------------|
| Análise de valor limite | Frete em R$ 199,80 / 200,00; quantidade 0, 1, 5, 6 |
| Partição de equivalência | Cupom (válido, expirado, inexistente, vazio); CEP; e-mail |
| Tabela de decisão | Combinações subtotal × cupom → frete, desconto e total |
| Teste baseado em critérios de aceite | Rastreabilidade CA → CT em [`03-rastreabilidade.md`](03-rastreabilidade.md) |
| Teste exploratório baseado em sessão | Charters EX01–EX07 em [`02-cenarios.md`](02-cenarios.md) |
| Teste de contrato de API | Status, campos e formato do erro |

Divisão por camada: o cálculo é feito pela API, então a maior parte da lógica de negócio é validada na API (rápida e determinística). A UI recebe testes de fluxo e de consistência com a API, sem repetir toda a combinatória.

## 4. Análise de risco

| ID | Risco | Impacto | Prob. | Mitigação (cenários) |
|----|-------|---------|-------|----------------------|
| R1 | Frete errado no limite de R$ 200 | Alto | Média | CT12–CT14, CT16–CT19 |
| R2 | Desconto incidindo sobre o frete, ou regra de frete usando subtotal pós-desconto | Alto | Média | CT10, CT16, CT17 |
| R3 | Normalização do código do cupom (caixa e espaços) | Médio | Alta | CT02–CT04, EX02 |
| R4 | Limite de 5 unidades aplicado só na UI ou só na API | Alto | Média | CT21–CT24 |
| R5 | Divergência entre o que a UI exibe e o que a API calcula | Alto | Baixa | CT33, CT55, EX04 |
| R6 | Erro de arredondamento por ponto flutuante | Médio | Média | CT30–CT32 |
| R7 | Estado incoerente após remover cupom, alterar quantidade ou esvaziar | Médio | Média | CT07, CT08, CT38, EX01 |
| R8 | Regressão nas validações já existentes do pedido | Médio | Baixa | CT40–CT43, CT57–CT60 |
| R9 | Documentação divergente do comportamento (mensagens e erros) | Baixo | Média | CT53, CT54 |

## 5. Severidade e prioridade

**Severidade** (impacto técnico/negócio):
- **Crítica:** impede finalizar a compra ou gera valor financeiro errado no fluxo principal.
- **Alta:** regra de negócio documentada violada, com contorno possível; ou erro de valor em cenário de borda.
- **Média:** comportamento incorreto sem impacto financeiro direto (mensagem errada, estado visual incoerente).
- **Baixa:** cosmético, texto, alinhamento.

**Prioridade** (ordem de correção): Alta, Média ou Baixa, definida pelo impacto no usuário e pela frequência do cenário.

## 6. Ambiente e dados

- Navegador principal: Chrome (versão registrada em `05-execucao.md`); verificação adicional em viewport mobile.
- Dados fixos da documentação: produtos P001–P008, cupons `BEMVINDO10` (válido) e `VERAO2026` (expirado).
- O ambiente é stateless: `POST /api/pedidos` e `POST /api/carrinho/calcular` não gravam nada, então podem ser repetidos sem sujar a massa de outros candidatos.
- Cuidado com o ambiente compartilhado: a automação roda com poucos workers e sem paralelismo agressivo.

## 7. Ferramentas

Playwright + TypeScript (UI e API), Gherkin para a documentação dos cenários, DevTools do navegador para inspeção de requisições, Markdown para os documentos.

## 8. Critérios de entrada e saída

**Entrada:** documentação lida por inteiro e dúvidas registradas em [`04-ambiguidades.md`](04-ambiguidades.md); loja e API acessíveis.

**Saída:**
- Todos os cenários de prioridade Alta executados.
- Bugs reportados com passos, evidência e critério violado.
- Pelo menos 3 cenários automatizados passando de forma estável (há mais do que isso).
- Documentos e README atualizados.

## 9. Cronograma (5 dias)

| Dia | Atividade |
|-----|-----------|
| 1 | Leitura da documentação, ambiguidades, plano e análise de risco |
| 2 | Cenários, Gherkin e rastreabilidade |
| 3 | Execução manual (UI e API) e sessões exploratórias, com evidências |
| 4 | Report de bugs e automação com Playwright |
| 5 | Revisão geral, README e envio |

## 10. Limitações conhecidas

- Sem acesso ao código-fonte: validação por caixa-preta.
- A tela de carrinho com valores abaixo de R$ 200 e as mensagens de cupom foram confirmadas só pela execução manual.
- Navegadores além do Chrome não foram cobertos na automação.
