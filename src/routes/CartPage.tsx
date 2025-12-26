import React from 'react';
import { useCart } from '../context/CartContext';
import { Image, useMoney } from '@shopify/hydrogen-react';

function Money({ amount, currencyCode }: { amount: string; currencyCode: string }) {
  const money = useMoney({ amount, currencyCode });
  return <>{money.localizedString}</>;
}

const CartPage: React.FC = () => {
  const { cart, loading, error, updateLineQuantity, removeLine } = useCart();

  if (loading && !cart) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!cart || !cart.lines.length) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div>
      <h1>Your Cart</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cart.lines.map((line) => (
          <li
            key={line.id}
            style={{
              borderBottom: '1px solid #eee',
              padding: '0.5rem 0',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            {line.merchandise.image && (
              <Image
                data={line.merchandise.image}
                alt={line.merchandise.image.altText ?? line.merchandise.productTitle}
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div>{line.merchandise.productTitle}</div>
              <div>{line.merchandise.title}</div>
              <div>
                <Money
                  amount={line.cost.totalAmount.amount}
                  currencyCode={line.cost.totalAmount.currencyCode}
                />
              </div>
              <div>
                Qty:{' '}
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLineQuantity(line.id, Number(e.target.value))}
                  style={{ width: '4rem' }}
                />
              </div>
            </div>
            <button onClick={() => removeLine(line.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1rem' }}>
        <strong>
          Subtotal:{' '}
          <Money
            amount={cart.estimatedCost.subtotalAmount.amount}
            currencyCode={cart.estimatedCost.subtotalAmount.currencyCode}
          />
        </strong>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <a href={cart.checkoutUrl} target="_blank" rel="noopener noreferrer">
          <button>Proceed to Checkout</button>
        </a>
      </div>
    </div>
  );
};

export default CartPage;