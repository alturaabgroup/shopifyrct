const SHOPIFY_STOREFRONT_API_URL = `https://${import.meta.env.VITE_SHOPIFY_STORE_DOMAIN}/api/2025-10/graphql.json`;
const SHOPIFY_STOREFRONT_API_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN as string;

export async function shopifyFetch<TData = any, TVariables = any>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const res = await fetch(SHOPIFY_STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const message = json.errors.map((e: any) => e.message).join(', ');
    throw new Error(message);
  }

  return json.data as TData;
}