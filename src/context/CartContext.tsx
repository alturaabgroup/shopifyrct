import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { shopifyFetch } from '../services/shopifyClient';

type Money = {
  amount: string;
  currencyCode: string;
};

type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    productTitle: string;
    image?: {
      url: string;
      altText?: string | null;
    } | null;
  };
  cost: {
    totalAmount: Money;
  };
};

type Cart = {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  estimatedCost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
};

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const LS_CART_ID_KEY = 'shopify_cart_id_v1';

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
              }
              image {
                url(transform: { maxWidth: 400, maxHeight: 400 })
                altText
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
    estimatedCost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_QUERY = /* GraphQL */ `
  query CartQuery($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

function mapCart(apiCart: any): Cart {
  return {
    id: apiCart.id,
    checkoutUrl: apiCart.checkoutUrl,
    lines:
      apiCart.lines?.edges?.map((edge: any) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        merchandise: {
          id: edge.node.merchandise.id,
          title: edge.node.merchandise.title,
          productTitle: edge.node.merchandise.product?.title,
          image: edge.node.merchandise.image
        },
        cost: edge.node.cost
      })) ?? [],
    estimatedCost: apiCart.estimatedCost
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function createCartIfNeeded(): Promise<Cart> {
    if (cart) return cart;

    const storedId = window.localStorage.getItem(LS_CART_ID_KEY);

    if (storedId) {
      try {
        const data = await shopifyFetch<{ cart: any }>(CART_QUERY, { id: storedId });
        if (data.cart) {
          const mapped = mapCart(data.cart);
          setCart(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to fetch stored cart, creating a new one.', err);
        window.localStorage.removeItem(LS_CART_ID_KEY);
      }
    }

    const data = await shopifyFetch<{ cartCreate: { cart: any; userErrors: any[] } }>(
      CART_CREATE_MUTATION,
      { input: {} }
    );
    if (data.cartCreate.userErrors?.length || !data.cartCreate.cart) {
      throw new Error(
        data.cartCreate.userErrors?.map((e: any) => e.message).join(', ') ||
          'Failed to create cart'
      );
    }
    const created = mapCart(data.cartCreate.cart);
    setCart(created);
    window.localStorage.setItem(LS_CART_ID_KEY, created.id);
    return created;
  }

  async function refreshCart() {
    setLoading(true);
    setError(null);
    try {
      const existing = await createCartIfNeeded();
      const data = await shopifyFetch<{ cart: any }>(CART_QUERY, { id: existing.id });
      if (!data.cart) throw new Error('Cart not found');
      const refreshed = mapCart(data.cart);
      setCart(refreshed);
      setLoading(false);
    } catch (err: any) {
      console.error('refreshCart error', err);
      setError(err?.message ?? 'Failed to refresh cart');
      setLoading(false);
    }
  }

  async function addItem(merchandiseId: string, quantity: number = 1) {
    setLoading(true);
    setError(null);
    try {
      const existing = await createCartIfNeeded();
      const data = await shopifyFetch<{
        cartLinesAdd: { cart: any; userErrors: any[] };
      }>(CART_LINES_ADD_MUTATION, {
        cartId: existing.id,
        lines: [{ merchandiseId, quantity }]
      });
      if (data.cartLinesAdd.userErrors?.length || !data.cartLinesAdd.cart) {
        throw new Error(
          data.cartLinesAdd.userErrors?.map((e: any) => e.message).join(', ') ||
            'Failed to add line'
        );
      }
      const updated = mapCart(data.cartLinesAdd.cart);
      setCart(updated);
      setLoading(false);
    } catch (err: any) {
      console.error('addItem error', err);
      setError(err?.message ?? 'Failed to add item');
      setLoading(false);
    }
  }

  async function updateLineQuantity(lineId: string, quantity: number) {
    setLoading(true);
    setError(null);
    try {
      if (!cart) {
        throw new Error('No cart');
      }
      const data = await shopifyFetch<{
        cartLinesUpdate: { cart: any; userErrors: any[] };
      }>(CART_LINES_UPDATE_MUTATION, {
        cartId: cart.id,
        lines: [{ id: lineId, quantity }]
      });
      if (data.cartLinesUpdate.userErrors?.length || !data.cartLinesUpdate.cart) {
        throw new Error(
          data.cartLinesUpdate.userErrors?.map((e: any) => e.message).join(', ') ||
            'Failed to update line'
        );
      }
      const updated = mapCart(data.cartLinesUpdate.cart);
      setCart(updated);
      setLoading(false);
    } catch (err: any) {
      console.error('updateLineQuantity error', err);
      setError(err?.message ?? 'Failed to update line');
      setLoading(false);
    }
  }

  async function removeLine(lineId: string) {
    setLoading(true);
    setError(null);
    try {
      if (!cart) {
        throw new Error('No cart');
      }
      const data = await shopifyFetch<{
        cartLinesRemove: { cart: any; userErrors: any[] };
      }>(CART_LINES_REMOVE_MUTATION, {
        cartId: cart.id,
        lineIds: [lineId]
      });
      if (data.cartLinesRemove.userErrors?.length || !data.cartLinesRemove.cart) {
        throw new Error(
          data.cartLinesRemove.userErrors?.map((e: any) => e.message).join(', ') ||
            'Failed to remove line'
        );
      }
      const updated = mapCart(data.cartLinesRemove.cart);
      setCart(updated);
      setLoading(false);
    } catch (err: any) {
      console.error('removeLine error', err);
      setError(err?.message ?? 'Failed to remove line');
      setLoading(false);
    }
  }

  async function clearCart() {
    if (!cart) return;
    const lineIds = cart.lines.map((l) => l.id);
    if (!lineIds.length) return;
    await Promise.all(lineIds.map((id) => removeLine(id)));
  }

  useEffect(() => {
    // Initialize cart on mount
    (async () => {
      setLoading(true);
      try {
        await createCartIfNeeded();
        setLoading(false);
      } catch (err: any) {
        console.error('Cart init error', err);
        setError(err?.message ?? 'Failed to init cart');
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: CartContextValue = useMemo(
    () => ({
      cart,
      loading,
      error,
      addItem,
      updateLineQuantity,
      removeLine,
      clearCart,
      refreshCart
    }),
    [cart, loading, error]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}