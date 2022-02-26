import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import './App.css';
import Form from './components/Form';
import { getParameterByName } from './QueryString';
import {
  protractTestamentOld,
  unsubscribeTestamentOld,
  extendMessage,
  unsubscribeMessage,
} from './ApiCalls';
import UserContext from './UserContext';

// This is ugly, probably I use it wrong, will figure it out later
const theme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: '8px 0',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          lineHeight: '1.4',
          fontWeight: '300',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        input: {
          fontSize: '0.9rem',
        },
      },
    },
    // Toggle label
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
        },
      },
    },
  },
});

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
                  <LoginButton user={user} netlifyIdentity={netlifyIdentity} />
                  <Form
                    key={user && user.email}
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
      const mode = getParameterByName('mode');
      const token = getParameterByName('token');
      if (token && mode && id && token.length >= 64) {
        try {
          switch (mode) {
            case 'protract':
              await protractTestamentOld(id, token);
              typeof window !== 'undefined' &&
                window.alert('Protraction success!');
              break;
            case 'unsubscribe': {
              const email = getParameterByName('email');
              await unsubscribeTestamentOld(id, token, email);
              typeof window !== 'undefined' &&
                window.alert('Unsubscribe success!');
              break;
            }
            default:
              window.alert('Invalid mode.');
              break;
          }
        } catch (err) {}
        typeof window !== 'undefined' && window.location.replace('/');
      }
    }
    callApi();
  });
}

export default App;
