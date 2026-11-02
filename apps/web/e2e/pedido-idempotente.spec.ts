import { expect, test } from '@playwright/test';
import { addToCart, fillCheckout, openWith, orderIds } from './helpers';

// Cenários BDD de docs/pedido-idempotente-spec.md

test.describe('Pedido idempotente no pagamento', () => {
  test('Clique repetido gera um único pedido', async ({ page }) => {
    // Dado que o carrinho tem 1 "Emerald Ape #042" a 1.19 ETH
    await openWith(page, '/');
    await addToCart(page, 'Emerald Ape #042');
    await page.goto('/checkout');
    await fillCheckout(page);

    // Quando o colecionador clica duas vezes em "Confirmar compra"
    await page.getByRole('button', { name: 'Confirmar compra' }).dblclick();

    // Então existe exatamente 1 pedido
    await expect(page.getByRole('heading', { name: /Pedido confirmado/ })).toBeVisible();
    expect(await orderIds(page)).toHaveLength(1);
    // E a confirmação exibe o total de 1.19 ETH mais a taxa de rede (2%)
    await expect(page.getByTestId('receipt-total')).toHaveText('1.2138 ETH');
  });

  test('Timeout após criar o pedido recupera o mesmo pedido', async ({ page }) => {
    // Dado que o carrinho tem 1 "Emerald Ape #042" e a resposta da criação expira
    await openWith(page, '/', 'order-timeout-after-create');
    await addToCart(page, 'Emerald Ape #042');
    await page.goto('/checkout');
    await fillCheckout(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();

    // Quando o colecionador vê o erro e clica em "Tentar novamente"
    await expect(page.getByRole('alert')).toContainText('Seus itens foram preservados');
    const [createdBeforeTimeout] = await orderIds(page);
    expect(createdBeforeTimeout).toBeTruthy();
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    // Então o pedido confirmado tem o mesmo identificador, e existe exatamente 1 pedido
    await expect(page.getByTestId('order-id')).toHaveText(createdBeforeTimeout!);
    expect(await orderIds(page)).toHaveLength(1);
  });

  test('Mesma chave com quantidade diferente é recusada', async ({ page }) => {
    await openWith(page, '/');
    const post = (quantity: number) =>
      page.evaluate(async (q) => {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'chave-fixa-1' },
          body: JSON.stringify({
            items: [{ nftId: 'nft-1', quantity: q }],
            wallet: '0xA11ce', network: 'ethereum', collectorName: 'Ana', email: 'ana@example.com',
          }),
        });
        return { status: res.status, body: await res.json() };
      }, quantity);

    // Dado que um pedido foi criado com 1 "Emerald Ape #042"
    const first = await post(1);
    expect(first.status).toBe(201);

    // Quando a mesma chave é reenviada com 2 "Emerald Ape #042"
    const second = await post(2);

    // Então a resposta é conflito de idempotência e o pedido original permanece com quantidade 1
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('idempotency_conflict');
    const original = await page.evaluate(async (id) => (await fetch(`/api/orders/${id}`)).json(), first.body.id);
    expect(original.body.items).toEqual([{ nftId: 'nft-1', quantity: 1 }]);
  });
});
