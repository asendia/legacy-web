import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import Form from './components/Form';
import { getParameterByName } from './QueryString';
import { extendMessage, unsubscribeMessage } from './ApiCalls';

const theme = createTheme();

function App() {
  const [netlifyIdentity, setNetlifyIdentity] = useState(null);
  const hasGotrue = localStorage?.getItem('gotrue.user') !== null;
  // Redirect from netlify login form
  const hasBearerHash =
    location?.hash?.includes('access_token') &&
    location?.hash?.includes('token_type=bearer');
  const [loadNetlify, setLoadNetlify] = useState(hasGotrue || hasBearerHash);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    async function initNetlify() {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      netlifyIdentity.init({
        container: '#netlify-modal', // defaults to document.body,
      });
      !hasGotrue && !hasBearerHash && netlifyIdentity?.open('login');
      // netlifyIdentity.on('open', () => console.log('Widget opened'));
      // netlifyIdentity.on('close', () => console.log('Widget closed'));
    }
    loadNetlify && initNetlify();
  }, [loadNetlify]);
  useEmailActionsQueryParser();
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <Header />
        <div className='App-intro'>
          <LoginButton
            username={netlifyIdentity?.currentUser()?.email}
            isLoading={isLoading}
            onLogin={() => {
              setLoadNetlify(true);
              netlifyIdentity?.open('login');
            }}
            onLogout={() => {
              setIsLoading(true);
              netlifyIdentity?.logout();
            }}
          />
          <Form
            key={netlifyIdentity?.currentUser()?.email}
            netlifyIdentity={netlifyIdentity}
          />
        </div>
        <Footer />
      </ThemeProvider>
    </div>
  );
}

function useEmailActionsQueryParser() {
  useEffect(() => {
    async function callApi() {
      const action = getParameterByName('action');
      const secret = getParameterByName('secret');
      const id = getParameterByName('id');
      if (action !== null) {
        switch (action) {
          case 'extend-message':
            await extendMessage(id, secret);
            typeof window !== 'undefined' &&
              window.alert('Message has been extended!');
            break;
          case 'unsubscribe-message':
            await unsubscribeMessage(id, secret);
            typeof window !== 'undefined' &&
              window.alert('Message has been unsubscribed!');
            break;
          default:
            window.alert('Invalid action!');
            break;
        }
        typeof window !== 'undefined' && window.location.replace('/');
        return;
      }
    }
    callApi();
  }, []);
}

export default App;
