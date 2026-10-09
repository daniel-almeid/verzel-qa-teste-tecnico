# Matriz de rastreabilidade

Relaciona cada critério de aceite aos cenários que o cobrem e onde está a automação. O objetivo é mostrar que nenhum CA ficou sem cobertura.

| CA | Resumo | Cenários | Automação |
|----|--------|----------|-----------|
| CA01 | BEMVINDO10 dá 10% sobre o subtotal | CT01, CT31, CT32 | `api/calculo-carrinho`, `ui/carrinho` |
| CA02 | Cupom sem diferenciar caixa e com espaços | CT02, CT03, CT04 | `api/calculo-carrinho`, `ui/carrinho` |
| CA03 | Cupom inexistente: "Cupom inválido." | CT05, CT09, CT11 | `api/calculo-carrinho`, `ui/carrinho` |
| CA04 | Cupom expirado: "Cupom expirado." | CT06 | `api/calculo-carrinho`, `ui/carrinho` |
| CA05 | Um cupom por vez | CT07, CT08 | manual |
| CA06 | Frete grátis a partir de R$ 200,00 (inclusive) | CT13, CT14, CT18, CT19 | `api/calculo-carrinho`, `ui/carrinho` |
| CA07 | Frete de R$ 19,90 abaixo do limite e valor faltante | CT12, CT15, CT19 | `api/calculo-carrinho`, `ui/carrinho` |
| CA08 | Frete usa o subtotal antes do desconto | CT16, CT17 | `api/calculo-carrinho`, `ui/carrinho` |
| CA09 | Desconto não incide sobre o frete | CT01, CT10 | `api/calculo-carrinho`, `ui/carrinho` |
| CA10 | Máximo de 5 unidades por produto (UI e API) | CT21–CT25 | `api/calculo-carrinho`, `api/pedidos`, `ui/vitrine`, `ui/carrinho` |
| CA11 | Arredondamento em 2 casas | CT30, CT31, CT32 | `api/calculo-carrinho` |
| — | Regras pré-existentes (nome, e-mail, CEP) | CT40–CT43 (API), CT57–CT60 (UI) | `api/pedidos`, `ui/checkout` |
| — | Contrato e erros da API | CT47–CT54 | `api/produtos-e-erros` |
| — | Consistência UI × API | CT33 | `ui/carrinho` |
| — | Checkout: resumo, confirmação e retorno ao carrinho | CT55, CT56, CT61, CT62, CT63 | `ui/checkout` |

Cenários executados só no manual (CT07, CT08, CT09, CT36, CT37, CT39 e CT54) dependem de observação visual, de comportamento do navegador ou não tinham automação de custo justificável.
