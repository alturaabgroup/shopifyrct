import { test, expect } from '@playwright/test';

test('Add to Cart -> Checkout flow', async ({ page }) => {
  await page.goto('/products');

  // Click first product in the list
  const firstProduct = page.locator('a[href^="/products/"]').first();
  await firstProduct.click();

  // Wait for product page to load
  await expect(page.locator('button', { hasText: 'Add to Cart' })).toBeVisible();

  // Add to cart
  await page.click('button:has-text("Add to Cart")');

  // Go to cart
  await page.goto('/cart');

  // Assert cart is not empty
  await expect(page.locator('text=Your cart is empty.')).toHaveCount(0);

  // Assert checkout button with URL
  const checkoutButton = page.locator('a >> text=Proceed to Checkout');
  await expect(checkoutButton).toBeVisible();

  const href = await checkoutButton.getAttribute('href');
  expect(href).toContain('checkouts'); // Shopify checkout URL
});