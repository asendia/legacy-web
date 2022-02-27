import { netlifyIdentity } from 'netlify-identity-widget';
import React, { useState, useEffect } from 'react';

const UserContext = React.createContext();

function UserContextProvider(props) {
  const [identity, setNetlifyIdentity] = useState(null);

  useEffect(() => {
    async function initNetlify() {
      netlifyIdentity = await import('netlify-identity-widget');
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
      // netlifyIdentity.on('open', () => console.log('Widget opened'));
      // netlifyIdentity.on('close', () => console.log('Widget closed'));
    }
    initNetlify();
  }, []);
  return (
    <UserContext.Provider
      value={{
        netlifyIdentity: identity,
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
