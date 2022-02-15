import React, { useState, useEffect, useMemo } from 'react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { generateHeaders } from '../ApiCalls';
import DialogBox from './DialogBox';
import styles from './Form.styles';
import debounce from 'debounce';
import EmailsInput, { createEmailOption } from './EmailsInput';

function Form(props) {
  const [messageID, setMessageID] = useState('');
  const [emails, setEmails, emailsValidation, emailsChanged] = useField(() => JSON.parse(sessionStorageGetItem('emails')) || [], emailsValidator);
  const [emailInput, setEmailInput] = useField(() => JSON.parse(sessionStorageGetItem('emailInput')) || '');
  const [message, setMessage, messageValidation, messageChanged] = useField(() => JSON.parse(sessionStorageGetItem('message')) || '', messageValidator);
  const [silentPeriod, setSilentPeriod] = useField(() => parseInt(sessionStorageGetItem('silentPeriod') || 180, 10));
  const [reminderInterval, setReminderInterval] = useField(() => parseInt(sessionStorageGetItem('reminderInterval') || 30, 10));
  const [isActive, setIsActive] = useState(() => true);
  const [dialog, setDialog] = useState({ open: false, title: '', text: '', });
  const [isLoading, setIsLoading] = useState(() => false);
  useSessionStorage('emails', emails);
  useSessionStorage('emailInput', emailInput);
  useSessionStorage('message', message);
  useSessionStorage('silentPeriod', silentPeriod);
  useSessionStorage('reminderInterval', reminderInterval);
  const currentUser = props.netlifyIdentity.currentUser();
  const email = currentUser && currentUser.email;
  useEffect(() => {
    if (!email) { return; }
    async function fetchData() {
      try {
        const headers = await generateHeaders(props.netlifyIdentity);
        const res = await axios.get(
          'https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=select-messages',
          { headers },
        );
        const dataList = res.data.data;
        if (!Array.isArray(dataList) || dataList.length === 0) {
          throw new Error('dataList is invalid', dataList);
        }
        const data = dataList[0];
        setMessageID(data.id);
        setEmails(data.emailReceivers.map(createEmailOption));
        setMessage(data.messageContent);
        setSilentPeriod(data.inactivePeriodDays);
        setReminderInterval(data.reminderIntervalDays);
        setIsActive(data.isActive);
      } catch (err) {}
    }
    fetchData();
  }, []);
  function openDialogInviteRegister() {
    return setDialog({
      open: true,
      title: 'Please login',
      description: 'You need to login first in order to try Warisin',
    });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { return openDialogInviteRegister(); }
    const error = emailsValidation.error || messageValidation.error;
    if (error) {
      setEmails(emails);
      setMessage(message);
      return;
    }
    setIsLoading(true);
    const trimmedMessage = message.trim().replace(/\n\s*\n\s*\n/g, '\n\n');
    try {
      const headers = await generateHeaders(props.netlifyIdentity);
      const action = messageID === '' ? 'insert-message' : 'update-message'
      const res = await axios.post(
        `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=${action}`,
        {
          id: messageID,
          emailReceivers: emails.map(email => email.value),
          messageContent: trimmedMessage,
          inactivePeriodDays: silentPeriod,
          reminderIntervalDays: reminderInterval,
          isActive,
        },
        { headers },
      );
      const newMessageID = res.data.data.id;
      setMessageID(newMessageID);
      const message = isActive ?
        ' and ACTIVATED' :
        ' but NOT YET ACTIVE. Check the activation toggle and click submit to activate';
      setDialog({
        open: true,
        title: 'Submission complete',
        description: 'Your testament has been submitted' + message,
      });
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }
  return (
    <form className={props.classes.container} onSubmit={handleSubmit}>
      <EmailsInput
        id='emails'
        emails={emails || []}
        emailInput={emailInput}
        onEmailsChange={setEmails}
        onEmailInputChange={(e) => {
          setEmailInput(e);
        }}
        error={emailsChanged && emailsValidation.error}
        helperText={emailsValidation.helperText}
      />
      <TextField
        id='message'
        label='Testament message'
        autoComplete='off'
        className={props.classes.textField}
        value={message}
        error={messageChanged && messageValidation.error}
        helperText={messageValidation.helperText}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        rowsMax='20'
        margin='normal'
      />
      <FormControl className={props.classes.formControl}>
        <InputLabel shrink htmlFor='input-silent-period'>
          Inactive period
        </InputLabel>
        <NativeSelect
          className={props.classes.selectEmpty}
          value={silentPeriod}
          name='input-silent-period'
          onChange={(e) => setSilentPeriod(parseInt(e.target.value, 10))}
        >
          <option value={90}>After 3 months</option>
          <option value={180}>After 6 months</option>
          <option value={360}>After 12 months</option>
        </NativeSelect>
        <FormHelperText>Total inactive time until your message is sent to receivers' emails</FormHelperText>
      </FormControl>
      <FormControl className={props.classes.formControl}>
        <InputLabel shrink htmlFor='input-reminder-interval'>
          Reminder interval
        </InputLabel>
        <NativeSelect
          className={props.classes.selectEmpty}
          value={reminderInterval}
          name='input-reminder-interval'
          onChange={(e) => setReminderInterval(parseInt(e.target.value, 10))}
        >
          <option value={15}>Every 15 days</option>
          <option value={30}>Every 30 days</option>
        </NativeSelect>
        <FormHelperText>Time interval in which refresh link will be sent to <b>{email}</b>. If reset link is visited, inactive period will reset</FormHelperText>
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
            value=''
            color='primary'
          />
        }
        className={props.classes.switch}
        label='Enable this testament'
      />
      <Button
        onClick={handleSubmit}
        variant='contained'
        color='primary'
        className={props.classes.button}
        disabled={isLoading}
      >
        submit
      </Button>
      <DialogBox
        dialog={dialog}
        onClose={() => setDialog({ title: '', open: false })}
        onOk={dialog.handleOk} />
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
    return { helperText: `${emails.length}/3, max emails allowed are 3`, error: true };
  }
  if (emails.length === 0) {
    return { helperText: `${emails.length}/3, must specify at least 1 email`, error: true };
  }
  return { helperText: `${emails.length}/3 emails` };
}

function messageValidator(message) {
  if (message.length < 10) {
    return { helperText: `${message.length}/800, message too short, min length is 10`, error: true };
  }
  if (message.length > 800) {
    return { helperText: `${message.length}/800, message too long, max length is 800`, error: true };
  }
  return { helperText: `${message.length}/800` };
}

function useField(init, validator) {
  // Variable changed is used to make  the error hint shows only when user has *changed* the value
  const [changed, setChanged] = useState(false);
  const [value, setValue] = useState(init);
  const validation = useMemo(() => validator && validator(value), [value, validator]);
  return [value,
    (value) => {
      setChanged(true);
      setValue(value);
    },
    validation,
    changed,
  ];
}

function useSessionStorage(key, value) {
  const sessionStorageSetItem = useMemo(() => debounce((value) => {
    typeof window !== 'undefined' && window.sessionStorage.setItem(key, JSON.stringify(value));
  }, 500), [key]);
  useEffect(() => {
    sessionStorageSetItem(value);
  }, [value, sessionStorageSetItem]);
}
