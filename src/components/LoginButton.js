import React from 'react';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import oc from '../OptionalChaining';

const styles = (theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetings: {
    marginRight: '10px',
    fontSize: '14px',
  },
});

function LoginButton(props) {
  function handleLogin() {
    props.netlifyIdentity.open('login');
  }
  function handleLogout() {
    props.netlifyIdentity.logout();
  }
  const { classes, isLoading, user } = props;
  const text =
    oc(user, 'user_metadata.full_name') || oc(user, 'email') || 'User';
  return (
    <div className={classes.wrapper}>
      {user ? (
        <React.Fragment>
          <div className={classes.greetings}>Hello, {text}</div>
          <Button
            onClick={handleLogout}
            variant={'outlined'}
            color={'inherit'}
            disabled={isLoading}
            size={'small'}
          >
            logout
          </Button>
        </React.Fragment>
      ) : (
        <>
          <div className={classes.greetings}>Testament in the cloud</div>
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

export default withStyles(styles)(LoginButton);
