import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

// Mock shopifyFetch
vi.mock('../services/shopifyClient', () => ({
  shopifyFetch: vi.fn()
}));

// Simple helper to wrap the hook in CartProvider
function renderCartHook() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>
  });
}

describe('CartProvider', () => {
  const mockCart = {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://shop.myshopify.com/checkouts/123',
    lines: {
      edges: []
    },
    estimatedCost: {
      subtotalAmount: { amount: '0.00', currencyCode: 'USD' },
      totalAmount: { amount: '0.00', currencyCode: 'USD' }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('creates a cart on init when no stored id exists', async () => {
    const { shopifyFetch } = await import('../services/shopifyClient');
    // First call: cartCreate
    (shopifyFetch as any).mockResolvedValueOnce({
      cartCreate: {
        cart: mockCart,
        userErrors: []
      }
    });

    const { result } = renderCartHook();

    // Wait for async init
    await act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });

    expect(result.current.cart?.id).toBe(mockCart.id);
    expect(window.localStorage.getItem('shopify_cart_id_v1')).toBe(mockCart.id);
  });

  it('adds an item via cartLinesAdd', async () => {
    const { shopifyFetch } = await import('../services/shopifyClient');

    // First call: cartCreate
    (shopifyFetch as any)
      .mockResolvedValueOnce({
        cartCreate: {
          cart: mockCart,
          userErrors: []
        }
      })
      // Second call: cartLinesAdd
      .mockResolvedValueOnce({
        cartLinesAdd: {
          cart: {
            ...mockCart,
            lines: {
              edges: [
                {
                  node: {
                    id: 'line-1',
                    quantity: 1,
                    merchandise: {
                      id: 'var-1',
                      title: 'Variant 1',
                      product: { title: 'Product 1' },
                      image: {
                        url: 'https://cdn.shopify.com/image.png',
                        altText: 'Product 1'
                      }
                    },
                    cost: {
                      totalAmount: { amount: '10.00', currencyCode: 'USD' }
                    }
                  }
                }
              ]
            },
            estimatedCost: {
              subtotalAmount: { amount: '10.00', currencyCode: 'USD' },
              totalAmount: { amount: '10.00', currencyCode: 'USD' }
            }
          },
          userErrors: []
        }
      });

    const { result } = renderCartHook();

    await act(async () => {
      await new Promise((res) => setTimeout(res, 0)); // init
    });

    await act(async () => {
      await result.current.addItem('var-1', 1);
    });

    expect(result.current.cart?.lines.length).toBe(1);
    expect(result.current.cart?.lines[0].quantity).toBe(1);
    expect(result.current.cart?.estimatedCost.subtotalAmount.amount).toBe('10.00');
  });

  it('updates line quantity via cartLinesUpdate', async () => {
    const { shopifyFetch } = await import('../services/shopifyClient');

    const cartWithLine = {
      ...mockCart,
      lines: {
        edges: [
          {
            node: {
              id: 'line-1',
              quantity: 1,
              merchandise: {
                id: 'var-1',
                title: 'Variant 1',
                product: { title: 'Product 1' },
                image: {
                  url: 'https://cdn.shopify.com/image.png',
                  altText: 'Product 1'
                }
              },
              cost: {
                totalAmount: { amount: '10.00', currencyCode: 'USD' }
              }
            }
          }
        ]
      },
      estimatedCost: {
        subtotalAmount: { amount: '10.00', currencyCode: 'USD' },
        totalAmount: { amount: '10.00', currencyCode: 'USD' }
      }
    };

    const updatedCart = {
      ...cartWithLine,
      lines: {
        edges: [
          {
            node: {
              ...cartWithLine.lines.edges[0].node,
              quantity: 2,
              cost: {
                totalAmount: { amount: '20.00', currencyCode: 'USD' }
              }
            }
          }
        ]
      },
      estimatedCost: {
        subtotalAmount: { amount: '20.00', currencyCode: 'USD' },
        totalAmount: { amount: '20.00', currencyCode: 'USD' }
      }
    };

    (shopifyFetch as any)
      // cartCreate
      .mockResolvedValueOnce({
        cartCreate: {
          cart: cartWithLine,
          userErrors: []
        }
      })
      // cartLinesUpdate
      .mockResolvedValueOnce({
        cartLinesUpdate: {
          cart: updatedCart,
          userErrors: []
        }
      });

    const { result } = renderCartHook();

    await act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });

    await act(async () => {
      await result.current.updateLineQuantity('line-1', 2);
    });

    expect(result.current.cart?.lines[0].quantity).toBe(2);
    expect(result.current.cart?.estimatedCost.subtotalAmount.amount).toBe('20.00');
  });

  it('removes a line via cartLinesRemove', async () => {
    const { shopifyFetch } = await import('../services/shopifyClient');

    const cartWithLine = {
      ...mockCart,
      lines: {
        edges: [
          {
            node: {
              id: 'line-1',
              quantity: 1,
              merchandise: {
                id: 'var-1',
                title: 'Variant 1',
                product: { title: 'Product 1' },
                image: {
                  url: 'https://cdn.shopify.com/image.png',
                  altText: 'Product 1'
                }
              },
              cost: {
                totalAmount: { amount: '10.00', currencyCode: 'USD' }
              }
            }
          }
        ]
      },
      estimatedCost: {
        subtotalAmount: { amount: '10.00', currencyCode: 'USD' },
        totalAmount: { amount: '10.00', currencyCode: 'USD' }
      }
    };

    const emptyCart = { ...cartWithLine, lines: { edges: [] }, estimatedCost: mockCart.estimatedCost };

    (shopifyFetch as any)
      // cartCreate
      .mockResolvedValueOnce({
        cartCreate: {
          cart: cartWithLine,
          userErrors: []
        }
      })
      // cartLinesRemove
      .mockResolvedValueOnce({
        cartLinesRemove: {
          cart: emptyCart,
          userErrors: []
        }
      });

    const { result } = renderCartHook();

    await act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });

    await act(async () => {
      await result.current.removeLine('line-1');
    });

    expect(result.current.cart?.lines.length).toBe(0);
  });
});