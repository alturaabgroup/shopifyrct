# Environment Configuration Guide

## How to Set Up Environment Variables

### 1. Shopify Configuration

#### Getting Your Shopify Credentials:

1. **Log into your Shopify Admin**
2. Navigate to: **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **"Create an app"** or select an existing custom app
4. Go to **"API credentials"** tab
5. Under **Storefront API**, click **"Configure"** or **"Install app"**
6. Copy the following:
   - **Store Domain**: `your-store.myshopify.com`
   - **Storefront API access token**: This is your `VITE_SHOPIFY_STOREFRONT_API_TOKEN`

#### Required Storefront API Scopes:
Make sure your app has these permissions:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_product_tags`
- `unauthenticated_write_customers` (for registration)
- `unauthenticated_read_customers` (for login)
- `unauthenticated_write_checkouts` (for cart)

### 2. Firebase Configuration

#### Getting Your Firebase Credentials:

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. Select your project or create a new one
3. Click the **gear icon** → **Project settings**
4. Scroll down to **"Your apps"** section
5. If no web app exists, click **"Add app"** and select **Web (</> icon)**
6. Copy the config values:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",           // → VITE_FIREBASE_API_KEY
     authDomain: "...",       // → VITE_FIREBASE_AUTH_DOMAIN
     projectId: "...",        // → VITE_FIREBASE_PROJECT_ID
     storageBucket: "...",    // → VITE_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "...", // → VITE_FIREBASE_MESSAGING_SENDER_ID
     appId: "..."             // → VITE_FIREBASE_APP_ID
   };
   ```

#### Getting VAPID Key (for Push Notifications):

1. In Firebase Console, go to **Project settings**
2. Click the **"Cloud Messaging"** tab
3. Scroll to **"Web Push certificates"**
4. Click **"Generate key pair"** if not already generated
5. Copy the **Key pair** value → This is your `VITE_FIREBASE_VAPID_KEY`

#### Enable Firebase Services:

1. **Authentication**: Go to **Authentication** → **Sign-in method** → Enable **Email/Password**
2. **Cloud Messaging**: Ensure FCM is enabled in **Project settings** → **Cloud Messaging**

### 3. Update Your .env File

Copy [.env.example](.env.example) to `.env` and replace all placeholder values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Shopify Configuration
VITE_SHOPIFY_STORE_DOMAIN=my-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_API_TOKEN=shpat_abc123def456...

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAbc123...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-123
VITE_FIREBASE_STORAGE_BUCKET=my-project-123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BKxyz789...
```

### 4. Restart Development Server

After updating `.env`, restart the dev server:

```bash
npm run dev
```

## Important Notes

- **`.env` is git-ignored** to prevent exposing secrets
- **Never commit `.env`** to version control
- Use **`.env.example`** as a template for team members
- Vite only loads env vars prefixed with `VITE_`
- Changes to `.env` require a server restart

## Testing Your Configuration

Once configured, you should be able to:
- ✅ Browse products from your Shopify store
- ✅ Add items to cart
- ✅ Register/login customers
- ✅ Receive push notifications (if VAPID key is configured)

If you see API errors, double-check:
1. Storefront API token has correct scopes
2. Store domain is correct (include `.myshopify.com`)
3. Firebase project settings match your app
4. All environment variables are properly set
