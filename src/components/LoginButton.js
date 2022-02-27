import React from 'react';
import Button from '@mui/material/Button';

function LoginButton(props) {
  function handleLogin() {
    props.netlifyIdentity.open('login');
  }
  function handleLogout() {
    props.netlifyIdentity.logout();
  }
  const { isLoading, user } = props;
  const text =
    user?.user_metadata?.full_name || user?.email || 'User';
  const greetingsStyle = { marginRight: '10px', fontSize: '14px' };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {user ? (
        <>
          <div style={greetingsStyle}>Hello, {text}</div>
          <Button
            onClick={handleLogout}
            variant={'outlined'}
            color={'inherit'}
            disabled={isLoading}
            size={'small'}
          >
            logout
          </Button>
        </>
      ) : (
        <>
          <div style={greetingsStyle}>Testament in the cloud</div>
          <Button
            onClick={handleLogin}
            variant={'outlined'}
            color={'primary'}
            disabled={isLoading}
            size={'small'}
          >
            login
          </Button>
        </>
      )}
    </div>
  );
}

export default LoginButton;
