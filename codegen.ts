import type { CodegenConfig } from '@graphql-codegen/cli';
import { shopifyPreset } from '@shopify/api-codegen-preset';

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    // Shopify Storefront 2025-10 schema SDL (downloaded via CLI or curl)
    './schema/storefront-2025-10.graphql': {}
  },
  documents: ['src/**/*.{ts,tsx,graphql,gql}'],
  generates: {
    'src/generated/storefront-types.ts': {
      preset: shopifyPreset,
      presetConfig: {
        apiVersion: '2025-10',
        isStorefrontApi: true
      }
    }
  }
};

export default config;