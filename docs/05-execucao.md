# Execução dos testes

| | |
|---|---|
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev/ |
| **Versão** | 2.3.0 (VZS-142) |
| **Data da execução** | 06/10/2026 (automação), 07/10/2026 (Postman e testes manuais) e 08/10/2026 (sessões exploratórias) |
| **Navegador / SO** | Chromium 139 (Playwright), Postman (API) e Windows |
| **Executado por** | __________ |

Legenda: ✅ passou, ❌ falhou, ⚠️ parcial ou com dúvida, ➖ não executado.
Método: **M** manual, **A** automação, **M+A** os dois.
Quando um caso falhou, a linha aponta o bug em [`06-bugs.md`](06-bugs.md) e a evidência em [`evidencias/`](evidencias/).

## Resumo

| Total | ✅ | ❌ | ⚠️ | ➖ |
|-------|----|----|----|----|
| 63 | 59 | 4 | 0 | 0 |

Rodei os 63 casos. A automação (Playwright) cobre a maior parte, reproduzi os dois bugs no Postman e fiz na mão os casos de cupom, a navegação do carrinho, o formato de erro da API e um pedido completo. O checkout (CT55 a CT63) também está automatizado e passou. As 4 falhas são do BUG-001 e do BUG-002. As sete sessões exploratórias não acharam bug novo, só reflexos do BUG-001 na tela e algumas observações que anotei como ambiguidades.

## Histórico das execuções automatizadas

| Rodada | Resultado | O que aconteceu |
|--------|-----------|-----------------|
| 1 | 76 passaram, 8 falharam (84 testes) | Sete falhas eram dos bugs (BUG-001 e BUG-002). A oitava foi erro meu no teste do CT21: ele clicava num botão que o sistema desabilita ao chegar em 5 unidades, que é o certo. Corrigi o teste. |
| 2 (depois da correção) | 77 passaram, 7 falharam (84 testes) | Sobraram só as falhas dos bugs, marcadas com `[BUG-001]` e `[BUG-002]` no título. Os mesmos casos falharam nas duas rodadas, então não parece instabilidade do ambiente. |
| 3 (com o checkout) | 92 passaram, 7 falharam (99 testes) | As mesmas 7 falhas dos bugs. Os 15 testes novos do checkout passaram. |

**Evidências da automação:** salvei a saída do terminal da rodada 2 em [`evidencias/automacao-execucao-2.txt`](evidencias/automacao-execucao-2.txt) (detalhe das falhas e resumo: 77 passaram, 7 falharam) e a da rodada 3 em [`evidencias/automacao-execucao-3.txt`](evidencias/automacao-execucao-3.txt) (99 testes: 92 passaram, 7 falharam). Os casos com ✅ apontam para esses arquivos porque o resumo mostra que o restante passou. Os prints das falhas de tela vieram da pasta `test-results/` e foram copiados para `evidencias/` com o nome do bug.

## Casos de teste

