import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

type PolicyType = 'privacy-policy' | 'refund-policy' | 'shipping-policy' | 'terms-of-service';

const PolicyPage: React.FC = () => {
  const { type } = useParams<{ type: PolicyType }>();
  const { policies, loading } = useStore();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading policy...
      </div>
    );
  }

  let policy = null;
  switch (type) {
    case 'privacy-policy':
      policy = policies.privacyPolicy;
      break;
    case 'refund-policy':
      policy = policies.refundPolicy;
      break;
    case 'shipping-policy':
      policy = policies.shippingPolicy;
      break;
    case 'terms-of-service':
      policy = policies.termsOfService;
      break;
  }

  if (!policy) {
    return <Navigate to="/pages" replace />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{policy.title}</h1>
        </header>
        
        <div
          style={{
            lineHeight: '1.8',
            fontSize: '1.1rem',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </article>
    </div>
  );
};

export default PolicyPage;
