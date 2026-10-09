# language: pt
@frete
Funcionalidade: Frete grátis a partir de R$ 200,00
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras maiores
  Para pagar menos nas minhas compras

  Regra: Abaixo de R$ 200,00 o frete é de R$ 19,90 e o carrinho informa quanto falta

    @CT12 @CA07 @smoke
    Cenário: Subtotal logo abaixo do limite
      Dado que o carrinho possui "Camiseta Essencial" e "Calça Jeans Slim"
      Quando visualizo o resumo do carrinho
      Então o subtotal é de R$ 199,80
      E o frete é de R$ 19,90
      E o valor faltante para o frete grátis é de R$ 0,20
      E o total é de R$ 219,70

    @CT15 @CA07
    Cenário: A tela informa quanto falta
      Dado que o carrinho possui 1 unidade de "Mochila Urbana 20L"
      Quando visualizo o resumo do carrinho
      Então vejo que faltam R$ 100,00 para o frete grátis

  Regra: A partir de R$ 200,00, inclusive, o frete é grátis

    @CT13 @CA06 @smoke
    Cenário: Subtotal exatamente no limite
      Dado que o carrinho possui 2 unidades de "Mochila Urbana 20L"
      Quando visualizo o resumo do carrinho
      Então o frete é grátis
      E o valor faltante para o frete grátis é de R$ 0,00
      E o total é de R$ 200,00

  Regra: O frete considera o subtotal antes do desconto do cupom

    @CT16 @CA08
    Cenário: Subtotal de R$ 200,00 com cupom continua com frete grátis
      Dado que o carrinho possui 2 unidades de "Mochila Urbana 20L"
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é de R$ 20,00
      E o frete é grátis
      E o total é de R$ 180,00

    @CT17 @CA08
    Cenário: Subtotal abaixo de R$ 200,00 com cupom continua pagando frete
      Dado que o carrinho possui "Camiseta Essencial" e "Calça Jeans Slim"
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é de R$ 19,98
      E o frete é de R$ 19,90
      E o total é de R$ 199,72

  Regra: Carrinho vazio

    @CT20
    Cenário: Acessar o carrinho sem itens
      Dado que o carrinho está vazio
      Quando acesso a página do carrinho
      Então vejo a mensagem "Seu carrinho está vazio"
