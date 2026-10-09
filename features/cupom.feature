# language: pt
@cupom
Funcionalidade: Cupom de desconto no carrinho
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto
  Para pagar menos nas minhas compras

  Contexto:
    Dado que o carrinho possui 1 unidade de "Mochila Urbana 20L" (R$ 100,00)

  Regra: BEMVINDO10 dá 10% de desconto sobre o subtotal dos produtos

    @CT01 @CA01 @smoke
    Cenário: Aplicar o cupom válido
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é de R$ 10,00
      E o frete é de R$ 19,90
      E o total é de R$ 109,90

  Regra: O código não diferencia maiúsculas de minúsculas e ignora espaços nas pontas

    @CT02 @CT03 @CT04 @CA02
    Esquema do Cenário: Variações de formato do código
      Quando aplico o cupom "<codigo>"
      Então o cupom é aplicado com desconto de R$ 10,00

      Exemplos:
        | codigo       |
        | bemvindo10   |
        |   BEMVINDO10 |
        | BemVindo10   |

  Regra: Cupom inexistente ou expirado não gera desconto

    @CT05 @CA03
    Cenário: Cupom inexistente
      Quando aplico o cupom "XPTO"
      Então vejo a mensagem "Cupom inválido."
      E nenhum desconto é aplicado

    @CT06 @CA04
    Cenário: Cupom expirado
      Quando aplico o cupom "VERAO2026"
      Então vejo a mensagem "Cupom expirado."
      E nenhum desconto é aplicado

  Regra: Apenas um cupom pode estar aplicado por vez

    @CT07 @CA05
    Cenário: Tentar aplicar um segundo cupom sem remover o primeiro
      Dado que o cupom "BEMVINDO10" está aplicado
      Quando tento aplicar outro cupom sem remover o atual
      Então o sistema não permite dois cupons ao mesmo tempo

    @CT08 @CA05
    Cenário: Trocar de cupom removendo o atual
      Dado que o cupom "BEMVINDO10" está aplicado
      Quando removo o cupom
      E aplico o cupom "VERAO2026"
      Então vejo a mensagem "Cupom expirado."
      E nenhum desconto é aplicado

  Regra: O desconto não incide sobre o frete

    @CT10 @CA09
    Cenário: Frete permanece integral com cupom aplicado
      Quando aplico o cupom "BEMVINDO10"
      Então o frete continua em R$ 19,90
      E o total é igual ao subtotal menos o desconto mais o frete
