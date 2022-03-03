import { extendMessage, unsubscribeMessage } from '$lib/email-visit/fetchEmailVisit';

export async function handleQueryVisit() {
  const qs = new URLSearchParams(location.search);
  const action = qs.get('action');
  const secret = qs.get('secret');
  const id = qs.get('id');
  let redirectToHome = false;
  if (action !== null) {
    try {
      switch (action) {
        case 'extend-message':
          await extendMessage(id, secret);
          typeof alert('Message has been extended!');
          break;
        case 'unsubscribe-message':
          await unsubscribeMessage(id, secret);
          typeof alert('Message has been unsubscribed!');
          break;
        default:
          throw new Error('Invalid action: ' + action);
      }
    } catch (err) {
      console.error(err);
      redirectToHome = confirm('Error found. Redirect to home? (dev: see console)');
    }
    redirectToHome && location.replace('/');
  }
}
