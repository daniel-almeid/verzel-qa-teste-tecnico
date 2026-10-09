# language: pt
@checkout @ui
Funcionalidade: Finalizar compra
  Como cliente da Verzel Store
  Quero informar meus dados de entrega e confirmar o pedido
  Para pagar na entrega

  Contexto:
    Dado que o carrinho possui 1 unidade de "Mochila Urbana 20L" (R$ 100,00)
    E que acesso a tela "Finalizar compra"

  Regra: O resumo do checkout é o mesmo do carrinho

    @CT55
    Esquema do Cenário: Resumo igual ao do carrinho
      Dado que o carrinho está com <situacao>
      Quando abro a tela de checkout
      Então o subtotal, o desconto, o frete e o total são iguais aos do carrinho
      E vejo o item "1x Mochila Urbana 20L"

      Exemplos:
        | situacao              |
        | nenhum cupom          |
        | o cupom "BEMVINDO10"  |

    @CT61
    Cenário: Voltar ao carrinho mantém item e cupom
      Dado que o cupom "BEMVINDO10" está aplicado
      Quando clico em "Voltar ao carrinho"
      Então vejo o item com quantidade 1
      E o desconto de R$ 10,00 continua aplicado

  Regra: Pedido válido é confirmado com um número no formato VZ-000000

    @CT56 @smoke
    Cenário: Confirmar pedido com dados válidos
      Quando informo nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
      E confirmo o pedido
      Então vejo a tela "Pedido confirmado" com o número no formato "VZ-000000"
      E vejo a saudação com o nome "Maria"
      E o resumo mostra os mesmos valores e itens que vi no checkout

    @CT62
    Cenário: O carrinho é esvaziado depois do pedido
      Quando informo dados válidos e confirmo o pedido
      Então o contador do carrinho mostra 0
      E ao abrir o carrinho vejo "Seu carrinho está vazio"

    @CT63
    Cenário: Continuar comprando depois do pedido
      Quando informo dados válidos e confirmo o pedido
      E clico em "Continuar comprando"
      Então vejo a vitrine com os 8 produtos

    @CT60
    Esquema do Cenário: CEP válido com ou sem hífen
      Quando informo nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "<cep>"
      E confirmo o pedido
      Então vejo o número do pedido no formato "VZ-000000"

      Exemplos:
        | cep       |
        | 01310100  |
        | 01310-100 |

  Regra: Os dados de entrega são validados (regras que já existiam)

    @CT57
    Cenário: Nome sem sobrenome
      Quando informo o nome "Maria" e confirmo o pedido
      Então vejo a mensagem de nome e sobrenome no campo "Nome completo"
      E o pedido não é confirmado

    @CT58
    Esquema do Cenário: E-mail em formato inválido
      Quando informo o e-mail "<email>" e confirmo o pedido
      Então vejo uma mensagem de erro no campo "E-mail"
      E o pedido não é confirmado

      Exemplos:
        | email     |
        | maria@    |
        | maria.com |

    @CT59
    Esquema do Cenário: CEP inválido
      Quando informo o CEP "<cep>" e confirmo o pedido
      Então vejo uma mensagem de erro no campo "CEP"
      E o pedido não é confirmado

      Exemplos:
        | cep       |
        | 0131010   |
        | 013101000 |
        | 0131A100  |
        |           |
