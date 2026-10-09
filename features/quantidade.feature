# language: pt
@quantidade
Funcionalidade: Limite de 5 unidades por produto
  Como loja
  Quero limitar a quantidade de cada produto por pedido
  Para respeitar a regra de negócio na interface e na API

  Regra: A interface não permite passar de 5 unidades

    @CT21 @CA10 @ui
    Cenário: Tentar adicionar a 6ª unidade
      Dado que o carrinho possui 5 unidades de "Camiseta Essencial"
      Quando tento adicionar mais 1 unidade de "Camiseta Essencial"
      Então a quantidade permanece em 5

  Regra: A API valida o mesmo limite

    @CT22 @CA10 @api
    Cenário: Exatamente 5 unidades é aceito
      Quando calculo um carrinho com 5 unidades do produto "P001"
      Então a resposta tem status 200

    @CT23 @CA10 @api
    Esquema do Cenário: Mais de 5 unidades é rejeitado
      Quando envio para "<rota>" um item "P001" com quantidade 6
      Então a resposta tem status 422
      E o código do erro é "QUANTIDADE_MAXIMA_EXCEDIDA"

      Exemplos:
        | rota                   |
        | /api/carrinho/calcular |
        | /api/pedidos           |

    @CT24 @api
    Esquema do Cenário: Quantidade fora do formato esperado
      Quando calculo um carrinho com quantidade <quantidade> para o produto "P001"
      Então a resposta tem status 422
      E o código do erro é "QUANTIDADE_INVALIDA"

      Exemplos:
        | quantidade |
        | 0          |
        | -1         |
        | 2.5        |
        | "2"        |
        | null       |

    @CT25 @api
    Cenário: Mesmo produto repetido na lista
      Quando calculo um carrinho com o produto "P001" repetido
      Então a resposta tem status 422
      E o código do erro é "ITEM_DUPLICADO"
