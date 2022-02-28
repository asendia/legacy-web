import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import Form from './components/Form';
import { useNetlifyIdentity } from './NetlifyIdentity';
import { useQueryVisitHandler } from './QueryVisitHandler';

const theme = createTheme();

function App() {
  const { netlifyIdentity, login, logout, isLoading } = useNetlifyIdentity();
  useQueryVisitHandler();
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <LoginButton
        username={netlifyIdentity?.currentUser()?.email}
        isLoading={isLoading}
        onLogin={login}
        onLogout={logout}
      />
      <Form
        key={netlifyIdentity?.currentUser()?.email}
        netlifyIdentity={netlifyIdentity}
      />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
