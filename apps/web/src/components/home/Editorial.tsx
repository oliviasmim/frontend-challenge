import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { NftArt } from '../NftArt';
import { Button } from '../ui/button';

const ART = {
  ape: { name: 'Emerald Ape #042', art: { bg: '#e9efd8', skin: '#7a4a2a', accent: '#1f6b46' } },
  baron: { name: 'Ivory Baron #088', art: { bg: '#d9efe6', skin: '#2e2e33', accent: '#264a3a' } },
  sage: { name: 'Sage Nomad #009', art: { bg: '#f3efd9', skin: '#8a8f99', accent: '#7a5aa8' } },
  gold: { name: 'Golden Beat #207', art: { bg: '#f1ecd2', skin: '#c98a2b', accent: '#2f7d57' } },
};

/** Banners editoriais: os botões "Explorar" levam ao catálogo filtrado (ação real). */
export function PromoBanners() {
  return (
    <section aria-label="Destaques editoriais" className="mx-auto grid max-w-[1200px] gap-6 px-4 py-10 md:grid-cols-2">
      {[
        { art: ART.ape, title: 'Lançamentos gênesis de edição limitada', text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.', search: { sort: 'recent' as const, page: 1 } },
        { art: ART.baron, title: 'Arte digital selecionada e muito mais', text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.', search: { sort: 'recent' as const, page: 1, collection: 'digital-art' as const } },
      ].map((b) => (
        <article key={b.title} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-lg bg-surface">
          <NftArt nft={b.art} className="h-full w-full object-cover" />
          <div className="flex flex-col items-end justify-center gap-3 p-4 text-right">
            <h2 className="text-sm font-bold">{b.title}</h2>
            <p className="text-xs text-muted">{b.text}</p>
            <Link to="/" search={b.search} hash="catalogo" className="rounded-md bg-accent px-4 py-2 text-xs font-bold text-accent-fg">
              Explorar →
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

const POSTS = [
  { art: ART.baron, date: '12 de setembro', read: '6 min', title: 'Como funciona a propriedade de NFTs', text: 'Aprenda a colecionar, negociar e verificar ativos digitais.' },
  { art: ART.ape, date: '13 de setembro', read: '2 min', title: '10 artistas digitais para acompanhar', text: 'Conheça criadores que moldam a cultura digital.' },
  { art: ART.sage, date: '15 de setembro', read: '3 min', title: 'Raridade, atributos e procedência', text: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { art: ART.gold, date: '15 de setembro', read: '2 min', title: 'Como proteger sua carteira', text: 'Proteja sua carteira, seus ativos e sua identidade.' },
];

/** Páginas editoriais estão fora do escopo (§3): "Ler mais" aparece desativado, sem simular sucesso. */
export function Diario() {
  return (
    <section aria-labelledby="diario" className="mx-auto max-w-[1200px] px-4 py-10">
      <h2 id="diario" className="text-center text-2xl font-bold">Diário da Cunhagem</h2>
      <p className="mb-8 mt-2 text-center text-xs text-muted">
        Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      </p>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((p) => (
          <li key={p.title} className="overflow-hidden rounded-lg bg-surface">
            <NftArt nft={p.art} className="aspect-[4/3] w-full" />
            <div className="space-y-2 p-3 text-xs">
              <p className="text-[10px] text-muted">{p.date} &nbsp;|&nbsp; Leitura de {p.read}</p>
              <h3 className="text-sm font-bold">{p.title}</h3>
              <p className="text-muted">{p.text}</p>
              <span aria-disabled="true" title="Em breve" className="inline-block cursor-not-allowed font-bold text-accent/60">
                Ler mais → <span className="font-normal">(em breve)</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const BENEFITS = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça criadores, estúdios e comunidades que moldam a arte digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
];

export function Benefits() {
  const [notice, setNotice] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Newsletter está fora do escopo: nunca informamos sucesso.
    setNotice('A inscrição na newsletter não está disponível nesta demonstração.');
  };
  return (
    <section aria-label="Benefícios" className="mx-auto max-w-[1200px] px-4 py-6">
      <div className="grid gap-6 rounded-t-lg bg-surface p-6 md:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="space-y-2 md:border-r md:border-accent/40 md:pr-4">
            <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-fg">{b.letter}</div>
            <h3 className="text-sm font-bold">{b.title}</h3>
            <p className="text-xs text-muted">{b.text}</p>
          </div>
        ))}
        <form onSubmit={submit} className="space-y-2" noValidate>
          <h3 className="text-sm font-bold">Antecipe-se ao próximo lançamento</h3>
          <div className="flex">
            <label htmlFor="newsletter" className="sr-only-live">Seu e-mail</label>
            <input id="newsletter" type="email" placeholder="digite seu e-mail..." className="min-w-0 flex-1 rounded-l-md border border-line bg-surface-2 px-3 py-2 text-xs" />
            <Button type="submit" className="rounded-l-none">Enviar</Button>
          </div>
          <p role="status" className="text-xs text-muted">
            {notice || 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.'}
          </p>
        </form>
      </div>
    </section>
  );
}

const COLS = [
  { title: 'Meu perfil', items: ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'] },
  { title: 'Central de ajuda', items: ['Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'] },
  { title: 'Coleções', items: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'] },
];

/** Links de páginas fora do escopo são texto simples: não aparentam funcionar. */
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1200px] px-4 pb-6">
      <div className="grid gap-3 bg-[#3a2410] p-4 text-xs md:grid-cols-3">
        <strong className="tracking-widest">KURIO</strong>
        <span>Feito para colecionadores, criadores e cultura</span>
        <span>contato@email.com &nbsp;·&nbsp; +55 11 4002 8922</span>
      </div>
      <div className="grid gap-6 bg-surface p-6 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-3 text-sm font-bold">{c.title}</h2>
            <ul className="space-y-2 text-muted">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </nav>
        ))}
        <div>
          <h2 className="mb-3 text-sm font-bold">Redes sociais</h2>
          <p className="mb-6 text-muted">Facebook · Instagram · Twitter · LinkedIn · YouTube</p>
          <h2 className="mb-2 text-sm font-bold">Carteiras compatíveis</h2>
          <p className="text-[10px] text-accent">METAMASK · WALLETCONNECT · COINBASE</p>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
