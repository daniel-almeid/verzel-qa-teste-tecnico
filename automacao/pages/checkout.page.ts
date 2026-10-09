import { Locator, Page, expect } from "@playwright/test";
import { textoParaCentavos } from "../support/calculo";
import { CampoResumo } from "./carrinho.page";

export type CampoFormulario = "nome" | "email" | "cep";
export type DadosEntrega = Partial<Record<CampoFormulario, string>>;

const ROTULOS: Record<CampoFormulario, string> = { nome: "Nome completo", email: "E-mail", cep: "CEP" };
const DICA_CEP = "Somente números ou no formato 00000-000.";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get titulo(): Locator {
    return this.page.getByRole("heading", { name: "Finalizar compra" });
  }

  async aguardarCarregado(): Promise<void> {
    await expect(this.titulo).toBeVisible();
  }

  get voltarAoCarrinho(): Locator {
    return this.page.getByRole("link", { name: "Voltar ao carrinho" });
  }

  get botaoConfirmar(): Locator {
    return this.page.getByRole("button", { name: "Confirmar pedido" });
  }

  resumo(campo: CampoResumo): Locator {
    return this.page.locator(`dd[data-valor="${campo}"]`);
  }

  async centavos(campo: CampoResumo): Promise<number> {
    return textoParaCentavos(await this.resumo(campo).innerText());
  }

  get itensDoResumo(): Locator {
    return this.page.locator(".resumo-itens li");
  }

  async preencher(dados: DadosEntrega): Promise<void> {
    for (const campo of Object.keys(dados) as CampoFormulario[]) {
      await this.page.getByLabel(ROTULOS[campo], { exact: true }).fill(dados[campo] ?? "");
    }
  }

  async confirmar(): Promise<void> {
    await this.botaoConfirmar.click();
  }

  /** Tela de confirmação: número do pedido (formato documentado VZ-000000). */
  get numeroDoPedido(): Locator {
    return this.page.locator(".numero-pedido");
  }

  get seloConfirmacao(): Locator {
    return this.page.getByText("Pedido confirmado", { exact: true });
  }

  get saudacao(): Locator {
    return this.page.locator(".confirmacao").getByText(/Obrigado,/);
  }

  get continuarComprando(): Locator {
    return this.page.getByRole("link", { name: "Continuar comprando" });
  }

  /**
   * Mensagem exibida no bloco do campo (texto do bloco sem o rótulo e sem a dica fixa).
   * Retorna "" quando não há mensagem. Não depende da classe CSS do erro.
   */
  async mensagemDe(campo: CampoFormulario): Promise<string> {
    const bloco = this.page.locator(".campo").filter({ has: this.page.locator(`#campo-${campo}`) });
    let texto = await bloco.innerText();
    texto = texto.replace(ROTULOS[campo], "");
    if (campo === "cep") texto = texto.replace(DICA_CEP, "");
    return texto.trim();
  }
}
