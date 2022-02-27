import React from 'react';
import Button from '@mui/material/Button';

function LoginButton(props) {
  const { isLoading, username } = props;
  const greetingsStyle = { marginRight: '10px', fontSize: '14px' };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {username ? (
        <>
          <div style={greetingsStyle}>Hello, {username}</div>
          <Button
            onClick={() => props.onLogout && props.onLogout()}
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
            onClick={() => props.onLogin && props.onLogin()}
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
