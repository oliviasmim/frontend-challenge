import axios, { isAxiosError } from 'axios';
import type { ApiError } from '@kurio/contracts';

/** Único cliente HTTP. Nenhuma resposta fictícia aqui: o MSW intercepta na rede. */
export const api = axios.create({ baseURL: '/api', timeout: 10_000 });

export function toApiError(e: unknown): ApiError {
  if (isAxiosError(e)) {
    const data = e.response?.data as ApiError | undefined;
    if (data?.code) return data;
    if (e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK')
      return { code: 'transient_failure', message: 'Sem resposta do servidor. Tente novamente.' };
  }
  return { code: 'transient_failure', message: 'Algo deu errado. Tente novamente.' };
}
