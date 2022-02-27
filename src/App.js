import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import './App.css';
import Form from './components/Form';
import { getParameterByName } from './QueryString';
import { extendMessage, unsubscribeMessage } from './ApiCalls';
import UserContext from './UserContext';

const theme = createTheme();

function App() {
  useEmailActionsQueryParser();
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <UserContext.Provider>
          <Header />
          <div className='App-intro'>
            <UserContext.Consumer>
              {({ user, netlifyIdentity }) => (
                <React.Fragment>
                  <LoginButton
                    username={user?.user_metadata?.full_name || user?.email}
                    onLogin={() => netlifyIdentity.open('login')}
                    onLogout={() => netlifyIdentity.logout()}
                  />
                  <Form
                    key={user?.email}
                    netlifyIdentity={netlifyIdentity}
                  />
                </React.Fragment>
              )}
            </UserContext.Consumer>
          </div>
          <Footer />
        </UserContext.Provider>
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
