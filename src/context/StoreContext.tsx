import React, { createContext, useContext, useEffect, useState } from 'react';
import { shopifyFetch } from '../services/shopifyClient';

type ShopPolicy = {
  handle: string;
  title: string;
  body: string;
  url?: string;
};

type ShopPage = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

type ShopInfo = {
  name: string;
  description?: string | null;
  brand?: {
    logo?: {
      image?: {
        url: string;
        altText?: string | null;
      } | null;
    } | null;
  } | null;
  primaryDomain: {
    url: string;
  };
  paymentSettings: {
    countryCode: string;
    currencyCode: string;
  };
};

type StoreContextValue = {
  shop: ShopInfo | null;
  pages: ShopPage[];
  policies: {
    privacyPolicy: ShopPolicy | null;
    refundPolicy: ShopPolicy | null;
    shippingPolicy: ShopPolicy | null;
    termsOfService: ShopPolicy | null;
  };
  loading: boolean;
  error: string | null;
  refreshShopData: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const SHOP_INFO_QUERY = /* GraphQL */ `
  query ShopInfo {
    shop {
      name
      description
      brand {
        logo {
          image {
            url
            altText
          }
        }
      }
      primaryDomain {
        url
      }
      paymentSettings {
        countryCode
        currencyCode
      }
    }
  }
`;

const PAGES_QUERY = /* GraphQL */ `
  query Pages($first: Int!) {
    pages(first: $first) {
      edges {
        node {
          id
          title
          handle
          body
          bodySummary
          seo {
            title
            description
          }
        }
      }
    }
  }
`;

const POLICIES_QUERY = /* GraphQL */ `
  query Policies {
    shop {
      privacyPolicy {
        title
        handle
        body
        url
      }
      refundPolicy {
        title
        handle
        body
        url
      }
      shippingPolicy {
        title
        handle
        body
        url
      }
      termsOfService {
        title
        handle
        body
        url
      }
    }
  }
`;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [pages, setPages] = useState<ShopPage[]>([]);
  const [policies, setPolicies] = useState<StoreContextValue['policies']>({
    privacyPolicy: null,
    refundPolicy: null,
    shippingPolicy: null,
    termsOfService: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshShopData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch shop info, pages, and policies in parallel
      const [shopData, pagesData, policiesData] = await Promise.all([
        shopifyFetch<{ shop: ShopInfo }>(SHOP_INFO_QUERY).catch(() => null),
        shopifyFetch<{ pages: { edges: Array<{ node: ShopPage }> } }>(PAGES_QUERY, {
          first: 50
        }).catch(() => null),
        shopifyFetch<{ shop: StoreContextValue['policies'] }>(POLICIES_QUERY).catch(() => null)
      ]);

      if (shopData?.shop) {
        setShop(shopData.shop);
      }

      if (pagesData?.pages) {
        setPages(pagesData.pages.edges.map((edge) => edge.node));
      }

      if (policiesData?.shop) {
        setPolicies({
          privacyPolicy: policiesData.shop.privacyPolicy || null,
          refundPolicy: policiesData.shop.refundPolicy || null,
          shippingPolicy: policiesData.shop.shippingPolicy || null,
          termsOfService: policiesData.shop.termsOfService || null
        });
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch shop data:', err);
      setError(err?.message ?? 'Failed to load store information');
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshShopData();
  }, []);

  const value: StoreContextValue = {
    shop,
    pages,
    policies,
    loading,
    error,
    refreshShopData
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
