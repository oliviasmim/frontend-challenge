import { expect, type Page } from '@playwright/test';

type Scenario = 'default' | 'empty' | 'catalog-error' | 'slow' | 'order-timeout-after-create' | 'payment-declined';

/** Abre a app com um cenário conhecido. Cada teste tem contexto (e localStorage) isolado. */
export async function openWith(page: Page, path: string, scenario: Scenario = 'default') {
  await page.goto('/');
  await page.waitForFunction(() => '__mocks' in window);
  await page.evaluate((s) => {
    const m = (window as unknown as { __mocks: { reset(s: string): void } }).__mocks;
    m.reset(s);
  }, scenario);
  await page.goto(path);
}

export const orderIds = (page: Page) =>
  page.evaluate(() =>
    Object.keys((window as unknown as { __mocks: { state(): { orders: object } } }).__mocks.state().orders));

export async function addToCart(page: Page, name: string) {
  await page.getByRole('button', { name: `Adicionar ${name} ao carrinho` }).click();
  await expect(page.getByTestId('cart-count')).not.toHaveText('0');
}

export async function fillCheckout(page: Page) {
  await page.getByLabel('Nome do colecionador').fill('Ana Colecionadora');
  await page.getByLabel('E-mail').fill('ana@example.com');
  await page.getByLabel('Endereço da carteira').fill('0xA11ce000000000000000000000000000000000');
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
}
