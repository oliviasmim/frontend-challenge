import type { CollectionId, Network, Nft } from '@kurio/contracts';

const PALETTES = [
  { bg: '#e9efd8', skin: '#7a4a2a', accent: '#1f6b46' }, // Emerald Ape
  { bg: '#f3efd9', skin: '#8a8f99', accent: '#7a5aa8' }, // Sage Nomad
  { bg: '#d9efe6', skin: '#2e2e33', accent: '#264a3a' }, // Neon Vessel
  { bg: '#f1ecd2', skin: '#c98a2b', accent: '#2f7d57' }, // Golden
];

const HERO: Array<[string, string, CollectionId, Network, number]> = [
  ['Emerald Ape #042', '1.19', 'digital-art', 'ethereum', 8],
  ['Sage Nomad #009', '1.69', 'collectibles', 'polygon', 5],
  ['Neon Vessel #552', '1.99', 'generative', 'solana', 3],
  ['Cosmic Bloom #118', '1.29', 'photography', 'ethereum', 6],
  ['Violet Nomad #314', '1.39', 'music', 'polygon', 4],
  ['Ivory Baron #088', '1.79', '3d-art', 'ethereum', 2],
  ['Golden Beat #207', '0.99', 'music', 'solana', 9],
  ['Golden Pulse #221', '1.09', 'games', 'polygon', 7],
  ['Golden Signal #160', '0.39', 'signatures', 'ethereum', 12],
];

const WORDS_A = ['Amber', 'Lunar', 'Pixel', 'Velvet', 'Cobalt', 'Mystic', 'Solar', 'Crimson', 'Frost'];
const WORDS_B = ['Drift', 'Echo', 'Relic', 'Atlas', 'Muse', 'Totem', 'Vector', 'Bloom', 'Ember'];
const COLLS: CollectionId[] = [
  'digital-art', 'photography', 'music', '3d-art', 'collectibles', 'generative', 'games', 'signatures', 'utility',
];
const NETS: Network[] = ['ethereum', 'polygon', 'solana'];

/** Determinístico: nenhuma aleatoriedade, os testes dependem destes números. */
export function buildNfts(): Nft[] {
  const out: Nft[] = [];
  for (let i = 0; i < 36; i++) {
    const hero = HERO[i];
    const art = PALETTES[i % PALETTES.length]!;
    const listedAt = new Date(Date.UTC(2026, 8, 30) - i * 86_400_000).toISOString();
    if (hero) {
      out.push({
        id: `nft-${i + 1}`, name: hero[0], price: hero[1], collection: hero[2], network: hero[3],
        available: hero[4], art, listedAt,
        ...(i === 2 ? { oldPrice: '2.29' } : {}),
      });
    } else {
      const cents = 5 + ((i * 37) % 120) * 10;
      out.push({
        id: `nft-${i + 1}`,
        name: `${WORDS_A[i % 9]} ${WORDS_B[(i * 4) % 9]} #${100 + i * 7}`,
        price: (cents / 100).toFixed(2),
        collection: COLLS[i % COLLS.length]!, network: NETS[(i * 5) % 3]!,
        available: 1 + (i % 6), art, listedAt,
      });
    }
  }
  return out;
}

export const PAGE_SIZE = 9;
