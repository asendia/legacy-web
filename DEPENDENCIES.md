# Dependency checks

Use Node 24.20.0 and npm 12.0.2. Netlify uses these versions. The npm engine check rejects older npm versions that can ignore the release-age rule.

Netlify uses `NPM_VERSION` for its install step. Its build shell can still use the npm version bundled with Node. The build command therefore installs the exact `npm@12.0.2` release into the temporary Netlify build environment first. It then uses normal `npm` commands. This does not change your local npm installation. The npm upgrade also has install scripts disabled.

The repository `.npmrc` sets a seven-day minimum release age. It also disables automatic install scripts and blocks Git and direct URL dependencies. All package sources in the lockfile must use `https://registry.npmjs.org/`. Direct dependency versions are exact.

For a clean install, use:

```sh
npm ci
npm audit
npm audit signatures
npm run prepare
npm run check
npm run lint
npm run test:unit -- --run
npm run build
```

Automatic install scripts stay disabled. `npm run` executes only the named script. The build works without the esbuild and fsevents install scripts. Do not enable all install scripts to fix an install error.

For updates, check the package owner, release notes, release date, source URLs, new dependencies, and install scripts. Keep `package-lock.json` in the PR. Run the audit and signature checks before the build. Do not use `npm audit fix --force` or disable the age rule for the full tree. A security fix that is less than seven days old needs a separate review and a limited exception.

Package age, signatures, and provenance reduce risk. They do not prove that package code is safe. A clean vulnerability scan only covers known reports at the time of the scan.

## Version choices

- Keep Vite 7 and TypeScript 5 on their current patch releases. A major compiler or bundler change needs a separate review.
- Use Vitest 5 and its Playwright provider to remove the test-server advisories.
- Override `cookie` to 0.7.2. This fixes invalid cookie attribute handling while retaining the existing parse and serialize API. Remove the override when the upstream dependency is fixed.
- Keep CryptoJS 4.2.0 for stored message compatibility. It has no later release and is no longer maintained. A replacement must prove that it can read existing encrypted messages before release.
- Node 24.21.0 and some dependency releases were less than seven days old on 2026-09-14. They are not part of this update.

Run the existing browser tests and Telegram tests separately. Use a free port for the existing tests:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:4195 npm run test:e2e -- --grep-invert 'Telegram|writer can enable'
TEST_TELEGRAM=true npm run test:e2e -- --config playwright.telegram.config.ts
```

Browser tests use test API responses. Before production use, also check the Netlify preview and complete the live Telegram steps in `TELEGRAM.md`.
