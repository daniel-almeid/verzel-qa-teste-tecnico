# language: pt
@pedido @api
Funcionalidade: Confirmação do pedido
  Como cliente da Verzel Store
  Quero confirmar meu pedido informando meus dados
  Para pagar na entrega

  Regra: Pedido válido gera número e resumo de valores

    @CT40 @smoke
    Cenário: Pedido válido com cupom
      Quando envio um pedido de "Maria Silva", "maria@exemplo.com", CEP "01310-100" com 1 unidade de "P005" e o cupom "BEMVINDO10"
      Então a resposta tem status 201
      E o número do pedido segue o formato "VZ-000000"
      E o CEP retornado é "01310100"
      E o total é de R$ 109,90

  Regra: Os dados do cliente são validados

    @CT41
    Cenário: Nome sem sobrenome
      Quando envio um pedido com o nome "Maria"
      Então a resposta tem status 422
      E o código do erro é "DADOS_INVALIDOS"

    @CT42
    Esquema do Cenário: E-mail em formato inválido
      Quando envio um pedido com o e-mail "<email>"
      Então a resposta tem status 422
      E o código do erro é "DADOS_INVALIDOS"

      Exemplos:
        | email     |
        | maria@    |
        | maria.com |

    @CT43
    Esquema do Cenário: CEP deve ter 8 dígitos, com ou sem hífen
      Quando envio um pedido com o CEP "<cep>"
      Então a resposta tem o status <status>

      Exemplos:
        | cep       | status |
        | 01310100  | 201    |
        | 01310-100 | 201    |
        | 0131010   | 422    |
        | 013101000 | 422    |
        | 0131A100  | 422    |

  Regra: Em pedidos, cupom inválido ou expirado é erro

    @CT44 @CT45
    Esquema do Cenário: Cupom que não pode ser usado
      Quando envio um pedido com o cupom "<cupom>"
      Então a resposta tem status 422
      E o código do erro é "<codigo>"

      Exemplos:
        | cupom     | codigo         |
        | XPTO      | CUPOM_INVALIDO |
        | VERAO2026 | CUPOM_EXPIRADO |
