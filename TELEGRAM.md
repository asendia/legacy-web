# Telegram

The interface is disabled by default. It requires the matching `legacy-api` Telegram change and its database migration. Follow the [backend setup instructions](https://github.com/asendia/legacy-api/blob/codex/telegram-delivery/docs/telegram.md) before you enable it.

In Netlify, set `PUBLIC_TELEGRAM_ENABLED=true` and deploy after the backend, webhook, and queue job are ready. Set it to `false` to hide the interface. Never put a bot token, Client Secret, or webhook secret in a frontend environment variable.

Existing users can keep Google login and email delivery. To use Telegram login, first sign in with Google and select **Link Telegram**. This links the current account and requires a verified phone claim from Telegram. It does not create a second message account. The backend stores a keyed phone hash rather than the phone number. Telegram sessions last one hour.

The callback URL is `https://sejiwo.com/telegram/callback`. Register it in BotFather with the website origin `https://sejiwo.com`. The login state and a separate browser proof are kept in session storage for five minutes. The callback clears the URL query and uses `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.

Writers can turn on Telegram reminders and create private links for saved recipients. Each recipient must open their link and press **Start** once. No deed approval or verification code is required. Email remains active. The interface shows **Email only**, **Waiting for the recipient to press Start**, or **Telegram connected**. Use **Refresh recipient status** after the recipient connects.

Bot chats do not have end-to-end encryption. Use CLIENT-AES for encrypted final text and give the recipient the password through a separate channel. The app does not claim that a Telegram phone number proves a person's identity.

## Checks

```sh
npm run check
npm run lint
npm run test:unit -- --run
npm run build
npx playwright test
TEST_TELEGRAM=true npx playwright test --config playwright.telegram.config.ts
```

The separate Telegram browser tests use a local server and mock all API calls. They check account continuity, rejected login state, reminders, and recipient links. The normal test configuration leaves Telegram disabled.

A real bot is still required to test Telegram login, consent, webhook delivery, and messages before production enablement. Keep Netlify preview deployments disabled unless they use an isolated backend and an allowed login URL.
