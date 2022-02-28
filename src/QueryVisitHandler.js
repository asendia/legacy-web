import { getParameterByName } from './QueryString';
import { extendMessage, unsubscribeMessage } from './APIWithSecret';

import { useEffect } from 'react';

// Visit url from emails (e.g. unsubscribe, extend)
export function useQueryVisitHandler() {
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
