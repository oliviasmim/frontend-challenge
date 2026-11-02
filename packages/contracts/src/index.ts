export * from './eth';

export type Network = 'ethereum' | 'polygon' | 'solana';
export type CollectionId =
  | 'digital-art' | 'photography' | 'music' | '3d-art'
  | 'collectibles' | 'generative' | 'games' | 'signatures' | 'utility';
export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name';

export interface Nft {
  id: string;
  name: string;
  collection: CollectionId;
  network: Network;
  /** string decimal em ETH */
  price: string;
  oldPrice?: string;
  /** exemplares disponíveis da edição */
  available: number;
  /** paleta usada pela arte gerada (substitui o asset do Figma) */
  art: { bg: string; skin: string; accent: string };
  listedAt: string;
}

export interface NftListQuery {
  q?: string;
  collection?: CollectionId;
  network?: Network;
  minPrice?: string;
  maxPrice?: string;
  sort?: SortKey;
  page?: number;
}

export interface NftListResponse {
  items: Nft[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: { collections: Record<string, number>; networks: Record<string, number> };
}

export interface CartItem { nftId: string; quantity: number }
export interface Cart { items: CartItem[] }

export interface QuoteLine { nftId: string; name: string; unitPrice: string; quantity: number; lineTotal: string }
export interface Quote {
  lines: QuoteLine[];
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'declined';
export interface CreateOrderBody { items: CartItem[]; wallet: string; network: Network; collectorName: string; email: string }
/** Snapshot imutável: o recibo não muda se o catálogo mudar. */
export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  body: CreateOrderBody;
  quote: Quote;
  txHash: string;
}

export type ApiErrorCode =
  | 'validation_error' | 'unauthorized' | 'forbidden' | 'not_found'
  | 'availability_conflict' | 'idempotency_conflict' | 'transient_failure';
export interface ApiError { code: ApiErrorCode; message: string; fields?: Record<string, string> }

export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
export const NETWORK_FEE_BPS = 200; // 2% do subtotal (mock)

export const COLLECTIONS: { id: CollectionId; label: string }[] = [
  { id: 'digital-art', label: 'Arte digital' },
  { id: 'photography', label: 'Fotografia' },
  { id: 'music', label: 'Música' },
  { id: '3d-art', label: 'Arte 3D' },
  { id: 'collectibles', label: 'Colecionáveis' },
  { id: 'generative', label: 'Generativa' },
  { id: 'games', label: 'Jogos' },
  { id: 'signatures', label: 'Assinaturas' },
  { id: 'utility', label: 'Utilidade' },
];
export const NETWORKS: { id: Network; label: string }[] = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'solana', label: 'Solana' },
];
