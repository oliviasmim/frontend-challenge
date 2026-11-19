/**
 * URL do canal de tempo real. Com mocks ligados, a conexão é interceptada pelo MSW
 * (@mswjs/socket.io-binding) e nunca sai do navegador.
 * Arquivo separado de `socket.ts` de propósito: os mocks importam esta constante sem
 * carregar o socket.io-client antes do MSW iniciar.
 */
export const REALTIME_URL = 'ws://realtime.nft-marketplace.test'