| ID | Cenário | Método | Resultado | Obtido (se divergiu) | Bug | Evidência |
|----|---------|--------|-----------|----------------------|-----|-----------|
| CT01 | BEMVINDO10 em P005 x1 | M+A | ✅ | Na tela: desconto de R$ 10,00, frete de R$ 19,90 e total de R$ 109,90 |  | [log](evidencias/automacao-execucao-2.txt), [`CT07-cupom-aplicado.png`](evidencias/CT07-cupom-aplicado.png) |
| CT02 | cupom minúsculo | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT03 | cupom com espaços | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT04 | cupom caixa mista | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT05 | cupom inexistente | A | ✅ | Mensagem "Cupom inválido." conferida na tela e na API |  | [log](evidencias/automacao-execucao-2.txt) |
| CT06 | cupom expirado | M+A | ✅ | Mensagem "Cupom expirado." conferida na tela (print) e na API, sem desconto |  | [log](evidencias/automacao-execucao-2.txt), [`CT08-2-cupom-expirado.png`](evidencias/CT08-2-cupom-expirado.png) |
| CT07 | dois cupons | M | ✅ | Com o `BEMVINDO10` aplicado, o campo de cupom some e aparece "Cupom BEMVINDO10 aplicado. Remover cupom". Não dá para informar um segundo cupom sem remover o primeiro (CA05) |  | [`CT07-cupom-aplicado.png`](evidencias/CT07-cupom-aplicado.png) |
| CT08 | trocar cupom | M | ✅ | Removi o cupom e o desconto voltou a R$ 0,00 (total de R$ 119,90). Com o `VERAO2026` apareceu "Cupom expirado." e nenhum desconto. Aplicando o `BEMVINDO10` de novo, voltou o desconto de R$ 10,00 (total de R$ 109,90) |  | [`CT08-1-cupom-removido.png`](evidencias/CT08-1-cupom-removido.png), [`CT08-2-cupom-expirado.png`](evidencias/CT08-2-cupom-expirado.png), [`CT08-3-cupom-reaplicado.png`](evidencias/CT08-3-cupom-reaplicado.png) |
| CT09 | cupom vazio | M | ✅ | Campo vazio: aparece "Informe um cupom." e o resumo não muda. Só com espaços: testei e também ficou como esperado |  | [`CT09-campo-vazio.png`](evidencias/CT09-campo-vazio.png) |
| CT10 | desconto x frete | M+A | ✅ | Na tela, o desconto de R$ 10,00 não mexeu no frete (R$ 19,90) |  | [log](evidencias/automacao-execucao-2.txt), [`CT07-cupom-aplicado.png`](evidencias/CT07-cupom-aplicado.png) |
| CT11 | cupom null / vazio | A | ✅ | `null` e `""` foram tratados como sem cupom (A03) |  | [log](evidencias/automacao-execucao-2.txt) |
| CT12 | subtotal 199,80 | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT13 | subtotal 200,00 | M+A | ❌ | Com subtotal de R$ 200,00 o frete de R$ 19,90 é cobrado (esperado R$ 0,00). No Postman veio `frete` 19,9, `freteGratis` false, `valorFaltanteFreteGratis` 0 e `total` 219,9. A tela mostra o mesmo | [BUG-001](06-bugs.md) | [log](evidencias/automacao-execucao-2.txt), [`BUG-001-api-subtotal-200.png`](evidencias/BUG-001-api-subtotal-200.png), [`BUG-001-ui-frete-200.png`](evidencias/BUG-001-ui-frete-200.png) |
| CT14 | P008 x4 | M+A | ❌ | Subtotal de R$ 200,00 com 4 garrafas: o frete de R$ 19,90 é cobrado (esperado R$ 0,00). No Postman, `freteGratis` false e `total` 219,9 | [BUG-001](06-bugs.md) | [log](evidencias/automacao-execucao-2.txt), [`BUG-001-api-subtotal-200-p008.png`](evidencias/BUG-001-api-subtotal-200-p008.png) |
| CT15 | faltante na UI | M+A | ✅ | Aviso na tela: "Faltam R$ 100,00 para o frete grátis." |  | [log](evidencias/automacao-execucao-2.txt), [`CT08-1-cupom-removido.png`](evidencias/CT08-1-cupom-removido.png) |
| CT16 | 200 + cupom | A | ❌ | O desconto de R$ 20,00 está certo, mas o frete de R$ 19,90 é cobrado (esperado R$ 0,00), na API e na tela | [BUG-001](06-bugs.md) | [log](evidencias/automacao-execucao-2.txt), [`BUG-001-ui-frete-200-com-cupom.png`](evidencias/BUG-001-ui-frete-200-com-cupom.png) |
| CT17 | 199,80 + cupom | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT18 | P007 + cupom | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT19 | P003 x1 | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT20 | carrinho vazio | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT21 | limite 5 na UI | M+A | ✅ | Na tela, o botão "Adicionar ao carrinho" (vitrine) e o "+" (carrinho) travam na 5ª unidade, e o carrinho mostra um aviso de limite por produto. Ao reduzir para 4, o botão volta e o aviso some. Na 1ª rodada da automação o teste falhou por erro meu (clicava no botão desabilitado), já corrigido |  | [log](evidencias/automacao-execucao-2.txt) |
| CT22 | API qtd 5 | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT23 | API qtd 6 | M+A | ❌ | Com quantidade 6, o `calcular` responde 200 (subtotal 359,4) e o `pedidos` responde 201 (`VZ-236750`). O esperado era 422 `QUANTIDADE_MAXIMA_EXCEDIDA` | [BUG-002](06-bugs.md) | [log](evidencias/automacao-execucao-2.txt), [`BUG-002-api-qtd6.png`](evidencias/BUG-002-api-qtd6.png), [`BUG-002-api-pedido-qtd6.png`](evidencias/BUG-002-api-pedido-qtd6.png) |
| CT24 | API qtd inválida | A | ✅ | Testei 0, -1, 2.5, `"2"` e `null` |  | [log](evidencias/automacao-execucao-2.txt) |
| CT25 | item duplicado | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT26 | mesmo produto 2x na UI | A | ✅ | Fica uma linha só, com quantidade 2 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT27 | produto inexistente | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT28 | item inválido | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT29 | itens ausentes/vazios | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT30 | arredondamento P001 x3 | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT31 | P001 x5 + cupom | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT32 | todos x5 + cupom | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT33 | tela igual à API | M+A | ✅ | Nos 4 casos da automação a tela e a API batem, inclusive no limite de R$ 200,00, onde as duas têm o BUG-001. Na EX04 conferi na mão 5 carrinhos (com e sem cupom, 5 unidades de dois produtos e um perto do limite) na tela e no Postman, mais a confirmação do pedido: tudo igual ao valor esperado |  | [log](evidencias/automacao-execucao-2.txt) |
| CT34 | adicionar produto | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT35 | contador | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT36 | persistência na aba | M | ✅ | Com 1 item no carrinho, fui em Documentação e voltei: o item continuou lá |  |  |
| CT37 | outra aba vazia | M | ✅ | Em outra aba o carrinho veio vazio, como a documentação diz em "Sobre este ambiente". Não é bug |  |  |
| CT38 | alterar/remover/esvaziar | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT39 | F5 | M | ✅ | Depois do F5 no carrinho, os itens e o cupom continuaram como estavam |  |  |
| CT40 | pedido válido | A | ✅ | Só pela API. A tela está coberta pelo CT56 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT41 | nome sem sobrenome | A | ✅ | Só pela API. A tela está coberta pelo CT57 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT42 | e-mail inválido | A | ✅ | Só pela API. A tela está coberta pelo CT58 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT43 | CEP | A | ✅ | Só pela API. A tela está coberta pelo CT59 e CT60 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT44 | pedido com cupom inválido | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT45 | pedido com cupom expirado | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT46 | pedido sem itens | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT47 | GET produtos | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT48 | GET produto | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT49 | GET produto 404 | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT50 | JSON inválido | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT51 | rota inexistente | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT52 | método não permitido | A | ✅ | `GET /api/pedidos` retorna 405 |  | [log](evidencias/automacao-execucao-2.txt) |
| CT53 | formato do erro | A | ✅ |  |  | [log](evidencias/automacao-execucao-2.txt) |
| CT54 | campos em DADOS_INVALIDOS | M | ✅ | O `DADOS_INVALIDOS` (422) traz os detalhes em `erro.campos`, uma lista com `campo` e `mensagem` (por exemplo, `cliente.nome` com "Informe nome e sobrenome."). Bate com a documentação, então a A05 ficou resolvida |  | [`CT54-campos-dados-invalidos.png`](evidencias/CT54-campos-dados-invalidos.png) |
| CT55 | resumo do checkout igual ao do carrinho | A | ✅ | Resumo do checkout igual ao do carrinho, sem cupom e com o `BEMVINDO10`, e o item "1x Mochila Urbana 20L" |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT56 | pedido válido pela UI | M+A | ✅ | Fiz um pedido na mão com 1 calça jeans: apareceu o selo "Pedido confirmado", o número `VZ-275957`, a saudação com o meu nome e o resumo (subtotal R$ 139,90, desconto R$ 0,00, frete R$ 19,90 e total R$ 159,80), tudo certo. A automação confere o selo, o número `VZ-` com 6 dígitos, a saudação e o resumo igual ao do checkout |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT57 | nome sem sobrenome (UI) | A | ✅ | A mensagem de nome e sobrenome aparece no campo e o pedido não é confirmado |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT58 | e-mail inválido (UI) | A | ✅ | Aparece mensagem de erro no campo para `maria@` e `maria.com`, e o pedido não é confirmado |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT59 | CEP inválido (UI) | A | ✅ | Aparece mensagem de erro com 7 dígitos, 9 dígitos, letra e campo vazio, e o pedido não é confirmado |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT60 | CEP válido com e sem hífen (UI) | A | ✅ | Pedido confirmado com `01310100` e com `01310-100` |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT61 | voltar ao carrinho | A | ✅ | Ao voltar do checkout, o item e o cupom continuam no carrinho |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT62 | carrinho esvaziado após o pedido | M+A | ✅ | Na tela de confirmação o contador do carrinho fica em 0, e o carrinho aparece vazio ao abrir |  | [log 3](evidencias/automacao-execucao-3.txt) |
| CT63 | continuar comprando | A | ✅ | "Continuar comprando" leva para a vitrine com os 8 produtos |  | [log 3](evidencias/automacao-execucao-3.txt) |

