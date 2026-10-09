# Verzel Store: validação da entrega VZS-142 (cupom de desconto e frete grátis)

Teste técnico para QA Júnior na Verzel. Valida a entrega **VZS-142 v2.3.0**, que traz o cupom `BEMVINDO10` e o frete grátis a partir de R$ 200,00, pela interface e pela API.

- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Documentação da entrega: https://verzel-store.qa-test-verzel-store.workers.dev/documentacao
- API: https://verzel-store.qa-test-verzel-store.workers.dev/api

## Resultado em resumo

Executei 63 casos de teste: 59 passaram e 4 falharam, e essas 4 falhas vêm de 2 bugs. Fiz também 7 sessões exploratórias, que não encontraram bugs novos (as observações ficaram registradas como ambiguidades).

| Bug | O que acontece | Severidade |
|-----|----------------|------------|
| BUG-001 | Com subtotal de exatamente R$ 200,00 o frete de R$ 19,90 é cobrado, mesmo com a regra dizendo "a partir de R$ 200,00, inclusive". O aviso do carrinho ainda mostra "Faltam R$ 0,00 para o frete grátis". | Alta |
| BUG-002 | A API aceita mais de 5 unidades do mesmo produto (`calcular` responde 200 e `pedidos` responde 201), embora a regra valha para a interface e para a API. A tela bloqueia, mas a API não. | Alta |

Os detalhes, com passos, resposta obtida e evidências, estão em [`docs/06-bugs.md`](docs/06-bugs.md).

## Onde está cada entrega

| Entrega | Onde |
|---------|------|
| Plano de testes (escopo, riscos, técnicas, critérios) | [`docs/01-plano-de-testes.md`](docs/01-plano-de-testes.md) |
| Cenários de teste (63 casos e 7 charters exploratórios) | [`docs/02-cenarios.md`](docs/02-cenarios.md) |
| Cenários em Gherkin | [`features/`](features) |
| Rastreabilidade (critérios de aceite, cenários e automação) | [`docs/03-rastreabilidade.md`](docs/03-rastreabilidade.md) |
| Ambiguidades e interpretações | [`docs/04-ambiguidades.md`](docs/04-ambiguidades.md) |
| Execução e resultado de cada cenário | [`docs/05-execucao.md`](docs/05-execucao.md) |
| Bugs encontrados | [`docs/06-bugs.md`](docs/06-bugs.md) |
| Evidências | [`docs/evidencias/`](docs/evidencias) |
| Automação com Playwright | [`automacao/`](automacao) |

## Como rodar a automação

Requisito: Node.js 18 ou superior.

```bash
cd automacao
npm install
npx playwright install chromium

npm test              # tudo (API e UI)
npm run test:api      # só API
npm run test:ui       # só UI
npm run test:smoke    # subconjunto crítico (@smoke)
npm run typecheck     # checagem de tipos
npm run report        # abre o relatório HTML
```

Para apontar para outro ambiente: `BASE_URL=https://outro-host npm test`.
Também há um workflow manual no GitHub Actions ([`.github/workflows/qa.yml`](.github/workflows/qa.yml)).

## Resultado esperado da suíte

A suíte tem 99 testes. Na versão 2.3.0 da loja, **92 passam e 7 falham de propósito**.
As falhas são os bugs reportados em [`docs/06-bugs.md`](docs/06-bugs.md) e estão
identificadas no título do teste (`[BUG-001]` e `[BUG-002]`).

| Bug | Testes que falham |
|-----|-------------------|
| BUG-001: frete cobrado com subtotal de R$ 200,00 | CT13, CT14 e CT16 (API); CT13 e CT16 (UI) |
| BUG-002: limite de 5 unidades não validado na API | CT23 em `calcular` e em `pedidos` |

Os testes ficam vermelhos até a correção e depois passam a servir de regressão.
O histórico das execuções está em [`docs/05-execucao.md`](docs/05-execucao.md).

## Como a automação está organizada

```
automacao/
├── tests/
│   ├── api/   calculo-carrinho, pedidos, produtos-e-erros
│   └── ui/    vitrine, carrinho, checkout
├── pages/     page objects (vitrine, carrinho, checkout)
└── support/   dados da documentação, oráculo de cálculo, cliente da API, fluxos reutilizáveis e fixtures
```

Decisões que tomei:

- **Regra de negócio na API, fluxo na UI.** A documentação diz que a API calcula e a UI só exibe. Por isso a combinação de frete, cupom e arredondamento fica na API, que é rápida e determinística. A UI cobre os fluxos do usuário e uma checagem de consistência com a resposta real da API (CT33).
- **Valores em centavos.** `59.9 * 3` dá `179.70000000000002` em JavaScript, então as comparações são feitas com inteiros para não gerar falso negativo.
- **Dados em um lugar só** (`support/dados.ts`), copiados da documentação, com uma verificação que compara os preços com os da API.
- **Oráculo explícito** (`support/calculo.ts`): reimplementa as regras em centavos. É a minha leitura da documentação, então uma divergência pede conferência antes de virar bug.
- **Page objects e fixtures**, para os testes ficarem legíveis e para o seletor mudar em um lugar só. Os seletores preferem papéis e rótulos acessíveis (`getByRole`, `getByLabel`) e o `data-valor` do resumo.
- **Ambiente compartilhado:** poucos workers, sem retries agressivos e sem carga. Os endpoints usados não guardam estado, então não interferem em outros candidatos.
- Tags `@smoke` nos testes críticos, para uma execução rápida.

## Limitações e próximos passos

- Só Chromium. Com mais tempo, incluiria Firefox, WebKit e a tela de celular na automação.
- Validação por caixa-preta: sem acesso ao código nem a ferramentas de cobertura.
- A checagem de acessibilidade é manual (EX05). Dá para automatizar com `@axe-core/playwright`.
- Os testes de UI dependem de textos que podem mudar sem afetar a regra de negócio: as mensagens de cupom, o aviso de valor faltante, as mensagens de erro do checkout (que localizo pelo bloco do campo, sem depender de classe CSS) e a confirmação do pedido (pelo número). Em um produto real, eu combinaria com o time um `data-testid` estável para esses elementos.
- Os cenários CT07, CT08, CT09, CT36, CT37, CT39 e CT54 foram executados só manualmente, por dependerem de observação visual, do comportamento do navegador ou de algo que a documentação não define.

## Uso de IA

Usei o Claude (Anthropic) como apoio ao longo do teste. Ele me ajudou a:

- organizar a estrutura do repositório e dos documentos (plano de testes, rastreabilidade e modelos de execução e de bug);
- levantar e escrever os cenários de teste e o Gherkin a partir da documentação da entrega;

O trabalho de validação em si foi meu: executei a automação, reproduzi os bugs no Postman, fiz os testes manuais e as sessões exploratórias na loja, tirei os prints e reuni as evidências, conferi cada resultado e decidi o que era bug, o que era ambiguidade e o que era comportamento esperado.