import { useState, useEffect, useMemo } from 'react';
import { createEmailOption } from './EmailsInput';
import { selectMessages } from '../APIMessages';
import debounce from 'debounce';

export function useForm(props) {
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
  const currentUser = props.netlifyIdentity?.currentUser();
  const email = currentUser?.email;
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
  return {
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
  };
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
