import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import NativeSelect from '@mui/material/NativeSelect';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DialogBox from './DialogBox';
import EmailsInput from './EmailsInput';
import { upsertMessage } from '../APIMessages';
import { styles } from './Form.styles';
import { useForm } from './FormHooks';

function Form(props) {
  const {
    messageID,
    setMessageID,
    emails,
    setEmails,
    emailsValidation,
    emailsChanged,
    emailInput,
    setEmailInput,
    message,
    setMessage,
    messageValidation,
    messageChanged,
    silentPeriod,
    setSilentPeriod,
    reminderInterval,
    setReminderInterval,
    isActive,
    setIsActive,
    dialog,
    setDialog,
    isLoading,
    setIsLoading,
    email,
  } = useForm(props);
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
  const formComponent = (
    <form style={styles.form} onSubmit={handleSubmit} autoComplete={'off'}>
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
        value={message}
        error={messageChanged && messageValidation.error}
        helperText={messageChanged && messageValidation.helperText}
        FormHelperTextProps={{ style: { marginLeft: 0 } }}
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
      <FormControl
        size={'small'}
        variant={'standard'}
        style={styles.formControl}
      >
        <NativeSelect
          value={silentPeriod}
          name='input-silent-period'
          onChange={(e) => setSilentPeriod(parseInt(e.target.value, 10))}
        >
          <option value={90}>After 3 months</option>
          <option value={180}>After 6 months</option>
          <option value={360}>After 12 months</option>
        </NativeSelect>
        <FormHelperText style={styles.formHelperText}>
          of inactivity, this message will be sent to recipients
        </FormHelperText>
      </FormControl>
      <FormControl
        size={'small'}
        variant={'standard'}
        style={styles.formControl}
      >
        <NativeSelect
          value={reminderInterval}
          name='input-reminder-interval'
          onChange={(e) => setReminderInterval(parseInt(e.target.value, 10))}
        >
          <option value={15}>Every 15 days</option>
          <option value={30}>Every 30 days</option>
        </NativeSelect>
        <FormHelperText style={styles.formHelperText}>
          <b>{email ?? 'you'}</b> will receive a link to postpone this message
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
  return formComponent;
}

export default Form;