## Sessões exploratórias

| Charter | Data | Duração | O que explorei | Achados e dúvidas | Bugs |
|---------|------|---------|----------------|-------------------|------|
| EX01 | 08/10/2026 | 25 min | O fluxo da vitrine até o checkout, mudando a ordem das ações: diminuir e aumentar a quantidade com cupom, remover um item e adicionar outro, esvaziar o carrinho, passar do limite de R$ 200 e ir e voltar entre carrinho e checkout | Ao diminuir de 2 para 1 mochila com o cupom aplicado, tudo recalculou certo (desconto de R$ 10,00, frete de R$ 19,90 e faltam R$ 100,00). Com 5 unidades (subtotal de R$ 500,00) o desconto foi para R$ 50,00. O cupom continua aplicado quando removo um item e adiciono outro produto, e só some no "Esvaziar carrinho" (A11). O frete e o aviso atualizam na hora quando passo de R$ 200. Com subtotal de exatamente R$ 200,00 o frete é cobrado e o aviso diz "Faltam R$ 0,00 para o frete grátis." (é o BUG-001 aparecendo na tela). O resumo do checkout atualiza depois que mexo no carrinho. Em todos os casos a conta fecha: total = subtotal - desconto + frete | BUG-001 (prints novos: [`BUG-001-ui-aviso-faltam-zero.png`](evidencias/BUG-001-ui-aviso-faltam-zero.png) e [`EX01-recalculo-1-mochila.png`](evidencias/EX01-recalculo-1-mochila.png)) |
| EX02 | 08/10/2026 | 20 min | O campo de cupom com entradas fora do padrão: espaço no meio do código, letra parecida (zero no lugar de O), acento, só números, texto longo, caracteres especiais, emoji e `verao2026` em minúsculas. Também apertei Enter no campo | O campo lidou bem com todas, e nenhuma entrada inválida foi aceita. Digitar o cupom correto e apertar Enter aplica o cupom, igual ao botão "Aplicar cupom" | Nenhum |
| EX03 | 08/10/2026 | 20 min | O limite de 5 unidades pela tela: cliques rápidos em "Adicionar ao carrinho" na vitrine, cliques no "+" do carrinho, voltar à vitrine com 5 no carrinho, reduzir de 5 para 4 e conferir o contador com vários produtos | Na vitrine, mesmo com cliques rápidos, o botão trava ao chegar em 5. No carrinho, o "+" também trava na 5ª unidade e aparece um aviso de limite por produto. Ao voltar à vitrine, o botão do produto continua travado. Ao reduzir de 5 para 4, o botão volta a funcionar e o aviso some. O contador soma certo. Não achei nenhum caminho pela tela que passe de 5, então a falha é só na API (BUG-002) | Nenhum novo |
| EX04 | 08/10/2026 | 30 min | A tela contra a API em 5 carrinhos, com o valor esperado calculado antes pela regra da documentação: C1 (1 camiseta, 1 boné e 2 kits de meias, sem cupom), C2 (os mesmos com `BEMVINDO10`), C3 (5 camisetas e 5 bonés com cupom), C4 (camiseta e calça, subtotal de R$ 199,80, com cupom) e C5 (1 kit de meias com cupom). Comparei subtotal, desconto, frete e total na tela e no `POST /api/carrinho/calcular` (Postman). Depois confirmei um pedido com o C2 e comparei a tela de confirmação | Em todos os carrinhos a tela, a API e o valor esperado ficaram iguais: C1 com total de R$ 189,50; C2 com desconto de R$ 16,96 e total de R$ 172,54; C3 com subtotal de R$ 549,00, frete grátis e total de R$ 494,10; C4 com desconto de R$ 19,98, frete de R$ 19,90 e total de R$ 199,72; C5 com desconto de R$ 2,99 e total de R$ 46,81. A confirmação do pedido manteve os valores do C2. Nenhuma divergência. Deixei de fora o subtotal de exatamente R$ 200,00 porque o BUG-001 já cobre esse caso | Nenhum |
| EX05 | 08/10/2026 | 15 min | Usabilidade e acessibilidade básica: navegar só pelo teclado (Tab, Enter e Espaço, aplicando cupom e finalizando a compra), mensagens de erro (cupom e formulário), zoom em 200%, tela de celular (cerca de 375 px), contraste e idioma das mensagens | Consegui usar a loja inteira só com o teclado, com ordem lógica e foco visível. As mensagens de erro e o zoom em 200% funcionam bem, e o resto (celular, contraste e idioma) também está certo. Nada fora do esperado | Nenhum |
| EX06 | 08/10/2026 | 10 min | O texto promocional da home contra a regra documentada: o banner ("Frete grátis a partir de R$ 200,00" e "na primeira compra, o cupom BEMVINDO10 dá 10% de desconto nos produtos"), os critérios CA01 a CA09, o mesmo cupom em dois carrinhos, o link "Ver as regras da promoção" e o valor de R$ 200,00 na home, no aviso "Faltam..." e na documentação | O banner está de acordo com a documentação: R$ 200,00 para o frete grátis e 10% sobre os produtos (CA01 e CA06). Os critérios CA01 a CA09 não falam de "primeira compra". Fiz um pedido com o `BEMVINDO10`, montei um segundo carrinho com o mesmo cupom e o sistema deixou aplicar de novo. Não considero bug, porque o ambiente não guarda histórico de pedidos ("Sobre este ambiente"), então não tem como cobrar "primeira compra". O link "Ver as regras da promoção" leva à documentação. O valor de R$ 200,00 é o mesmo na home, na documentação e no aviso "Faltam..." do carrinho (com subtotal de R$ 100,00 o aviso mostra "Faltam R$ 100,00"). Só que com subtotal de exatamente R$ 200,00 o aviso diz "Faltam R$ 0,00" e o frete é cobrado, que é o BUG-001 | Nenhum novo (A01 ficou como dúvida de conteúdo, e o BUG-001 ganhou mais um reflexo) |
| EX07 | 08/10/2026 | 15 min | A navegação do navegador com o carrinho cheio: Voltar e Avançar entre vitrine, carrinho e checkout, F5 no checkout com campos preenchidos, `/checkout` com o carrinho vazio, uma rota que não existe (`/xptoq`), Voltar depois de confirmar o pedido, F5 na tela de confirmação e duplo clique rápido em "Confirmar pedido" | Voltar e Avançar funcionam. No F5 do checkout os dados digitados somem e o resumo continua, o que é normal numa recarga. Com o carrinho vazio, abrir `/checkout` leva direto ao carrinho com a mensagem de carrinho vazio. Depois de confirmar o pedido, o Voltar do navegador mostra o carrinho vazio. O F5 na tela de confirmação não causou nada. O duplo clique rápido em "Confirmar pedido" não deu erro nem comportamento estranho (os pedidos não são guardados, então não dá para conferir se duplicou). Na rota que não existe a loja não redireciona e mostra "Página não encontrada. O endereço acessado não existe na Verzel Store.", que é o comportamento certo | Nenhum |