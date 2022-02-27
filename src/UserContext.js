import React, { useState, useEffect } from 'react';

const UserContext = React.createContext();

function UserContextProvider(props) {
  const [identity, setNetlifyIdentity] = useState(null);
  const hasGotrue = localStorage?.getItem('gotrue.user') !== null;
  // Redirect from netlify login form
  const hasBearerHash =
    location?.hash?.includes('access_token') &&
    location?.hash?.includes('token_type=bearer');
  const [loadNetlify, setLoadNetlify] = useState(hasGotrue || hasBearerHash);

  useEffect(() => {
    async function initNetlify() {
      const netlifyIdentity = await import('netlify-identity-widget');
      netlifyIdentity.init({
        container: '#netlify-modal', // defaults to document.body,
      });
      netlifyIdentity.on('init', () => {
        setNetlifyIdentity({ ...netlifyIdentity });
      });
      netlifyIdentity.on('login', () => {
        setNetlifyIdentity({ ...netlifyIdentity });
        netlifyIdentity.close();
      });
      netlifyIdentity.on('logout', () => {
        window.sessionStorage?.clear();
        setNetlifyIdentity({ ...netlifyIdentity });
      });
      netlifyIdentity.on('error', (err) => {
        console.error('Netlify error:', err);
        setNetlifyIdentity({ ...netlifyIdentity });
      });
      setNetlifyIdentity(netlifyIdentity);
      !hasGotrue && netlifyIdentity?.open('login');
      // netlifyIdentity.on('open', () => console.log('Widget opened'));
      // netlifyIdentity.on('close', () => console.log('Widget closed'));
    }
    loadNetlify && initNetlify();
  }, [loadNetlify]);
  return (
    <UserContext.Provider
      value={{
        netlifyIdentity: identity,
        setLoadNetlify,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export default {
  Provider: UserContextProvider,
  Consumer: UserContext.Consumer,
};
