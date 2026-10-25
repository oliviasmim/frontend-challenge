import { expect, test } from '@playwright/test';
import { openWith } from './helpers';

// Cenários de openspec/changes/catalog-url-state

test.describe('Catálogo: estado de busca na URL', () => {
  test('Filtro sobrevive ao refresh', async ({ page }) => {
    await openWith(page, '/');
    await page.getByRole('button', { name: /Música/ }).click();
    await page.getByRole('button', { name: /Polygon/ }).click();
    await expect(page).toHaveURL(/collection=music/);
    await expect(page).toHaveURL(/network=polygon/);

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Violet Nomad #314' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Golden Beat #207' })).toHaveCount(0); // Solana
    await expect(page.getByRole('button', { name: /Música/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('Navegação pelo histórico restaura a busca', async ({ page }) => {
    await openWith(page, '/');
    await page.getByRole('searchbox').or(page.getByPlaceholder('Buscar NFTs…')).fill('Ape');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Ape/);
    await page.getByRole('button', { name: /Ethereum/ }).click();
    await expect(page).toHaveURL(/network=ethereum/);

    await page.goBack();

    await expect(page).toHaveURL(/q=Ape/);
    await expect(page).not.toHaveURL(/network=/);
    await expect(page.getByRole('button', { name: /Ethereum/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('Mudança de filtro na página 3 volta para a página 1', async ({ page }) => {
    await openWith(page, '/?page=3');
    await expect(page.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page');

    await page.getByRole('button', { name: /Fotografia/ }).click();

    await expect(page).toHaveURL(/page=1/);
    await expect(page.getByTestId('nft-card')).toHaveCount(4); // fixtures: 4 NFTs de Fotografia
  });

  test('Faixa de preço sem resultados mostra estado vazio', async ({ page }) => {
    await openWith(page, '/?network=solana&minPrice=12.00&maxPrice=12.30');
    await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();
  });

  test('Falha da API mostra erro e recupera na nova tentativa', async ({ page }) => {
    await openWith(page, '/', 'catalog-error');
    await expect(page.getByRole('alert')).toContainText('Catálogo indisponível');
    await page.evaluate(() => (window as unknown as { __mocks: { setScenario(s: string): void } }).__mocks.setScenario('default'));
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByTestId('nft-card')).toHaveCount(9);
  });
});
