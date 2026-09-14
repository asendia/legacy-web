# Telegram

The production interface is enabled by `netlify.toml`. Other deploy contexts are disabled by default. It requires the matching `legacy-api` Telegram change and its database migration. Follow the [backend setup instructions](https://github.com/asendia/legacy-api/blob/main/docs/telegram.md) before you enable it.

The production context in `netlify.toml` sets `PUBLIC_TELEGRAM_ENABLED=true`. The build environment sets it to `false` for previews and branch deploys. The app reads the flag at build time so the browser and server use the same value without a separate runtime environment variable. Rebuild and deploy after a change. For rollback, change the production context to `false` and deploy. Repository build settings take precedence over duplicate dashboard values; remove the dashboard flag after the repository deployment is verified. Never put a bot token, Client Secret, or webhook secret in a frontend environment variable.

Existing users can keep Google login and email delivery. To use Telegram login, first sign in with Google, open **Account settings** in the header, and select **Link Telegram**. This links the current account and requires a verified phone claim from Telegram. It does not create a second message account. The backend stores a keyed phone hash rather than the phone number. Telegram sessions last one hour.

The callback URL is `https://sejiwo.com/telegram/callback`. In the BotFather mini app, select the bot, open Login Widget, and select Switch to OpenID Connect Login if the legacy domain field appears. Add the callback under Redirect URIs. Trusted Origins and Native Login are not required for this server-side token exchange. Keep RS256. The login state and a separate browser proof are kept in session storage for five minutes. The callback clears the URL query and uses `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.

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

## Production resources

The bot is `@SejiwoBot`, with public Client ID `8927237838`. The backend owns these values and the secret references; the frontend needs only the public enabled flag. Both backend services use `TELEGRAM_ENABLED=true`. Secret references use `latest`.

The `SendTelegramMessages` job runs daily at 19:48 Asia/Jakarta (`48 19 * * *`), with Pub/Sub attribute `action=send-telegram`. Existing reminder and final-email jobs remain at 19:22 and 19:38. Each invocation attempts at most three Telegram messages; daily scheduling can delay a large queue for several days. See the backend guide for webhook setup and monitoring.

Before merging an activation change, confirm the database migrations, backend settings, and webhook setup. After deployment, sign in with Google, open **Account settings**, select **Link Telegram**, and test login and delivery with a consenting test recipient. A successful build does not verify a live Telegram delivery.

## Account and delivery panels

The header has one login button. It opens Google and Telegram choices, with clear instructions for new accounts. New accounts use Google first; an existing account can add Telegram through Account settings. Account settings also contains the reminder switch and logout.

The Delivery button in the message toolbar opens settings for private recipient links and delivery status. Both panels support keyboard focus, Escape, and narrow mobile screens. Settings load only when their panel opens. Unsaved messages cannot create recipient links.

If a Telegram callback fails, the original Google session stays available. The page shows only known error codes from the backend. Share that code when you report a failure. Do not share the callback URL, token, phone number, or secret. Older backend responses still show a general error.

## Unlink an account

In Account settings, select Unlink in the Telegram row and confirm. This removes Telegram login, revokes all Telegram sessions, cancels pending link requests, and stops pending Telegram reminders. Email, saved messages, and recipient Telegram delivery links stay active. Remove recipient links separately in Delivery settings.

A Google session stays signed in. A Telegram session signs out after unlinking and clears local drafts, as stated in the confirmation. Use Google to sign in again. A failed unlink leaves the interface and session unchanged. Deploy the matching backend unlink action before the frontend.
