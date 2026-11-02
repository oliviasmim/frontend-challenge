import type { Nft } from '@kurio/contracts';

/** Arte gerada em SVG: substitui os PNGs do Figma (documentado em ARCHITECTURE.md). */
export function NftArt({ nft, className }: { nft: Pick<Nft, 'name' | 'art'>; className?: string }) {
  const { bg, skin, accent } = nft.art;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Arte do NFT ${nft.name}`} className={className}>
      <rect width="200" height="200" rx="14" fill={bg} />
      <path d="M30 200c4-42 34-58 70-58s66 16 70 58z" fill={accent} />
      <circle cx="100" cy="88" r="44" fill={skin} />
      <ellipse cx="100" cy="102" rx="26" ry="20" fill="#e8cfae" opacity=".55" />
      <circle cx="82" cy="82" r="11" fill="#1c1c1c" /><circle cx="118" cy="82" r="11" fill="#1c1c1c" />
      <rect x="70" y="80" width="60" height="3" fill="#1c1c1c" />
      <path d="M86 112q14 8 28 0" stroke="#1c1c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
