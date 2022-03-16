import { extendMessage, unsubscribeMessage } from '$lib/query-string/queryStringFetcher';

// Query string visit for unsubsribe & extend message
export async function handleQueryVisit(
  messageExtendedAlert: string,
  messageUnsubscribedAlert: string,
  queryActionErrorAlert: string,
) {
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
          alert(messageExtendedAlert);
          break;
        case 'unsubscribe-message':
          await unsubscribeMessage(id, secret);
          alert(messageUnsubscribedAlert);
          break;
        default:
          throw new Error('Invalid action: ' + action);
      }
    } catch (err) {
      console.error(err);
      redirectToHome = confirm(queryActionErrorAlert);
    }
    redirectToHome && location.replace('/');
  }
}
