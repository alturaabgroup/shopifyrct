# Dynamic CMS Pages & Store Settings Implementation

This document explains how the dynamic CMS pages and store settings system works in your Shopify headless PWA.

## Overview

The application now fetches and displays all CMS content dynamically from your Shopify store, including:
- Custom pages created in Shopify Admin
- Store policies (Privacy, Terms, Refund, Shipping)
- Store information (logo, name, description)
- Navigation structure based on available content

## Architecture

### 1. Store Context (`src/context/StoreContext.tsx`)

Central state management for all store-related data:

**What it fetches:**
- Shop information (name, description, logo, domain, currency)
- All published pages (up to 50)
- Store policies (privacy, terms, refund, shipping)

**GraphQL Queries Used:**
- `SHOP_INFO_QUERY` - Fetches shop branding and settings
- `PAGES_QUERY` - Fetches all custom pages
- `POLICIES_QUERY` - Fetches legal policies

**Usage in components:**
```tsx
import { useStore } from '../context/StoreContext';

const MyComponent = () => {
  const { shop, pages, policies, loading, error } = useStore();
  
  // Access shop name
  console.log(shop?.name);
  
  // Access shop logo
  console.log(shop?.brand?.logo?.image?.url);
  
  // List all pages
  pages.map(page => console.log(page.title));
};
```

### 2. Dynamic Page Component (`src/routes/DynamicPage.tsx`)

Renders any Shopify page by its handle (URL slug).

**Features:**
- Fetches page content on-demand using the handle from URL
- Sets document title and meta description for SEO
- Handles 404 for non-existent pages
- Renders HTML content safely

**Route:** `/pages/:handle`

**Example URLs:**
- `/pages/about-us`
- `/pages/contact`
- `/pages/shipping-info`

### 3. Pages List (`src/routes/PagesListPage.tsx`)

Displays all available pages and policies in a browsable format.

**Features:**
- Shows all custom pages with summaries
- Lists all available policies
- Clean navigation structure

**Route:** `/pages`

### 4. Policy Pages (`src/routes/PolicyPage.tsx`)

Dedicated component for rendering store policies.

**Routes:**
- `/pages/policies/privacy-policy`
- `/pages/policies/terms-of-service`
- `/pages/policies/refund-policy`
- `/pages/policies/shipping-policy`

### 5. Enhanced Router & Footer (`src/routes/Router.tsx`)

**Header Updates:**
- Displays shop logo (if configured) or shop name
- Added "Pages" link to main navigation
- Shows store branding consistently

**Footer Updates:**
- Shop information section
- Quick links navigation
- Dynamic pages list (first 5)
- All policies linked
- Copyright notice with shop name

## How to Add/Edit Content

### Adding a New Page in Shopify Admin

1. **Go to:** Shopify Admin → Online Store → Pages
2. **Click:** "Add page"
3. **Fill in:**
   - Title (e.g., "About Us")
   - Content (rich text editor)
   - SEO title & description
4. **Set visibility:** Published
5. **Save**

The page will automatically appear:
- In the footer navigation
- At `/pages/page-handle` URL
- In the pages list at `/pages`

### Setting Up Store Logo

1. **Go to:** Shopify Admin → Settings → Brand
2. **Upload:** Your logo image
3. **Save**

The logo will automatically appear in:
- Header navigation
- Anywhere `shop?.brand?.logo?.image?.url` is used

### Configuring Store Policies

1. **Go to:** Shopify Admin → Settings → Policies
2. **Fill in:** 
   - Privacy policy
   - Refund policy
   - Shipping policy
   - Terms of service
3. **Save**

Policies will automatically appear in:
- Footer links
- `/pages` index
- Individual policy routes

## GraphQL Queries Reference

### Shop Information
```graphql
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
```

### Pages List
```graphql
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
```

### Single Page
```graphql
query PageByHandle($handle: String!) {
  page(handle: $handle) {
    id
    title
    handle
    body
    seo {
      title
      description
    }
    createdAt
    updatedAt
  }
}
```

### Policies
```graphql
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
```

## SEO Features

Each page automatically:
- Sets `<title>` tag based on SEO title or page title
- Sets meta description from SEO settings
- Uses semantic HTML for better crawling
- Displays last updated date

## Component Integration

To use store data in any component:

```tsx
import { useStore } from '../context/StoreContext';

function MyComponent() {
  const { shop, pages, policies, loading } = useStore();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome to {shop?.name}</h1>
      <p>{shop?.description}</p>
      
      {/* Show logo if available */}
      {shop?.brand?.logo?.image && (
        <img src={shop.brand.logo.image.url} alt={shop.name} />
      )}
      
      {/* List pages */}
      <ul>
        {pages.map(page => (
          <li key={page.id}>
            <Link to={`/pages/${page.handle}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Features Summary

✅ **Automatic Content Sync** - All pages and settings sync from Shopify Admin
✅ **SEO Optimized** - Meta tags, titles, and semantic HTML
✅ **Dynamic Navigation** - Footer and header update based on available content
✅ **Policy Management** - Legal pages automatically generated
✅ **Store Branding** - Logo, name, description from Shopify settings
✅ **Error Handling** - 404 redirects for missing pages
✅ **Performance** - Data fetched once on app load, cached in context
✅ **Type Safe** - Full TypeScript support for all data structures

## Testing

All existing tests pass with the new implementation:
- ✅ 8/8 unit tests passing
- ✅ No TypeScript errors
- ✅ Compatible with existing cart and auth flows

## Next Steps

To extend functionality:

1. **Add Search**: Implement page search functionality
2. **Add Pagination**: Handle more than 50 pages
3. **Add Blog**: Fetch and display blog articles
4. **Add Menus**: Fetch custom navigation menus from Shopify
5. **Add Metafields**: Display custom metafields on pages
6. **Add Contact Info**: Add phone, email, address fields to footer
