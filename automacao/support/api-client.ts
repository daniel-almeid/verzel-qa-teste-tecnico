import { APIRequestContext, APIResponse } from '@playwright/test';
import { CLIENTE_VALIDO } from './dados';

export type PedidoParcial = {
  cliente?: Record<string, unknown>;
  itens?: unknown[];
  cupom?: unknown;
};

export class VerzelApi {
  constructor(private readonly request: APIRequestContext) { }

  produtos(): Promise<APIResponse> {
    return this.request.get('/api/produtos');
  }

  produto(id: string): Promise<APIResponse> {
    return this.request.get(`/api/produtos/${id}`);
  }

  calcular(itens: unknown, cupom?: unknown): Promise<APIResponse> {
    return this.request.post('/api/carrinho/calcular', {
      data: { itens, ...(cupom !== undefined ? { cupom } : {}) },
    });
  }

  criarPedido(parcial: PedidoParcial = {}): Promise<APIResponse> {
    return this.request.post('/api/pedidos', {
      data: {
        cliente: { ...CLIENTE_VALIDO, ...(parcial.cliente ?? {}) },
        itens: parcial.itens ?? [{ produtoId: 'P005', quantidade: 1 }],
        ...(parcial.cupom !== undefined ? { cupom: parcial.cupom } : {}),
      },
    });
  }

  postBruto(caminho: string, corpo: string): Promise<APIResponse> {
    return this.request.post(caminho, { headers: { 'Content-Type': 'application/json' }, data: corpo });
  }

  get(caminho: string): Promise<APIResponse> {
    return this.request.get(caminho);
  }
}
