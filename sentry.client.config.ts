// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b60d9b2de48c4ad2cfd017e9885f7bf6@o4507160490016768.ingest.us.sentry.io/4507160503779328",
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0,
});
