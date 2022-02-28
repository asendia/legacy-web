import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import Form from './components/Form';
import { getParameterByName } from './QueryString';
import { extendMessage, unsubscribeMessage } from './ApiCalls';
import { useNetlifyIdentity } from './NetlifyIdentity';

const theme = createTheme();

function App() {
  const { netlifyIdentity, login, logout, isLoading } = useNetlifyIdentity();
  useEmailActionsQueryParser();
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <LoginButton
        username={netlifyIdentity?.currentUser()?.email}
        isLoading={isLoading}
        onLogin={() => {
          login();
        }}
        onLogout={() => {
          logout();
        }}
      />
      <Form
        key={netlifyIdentity?.currentUser()?.email}
        netlifyIdentity={netlifyIdentity}
      />
      <Footer />
    </ThemeProvider>
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
