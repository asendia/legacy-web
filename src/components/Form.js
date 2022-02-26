import React, { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import NativeSelect from '@mui/material/NativeSelect';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import withStyles from '@mui/styles/withStyles';
import DialogBox from './DialogBox';
import styles from './Form.styles';
import debounce from 'debounce';
import EmailsInput, { createEmailOption } from './EmailsInput';
import { selectMessages, upsertMessage } from '../ApiCallsMessages';

function Form(props) {
  const [messageID, setMessageID] = useState('');
  const [emails, setEmails, emailsValidation, emailsChanged] = useField(
    () => JSON.parse(sessionStorageGetItem('emails')) || [],
    emailsValidator
  );
  const [emailInput, setEmailInput] = useField(
    () => JSON.parse(sessionStorageGetItem('emailInput')) || ''
  );
  const [message, setMessage, messageValidation, messageChanged] = useField(
    () => JSON.parse(sessionStorageGetItem('message')) || '',
    messageValidator
  );
  const [silentPeriod, setSilentPeriod] = useField(() =>
    parseInt(sessionStorageGetItem('silentPeriod') || 180, 10)
  );
  const [reminderInterval, setReminderInterval] = useField(() =>
    parseInt(sessionStorageGetItem('reminderInterval') || 30, 10)
  );
  const [isActive, setIsActive] = useState(() => true);
  const [dialog, setDialog] = useState({ open: false, title: '', text: '' });
  const [isLoading, setIsLoading] = useState(() => false);
  useSessionStorage('emails', emails);
  useSessionStorage('emailInput', emailInput);
  useSessionStorage('message', message);
  useSessionStorage('silentPeriod', silentPeriod);
  useSessionStorage('reminderInterval', reminderInterval);
  const currentUser = props.netlifyIdentity.currentUser();
  const email = currentUser && currentUser.email;
  useEffect(() => {
    if (!email) {
      return;
    }
    async function fetchData() {
      try {
        const dataList = await selectMessages(props.netlifyIdentity);
        const data = dataList[0];
        setMessageID(data.id);
        setEmails(data.emailReceivers.map(createEmailOption));
        setMessage(data.messageContent);
        setSilentPeriod(data.inactivePeriodDays);
        setReminderInterval(data.reminderIntervalDays);
        setIsActive(data.isActive);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    }
    setIsLoading(true);
    fetchData();
  }, []);
  function openDialogInviteRegister() {
    return setDialog({
      open: true,
      title: 'Please login',
      description: 'You need to login first in order to use warisin.com',
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      return openDialogInviteRegister();
    }
    const error = emailsValidation.error || messageValidation.error;
    if (error) {
      setEmails(emails);
      setMessage(message);
      return;
    }
    setIsLoading(true);
    const trimmedMessage = message.trim().replace(/\n\s*\n\s*\n/g, '\n\n');
    try {
      const newMessage = await upsertMessage(
        props.netlifyIdentity,
        messageID,
        emails.map((email) => email.value),
        trimmedMessage,
        silentPeriod,
        reminderInterval,
        isActive
      );
      setMessageID(newMessage.id);
      const message = isActive ? 'activated' : 'deactivated';
      setDialog({
        open: true,
        title: 'Submission complete',
        description: 'Your message has been ' + message,
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }
  return (
    <form
      className={props.classes.container}
      onSubmit={handleSubmit}
      autoComplete={'off'}
    >
      <EmailsInput
        id='emails'
        emails={emails || []}
        emailInput={emailInput}
        onEmailsChange={setEmails}
        onEmailInputChange={(value, action) => {
          if (
            action?.action !== 'input-blur' &&
            action?.action !== 'menu-close'
          ) {
            setEmailInput(value);
          }
        }}
        error={emailsChanged && emailsValidation.error}
        helperText={emailsChanged && emailsValidation.helperText}
      />
      <TextField
        id={'message'}
        label={''}
        autoComplete={'off'}
        className={props.classes.textField}
        value={message}
        error={messageChanged && messageValidation.error}
        helperText={messageChanged && messageValidation.helperText}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        minRows={5}
        maxRows={'50'}
        margin={'normal'}
        hiddenLabel={true}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          style: { fontSize: '14px' },
        }}
        size={'small'}
        variant={'outlined'}
      />
      <FormControl size={'small'} variant={'standard'}>
        <NativeSelect
          value={silentPeriod}
          name='input-silent-period'
          onChange={(e) => setSilentPeriod(parseInt(e.target.value, 10))}
        >
          <option value={90}>After 3 months</option>
          <option value={180}>After 6 months</option>
          <option value={360}>After 12 months</option>
        </NativeSelect>
        <FormHelperText>
          of inactivity, this message will be sent to recipients
        </FormHelperText>
      </FormControl>
      <FormControl size={'small'} variant={'standard'}>
        <NativeSelect
          value={reminderInterval}
          name='input-reminder-interval'
          onChange={(e) => setReminderInterval(parseInt(e.target.value, 10))}
        >
          <option value={15}>Every 15 days</option>
          <option value={30}>Every 30 days</option>
        </NativeSelect>
        <FormHelperText>
          <b>{email ?? 'you'}</b> will receive link to postpone this message
        </FormHelperText>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={isActive}
            disabled={messageID === ''}
            onChange={(e) => {
              if (email) {
                return setIsActive(e.target.checked);
              }
              openDialogInviteRegister();
            }}
            value={''}
            color={'primary'}
          />
        }
        label={'Activate'}
      />
      <Button
        onClick={handleSubmit}
        variant={email ? 'contained' : 'outlined'}
        color={'primary'}
        disabled={isLoading}
        size={'small'}
        style={{ margin: '10px 0 20px 0' }}
      >
        submit
      </Button>
      <DialogBox
        dialog={dialog}
        onClose={() => setDialog({ title: '', open: false })}
        onOk={dialog.handleOk}
      />
    </form>
  );
}

export default withStyles(styles)(Form);

function sessionStorageGetItem(key) {
  return typeof window !== 'undefined' && window.sessionStorage.getItem(key);
}

function emailsValidator(emails) {
  emails = emails || [];
  if (emails.length > 3) {
    return {
      helperText: `${emails.length}/3, max emails allowed are 3`,
      error: true,
    };
  }
  if (emails.length === 0) {
    return {
      helperText: `0/3, must specify at least 1 email`,
      error: true,
    };
  }
  return { helperText: '' };
}

function messageValidator(message) {
  if (message.length < 10) {
    return {
      helperText: `${message.length}/800, min length is 10`,
      error: true,
    };
  }
  if (message.length > 800) {
    return {
      helperText: `${message.length}/800, max length is 800`,
      error: true,
    };
  }
  return { helperText: `${message.length}/800` };
}

function useField(init, validator) {
  // Variable changed is used to make  the error hint shows only when user has *changed* the value
  const [changed, setChanged] = useState(false);
  const [value, setValue] = useState(init);
  const validation = useMemo(
    () => validator && validator(value),
    [value, validator]
  );
  return [
    value,
    (value) => {
      setChanged(true);
      setValue(value);
    },
    validation,
    changed,
  ];
}

function useSessionStorage(key, value) {
  const sessionStorageSetItem = useMemo(
    () =>
      debounce((value) => {
        typeof window !== 'undefined' &&
          window.sessionStorage.setItem(key, JSON.stringify(value));
      }, 500),
    [key]
  );
  useEffect(() => {
    sessionStorageSetItem(value);
  }, [value, sessionStorageSetItem]);
}
