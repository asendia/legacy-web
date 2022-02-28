import { useEffect, useState, useCallback } from 'react';

export function useNetlifyIdentity() {
  const [netlifyIdentity, setNetlifyIdentity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  async function initNetlify() {
    setIsLoading(true);
    const netlifyIdentity = await import('netlify-identity-widget');
    netlifyIdentity.on('init', () => {
      setNetlifyIdentity({ ...netlifyIdentity });
      setIsLoading(false);
    });
    netlifyIdentity.on('login', () => {
      setNetlifyIdentity({ ...netlifyIdentity });
      netlifyIdentity.close();
      setIsLoading(false);
    });
    netlifyIdentity.on('logout', () => {
      window.sessionStorage?.clear();
      setNetlifyIdentity({ ...netlifyIdentity });
      setIsLoading(false);
    });
    netlifyIdentity.on('error', (err) => {
      console.error('Netlify error:', err);
      setNetlifyIdentity({ ...netlifyIdentity });
      setIsLoading(false);
    });
    // netlifyIdentity.on('open', () => console.log('Widget opened'));
    netlifyIdentity.on('close', () => setIsLoading(false));
    netlifyIdentity.init({
      container: '#netlify-modal', // defaults to document.body,
    });
    return netlifyIdentity;
  }
  useEffect(() => {
    const hasGotrue = localStorage?.getItem('gotrue.user') !== null;
    // Redirect from netlify login form
    const hasBearerHash =
      location?.hash?.includes('access_token') &&
      location?.hash?.includes('token_type=bearer');
    (hasGotrue || hasBearerHash) && initNetlify();
  }, []);
  return {
    netlifyIdentity,
    initNetlify,
    isLoading,
    login: async () => {
      setIsLoading(true);
      const netlifyIdentity = await initNetlify();
      netlifyIdentity?.open('login');
    },
    logout: () => {
      setIsLoading(true);
      netlifyIdentity?.logout();
    },
  };
}
