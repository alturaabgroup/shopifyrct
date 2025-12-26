import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const PagesListPage: React.FC = () => {
  const { pages, policies, loading, error } = useStore();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading pages...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: 'red' }}>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const hasPages = pages.length > 0;
  const hasPolicies = Object.values(policies).some(policy => policy !== null);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Information Pages</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Browse our helpful pages and policies
      </p>

      {hasPages && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
            Pages
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pages.map((page) => (
              <li key={page.id} style={{ marginBottom: '1.5rem' }}>
                <Link
                  to={`/pages/${page.handle}`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    display: 'block',
                    padding: '1rem',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8f8f8';
                    e.currentTarget.style.borderColor = '#000';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#eee';
                  }}
                >
                  <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                    {page.title}
                  </h3>
                  {page.bodySummary && (
                    <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                      {page.bodySummary.substring(0, 150)}
                      {page.bodySummary.length > 150 ? '...' : ''}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasPolicies && (
        <section>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
            Policies
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {policies.privacyPolicy && (
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to={`/pages/policies/privacy-policy`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    display: 'block',
                    padding: '0.75rem',
                    border: '1px solid #eee'
                  }}
                >
                  {policies.privacyPolicy.title}
                </Link>
              </li>
            )}
            {policies.termsOfService && (
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to={`/pages/policies/terms-of-service`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    display: 'block',
                    padding: '0.75rem',
                    border: '1px solid #eee'
                  }}
                >
                  {policies.termsOfService.title}
                </Link>
              </li>
            )}
            {policies.refundPolicy && (
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to={`/pages/policies/refund-policy`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    display: 'block',
                    padding: '0.75rem',
                    border: '1px solid #eee'
                  }}
                >
                  {policies.refundPolicy.title}
                </Link>
              </li>
            )}
            {policies.shippingPolicy && (
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to={`/pages/policies/shipping-policy`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    display: 'block',
                    padding: '0.75rem',
                    border: '1px solid #eee'
                  }}
                >
                  {policies.shippingPolicy.title}
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {!hasPages && !hasPolicies && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No pages available at this time.</p>
        </div>
      )}
    </div>
  );
};

export default PagesListPage;
